"use server";

import { serverEnv } from "@/lib/env";
import { evaluateBot } from "@/lib/security/bot";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getRequestMeta } from "@/lib/security/request-meta";
import { logSubmission } from "@/lib/security/submissions";
import { createAdminClient } from "@/lib/supabase/server";
import {
  FinanceLeadSchema,
  buildFinanceLeadMessage,
} from "@/lib/validation/finance";

export type FinanceLeadState = {
  ok?: boolean;
  code?: "validation" | "rate_limit" | "bot_check" | "unavailable" | "server";
  message?: string;
  fieldErrors?: Record<string, string>;
};

const FORM_KEY = "lead";

/**
 * The optional pre-application form on /finance.
 *
 *   browser -> bot check -> rate limit -> validation -> service role -> log
 *
 * This is NOT a credit application. It stores shopping preferences so Cory
 * knows who is coming and what they want; the sensitive application stays
 * with the financing provider. Nothing here writes an SSN, licence number,
 * date of birth, bank detail or credit data, because no such field exists.
 *
 * Failing does not trap anyone: the page always offers the secure
 * application regardless of whether this form was used or succeeded.
 */
export async function submitFinanceLead(
  _prev: FinanceLeadState,
  formData: FormData,
): Promise<FinanceLeadState> {
  const meta = await getRequestMeta();

  const bot = await evaluateBot({
    honeypot: formData.get("company") as string | null,
    renderedAt: formData.get("renderedAt") as string | null,
    token: formData.get("cf-turnstile-response") as string | null,
    text: [
      String(formData.get("firstName") ?? ""),
      String(formData.get("lookingFor") ?? ""),
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
      message:
        "You have sent this a few times already. Give it a few minutes, or call Cory on 254-987-0063.",
    };
  }

  const parsed = FinanceLeadSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    vehicle: formData.get("vehicle"),
    downPaymentBand: formData.get("downPaymentBand"),
    tradeIn: formData.get("tradeIn"),
    lookingFor: formData.get("lookingFor"),
    contactMethod: formData.get("contactMethod"),
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
      "[finance_lead] SUPABASE_SERVICE_ROLE_KEY is not set — lead was NOT saved.",
    );
    await logSubmission({
      formKey: FORM_KEY,
      outcome: "error",
      meta,
      bot,
      errorCode: "missing_service_role",
    });
    // Still not a dead end — the page keeps offering the secure application.
    return {
      code: "unavailable",
      message:
        "We could not save that just now, but you can still continue to the secure application below, or call Cory on 254-987-0063.",
    };
  }

  const input = parsed.data;

  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("leads")
      .insert({
        first_name: input.firstName,
        last_name: input.lastName,
        phone: input.phone,
        email: input.email,
        message: buildFinanceLeadMessage(input),
        // `financing` is the existing enum value for exactly this. See the
        // report: a separate "Finance Page" source would need a migration and
        // would duplicate a value that already means this.
        source: "financing",
        status: "new",
        referrer: meta.referrer,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("[finance_lead] insert failed", error?.code, error?.message);
      await logSubmission({
        formKey: FORM_KEY,
        outcome: "error",
        meta,
        bot,
        errorCode: error?.code ?? "insert_failed",
      });
      return {
        code: "server",
        message:
          "Something went wrong saving that, but you can still continue to the secure application below.",
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
    console.error("[finance_lead] unexpected", cause);
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
        "Something went wrong saving that, but you can still continue to the secure application below.",
    };
  }
}
