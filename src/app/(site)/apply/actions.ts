"use server";

import { serverEnv } from "@/lib/env";
import { evaluateBot } from "@/lib/security/bot";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getRequestMeta } from "@/lib/security/request-meta";
import { logSubmission } from "@/lib/security/submissions";
import { createAdminClient } from "@/lib/supabase/server";
import {
  CONSENT_TEXT_VERSION,
  PrequalificationSchema,
} from "@/lib/validation/prequalification";

export type PrequalFormState = {
  ok?: boolean;
  code?: "validation" | "rate_limit" | "bot_check" | "unavailable" | "server";
  message?: string;
  fieldErrors?: Record<string, string>;
};

const FORM_KEY = "prequalification";

/**
 * "Get Approved Fast" — the homepage prequalification form.
 *
 *   browser -> bot check -> rate limit -> validation -> service role -> log
 *
 * Writes a `leads` row (so it lands in the pipeline like any other enquiry)
 * and a linked `prequalifications` row holding the banded financial detail.
 * Both happen through the service role; there is no anonymous INSERT policy.
 */
export async function submitPrequalification(
  _prev: PrequalFormState,
  formData: FormData,
): Promise<PrequalFormState> {
  const meta = await getRequestMeta();

  const bot = await evaluateBot({
    honeypot: formData.get("company") as string | null,
    renderedAt: formData.get("renderedAt") as string | null,
    token: formData.get("cf-turnstile-response") as string | null,
    text: [String(formData.get("fullName") ?? "")],
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
      message:
        "We already have your details. Cory will be in touch — or call 254-987-0063 to speak to someone now.",
    };
  }

  const parsed = PrequalificationSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    employment: formData.get("employment"),
    monthlyIncomeBand: formData.get("monthlyIncomeBand"),
    downPaymentBand: formData.get("downPaymentBand"),
    preferredVehicleType: formData.get("preferredVehicleType"),
    consentContact: formData.get("consentContact"),
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
      "[prequalification] SUPABASE_SERVICE_ROLE_KEY is not set — nothing was saved.",
    );
    await logSubmission({
      formKey: FORM_KEY,
      outcome: "error",
      meta,
      bot,
      errorCode: "missing_service_role",
    });
    return {
      code: "unavailable",
      message:
        "Our form is temporarily unavailable. Please call or text Cory on 254-987-0063.",
    };
  }

  const input = parsed.data;
  const [firstName, ...rest] = input.fullName.split(/\s+/);
  const lastName = rest.join(" ");

  try {
    const supabase = createAdminClient();

    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        first_name: firstName,
        last_name: lastName || null,
        phone: input.phone,
        email: input.email,
        source: "prequalification",
        status: "new",
        referrer: meta.referrer,
      })
      .select("id")
      .single();

    if (leadError || !lead) {
      console.error("[prequalification] lead insert failed", leadError?.code);
      await logSubmission({
        formKey: FORM_KEY,
        outcome: "error",
        meta,
        bot,
        errorCode: leadError?.code ?? "lead_insert_failed",
      });
      return {
        code: "server",
        message:
          "Something went wrong saving that. Please try again, or call Cory on 254-987-0063.",
      };
    }

    const { data: prequal, error: prequalError } = await supabase
      .from("prequalifications")
      .insert({
        lead_id: lead.id,
        first_name: firstName,
        last_name: lastName || firstName,
        phone: input.phone,
        email: input.email,
        employment: input.employment,
        monthly_income_band: input.monthlyIncomeBand,
        down_payment_band: input.downPaymentBand,
        preferred_vehicle_type: input.preferredVehicleType,
        consent_contact: true,
        consent_text_version: CONSENT_TEXT_VERSION,
        consented_at: new Date().toISOString(),
        // The only raw IP stored anywhere, kept solely as consent evidence.
        consent_ip: meta.ip,
        consent_user_agent: meta.userAgent,
        status: "new",
      })
      .select("id")
      .single();

    if (prequalError || !prequal) {
      console.error(
        "[prequalification] prequal insert failed",
        prequalError?.code,
      );
      await logSubmission({
        formKey: FORM_KEY,
        outcome: "error",
        meta,
        bot,
        errorCode: prequalError?.code ?? "prequal_insert_failed",
        relatedTable: "leads",
        relatedId: lead.id,
      });
      // The lead survived, so Cory still gets the call. Say it worked,
      // because from the customer's point of view it did.
      return { ok: true };
    }

    await logSubmission({
      formKey: FORM_KEY,
      outcome: "accepted",
      meta,
      bot,
      relatedTable: "prequalifications",
      relatedId: prequal.id,
    });

    return { ok: true };
  } catch (cause) {
    console.error("[prequalification] unexpected", cause);
    await logSubmission({
      formKey: FORM_KEY,
      outcome: "error",
      meta,
      bot,
      errorCode: "exception",
    });
    return {
      code: "server",
      message:
        "Something went wrong saving that. Please try again, or call Cory on 254-987-0063.",
    };
  }
}
