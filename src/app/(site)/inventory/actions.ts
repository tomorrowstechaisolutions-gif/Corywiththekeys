"use server";

import { serverEnv } from "@/lib/env";
import { evaluateBot } from "@/lib/security/bot";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getRequestMeta } from "@/lib/security/request-meta";
import { logSubmission } from "@/lib/security/submissions";
import { createAdminClient } from "@/lib/supabase/server";
import { buildLeadMessage, FindMyCarSchema } from "@/lib/validation/lead";

export type LeadFormState = {
  ok?: boolean;
  /** Machine-readable so the UI can respond without parsing prose. */
  code?: "validation" | "rate_limit" | "bot_check" | "unavailable" | "server";
  message?: string;
  fieldErrors?: Record<string, string>;
};

const FORM_KEY = "find_my_car";

/**
 * "Have Cory Find My Car" — the public lead form on /inventory.
 *
 *   browser -> bot check -> rate limit -> validation -> service role -> log
 *
 * There is no anonymous INSERT policy on `leads`, so this action is the only
 * way a member of the public can create one. Every branch logs its outcome to
 * form_submissions, including the ones that reject.
 */
export async function findMyCar(
  _prev: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const meta = await getRequestMeta();

  // 1. Bot checks first — they are free and catch the highest volume.
  const bot = await evaluateBot({
    honeypot: formData.get("company") as string | null,
    renderedAt: formData.get("renderedAt") as string | null,
    token: formData.get("cf-turnstile-response") as string | null,
    text: [
      String(formData.get("fullName") ?? ""),
      String(formData.get("makeModel") ?? ""),
      String(formData.get("budget") ?? ""),
    ],
  });

  if (!bot.passed) {
    await logSubmission({ formKey: FORM_KEY, outcome: "rejected_bot", meta, bot });
    // Deliberately vague. Telling a bot which check caught it helps it adapt.
    return {
      code: "bot_check",
      message: "We could not verify that submission. Please try again.",
    };
  }

  // 2. Rate limit on the hashed IP.
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
        "You have sent this a few times already. Give it half an hour, or call Cory directly on 254-987-0063.",
    };
  }

  // 3. Validate.
  const parsed = FindMyCarSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    vehicleType: formData.get("vehicleType"),
    makeModel: formData.get("makeModel"),
    budget: formData.get("budget"),
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

  // 4. Write. Public writes need the service role; without it nothing can
  // reach the database, so say so plainly rather than throwing.
  if (!serverEnv.hasServiceRole) {
    console.error(
      "[find_my_car] SUPABASE_SERVICE_ROLE_KEY is not set — lead was NOT saved.",
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

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("leads")
      .insert({
        first_name: firstName,
        last_name: rest.join(" ") || null,
        phone: input.phone,
        email: input.email,
        message: buildLeadMessage(input),
        source: "find_my_car",
        status: "new",
        referrer: meta.referrer,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("[find_my_car] insert failed", error?.code, error?.message);
      await logSubmission({
        formKey: FORM_KEY,
        outcome: "error",
        meta,
        bot,
        errorCode: error?.code ?? "insert_failed",
      });
      // Never surface a Postgres message to the browser.
      return {
        code: "server",
        message:
          "Something went wrong saving that. Please try again, or call Cory on 254-987-0063.",
      };
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
    console.error("[find_my_car] unexpected", cause);
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
