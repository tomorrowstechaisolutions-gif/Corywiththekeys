import { createAdminClient } from "@/lib/supabase/server";
import type { BotVerdict } from "@/lib/security/bot";
import type { RequestMeta } from "@/lib/security/request-meta";
import type { Database } from "@/types/database";

export type SubmissionOutcome =
  Database["public"]["Enums"]["submission_outcome"];

/**
 * Record one public form POST — accepted or not.
 *
 * Separate from the business record on purpose. This is the abuse and
 * observability trail: hashed IP, bot signals, validation failures. It never
 * holds the customer's details, and admins are the only role that can read it.
 *
 * Logging never throws. Losing a log line must not lose a lead.
 */
export async function logSubmission(input: {
  formKey: string;
  outcome: SubmissionOutcome;
  meta: RequestMeta;
  bot?: BotVerdict;
  fieldErrors?: Record<string, string>;
  errorCode?: string;
  relatedTable?: string;
  relatedId?: string;
}): Promise<void> {
  try {
    const supabase = createAdminClient();

    await supabase.from("form_submissions").insert({
      form_key: input.formKey,
      outcome: input.outcome,
      ip_hash: input.meta.ipHash,
      user_agent: input.meta.userAgent,
      country: input.meta.country,
      referrer: input.meta.referrer,
      bot_provider: input.bot?.provider ?? null,
      bot_check_passed: input.bot?.passed ?? null,
      bot_score: input.bot?.score ?? null,
      honeypot_tripped: input.bot?.honeypotTripped ?? false,
      time_to_submit_ms: input.bot?.timeToSubmitMs ?? null,
      spam_signals: input.bot?.signals ?? [],
      field_errors: input.fieldErrors ?? null,
      error_code: input.errorCode ?? null,
      related_table: input.relatedTable ?? null,
      related_id: input.relatedId ?? null,
    });
  } catch (cause) {
    console.error("[submissions] could not log", cause);
  }
}
