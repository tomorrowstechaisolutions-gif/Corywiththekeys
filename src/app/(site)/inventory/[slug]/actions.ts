"use server";

import { CONTACT } from "@/lib/constants";
import { serverEnv } from "@/lib/env";
import { evaluateBot } from "@/lib/security/bot";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getRequestMeta } from "@/lib/security/request-meta";
import { logSubmission } from "@/lib/security/submissions";
import { createAdminClient } from "@/lib/supabase/server";
import { vehicleTitle } from "@/lib/vehicles";
import {
  VehicleInquirySchema,
  buildInquiryMessage,
} from "@/lib/validation/vehicle-inquiry";

export type InquiryState = {
  ok?: boolean;
  code?: "validation" | "rate_limit" | "bot_check" | "unavailable" | "server";
  message?: string;
  fieldErrors?: Record<string, string>;
};

const FORM_KEY = "vehicle_inquiry";

const CALL_INSTEAD = `Something went wrong saving that. Call or text Cory on ${CONTACT.phone} and he will pick it up straight away.`;

/**
 * "Check availability" on a vehicle listing.
 *
 *   browser -> bot check -> rate limit -> validation -> service role -> log
 *
 * The vehicle is re-read on the server rather than trusted from the form. A
 * client can post any UUID, and a lead attached to the wrong car — or to a car
 * that was never published — is worse than no lead at all.
 */
export async function submitVehicleInquiry(
  _prev: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  const meta = await getRequestMeta();

  const bot = await evaluateBot({
    honeypot: formData.get("company") as string | null,
    renderedAt: formData.get("renderedAt") as string | null,
    token: formData.get("cf-turnstile-response") as string | null,
    text: [
      String(formData.get("name") ?? ""),
      String(formData.get("message") ?? ""),
    ],
  });

  if (!bot.passed) {
    await logSubmission({ formKey: FORM_KEY, outcome: "rejected_bot", meta, bot });
    return {
      code: "bot_check",
      message: "We could not verify that submission. Please try again.",
    };
  }

  const allowed = await checkRateLimit(FORM_KEY, meta.ipHash);
  if (!allowed) {
    await logSubmission({
      formKey: FORM_KEY,
      outcome: "rejected_rate_limit",
      meta,
      bot,
    });
    return {
      code: "rate_limit",
      message: `You have sent that a few times already. Give it a few minutes, or call Cory on ${CONTACT.phone}.`,
    };
  }

  const parsed = VehicleInquirySchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    message: formData.get("message"),
    contactMethod: formData.get("contactMethod"),
    vehicleId: formData.get("vehicleId"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    await logSubmission({
      formKey: FORM_KEY,
      outcome: "rejected_validation",
      meta,
      bot,
      fieldErrors,
    });
    return { code: "validation", fieldErrors };
  }

  if (!serverEnv.hasServiceRole) {
    console.error(
      "[vehicle_inquiry] SUPABASE_SERVICE_ROLE_KEY is not set — lead was NOT saved.",
    );
    await logSubmission({
      formKey: FORM_KEY,
      outcome: "error",
      meta,
      bot,
      errorCode: "missing_service_role",
    });
    return { code: "unavailable", message: CALL_INSTEAD };
  }

  const input = parsed.data;

  try {
    const supabase = createAdminClient();

    // Never take the car's identity from the form.
    const { data: vehicle } = await supabase
      .from("vehicles")
      .select("id, year, make, model, trim, status")
      .eq("id", input.vehicleId)
      .in("status", ["available", "pending"])
      .maybeSingle();

    if (!vehicle) {
      await logSubmission({
        formKey: FORM_KEY,
        outcome: "rejected_validation",
        meta,
        bot,
        errorCode: "unknown_vehicle",
      });
      return {
        code: "unavailable",
        message: `That listing is no longer available. Call or text Cory on ${CONTACT.phone} and he will find you something close.`,
      };
    }

    const [firstName, ...rest] = input.name.split(/\s+/);

    const { data, error } = await supabase
      .from("leads")
      .insert({
        first_name: firstName,
        last_name: rest.length > 0 ? rest.join(" ") : null,
        phone: input.phone,
        email: input.email,
        message: buildInquiryMessage(input, vehicleTitle(vehicle)),
        source: "vehicle_inquiry",
        status: "new",
        vehicle_id: vehicle.id,
        preferred_contact: input.contactMethod,
        referrer: meta.referrer,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("[vehicle_inquiry] insert failed", error?.code, error?.message);
      await logSubmission({
        formKey: FORM_KEY,
        outcome: "error",
        meta,
        bot,
        errorCode: error?.code ?? "insert_failed",
      });
      return { code: "server", message: CALL_INSTEAD };
    }

    await logSubmission({
      formKey: FORM_KEY,
      outcome: "accepted",
      meta,
      bot,
      relatedTable: "leads",
      relatedId: data.id,
    });

    return { ok: true };
  } catch (cause) {
    console.error("[vehicle_inquiry] unexpected", cause);
    await logSubmission({
      formKey: FORM_KEY,
      outcome: "error",
      meta,
      bot,
      errorCode: "exception",
    });
    return { code: "server", message: CALL_INSTEAD };
  }
}
