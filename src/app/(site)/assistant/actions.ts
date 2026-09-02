"use server";

import { serverEnv } from "@/lib/env";
import { evaluateBot } from "@/lib/security/bot";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getRequestMeta } from "@/lib/security/request-meta";
import { logSubmission } from "@/lib/security/submissions";
import { createAdminClient } from "@/lib/supabase/server";
import { AssistantSchema, assistantSubject } from "@/lib/validation/assistant";

export type AssistantFormState = {
  ok?: boolean;
  code?: "validation" | "rate_limit" | "bot_check" | "unavailable" | "server";
  message?: string;
  fieldErrors?: Record<string, string>;
};

const FORM_KEY = "assistant";

/**
 * The floating page assistant.
 *
 *   browser -> bot check -> rate limit -> validation -> service role -> log
 *
 * Same pipeline as the contact form, and for the same reason: there is no
 * anonymous INSERT policy on `leads` or `messages`, so this action is the
 * only way a visitor reaches either table. It writes a lead so the enquiry
 * enters the pipeline, plus an inbound message so the words they typed show
 * up in the admin inbox as a conversation rather than a lead note.
 */
export async function sendAssistantMessage(
  _prev: AssistantFormState,
  formData: FormData,
): Promise<AssistantFormState> {
  const meta = await getRequestMeta();

  const bot = await evaluateBot({
    honeypot: formData.get("company") as string | null,
    renderedAt: formData.get("renderedAt") as string | null,
    token: formData.get("cf-turnstile-response") as string | null,
    text: [
      String(formData.get("fullName") ?? ""),
      String(formData.get("message") ?? ""),
    ],
  });

  if (!bot.passed) {
    await logSubmission({ formKey: FORM_KEY, outcome: "rejected_bot", meta, bot });
    return {
      code: "bot_check",
      message: "We could not verify that. Please try again.",
    };
  }

  const allowed = await checkRateLimit("assistant", meta.ipHash);
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
        "You have sent that a few times already. Give it a few minutes, or call Cory on 254-987-0063.",
    };
  }

  const parsed = AssistantSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
    path: formData.get("path"),
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
      "[assistant] SUPABASE_SERVICE_ROLE_KEY is not set — message was NOT saved.",
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
        "Messages are temporarily unavailable. Please call or text Cory on 254-987-0063.",
    };
  }

  const input = parsed.data;
  const [firstName, ...rest] = input.fullName.split(/\s+/);

  try {
    const supabase = createAdminClient();

    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        first_name: firstName,
        last_name: rest.join(" ") || null,
        phone: input.phone,
        email: input.email,
        message: input.message,
        source: "page_assistant",
        status: "new",
        referrer: meta.referrer,
      })
      .select("id")
      .single();

    if (leadError || !lead) {
      console.error(
        "[assistant] lead insert failed",
        leadError?.code,
        leadError?.message,
      );
      await logSubmission({
        formKey: FORM_KEY,
        outcome: "error",
        meta,
        bot,
        errorCode: leadError?.code ?? "insert_failed",
      });
      return {
        code: "server",
        message:
          "Something went wrong sending that. Please try again, or call Cory on 254-987-0063.",
      };
    }

    // The lead already carries the text, so a failure here costs the inbox a
    // thread but never loses the enquiry. Log it and let the visitor through.
    const { error: messageError } = await supabase.from("messages").insert({
      lead_id: lead.id,
      channel: "web_form",
      direction: "inbound",
      subject: assistantSubject(input),
      body: input.message,
    });

    if (messageError) {
      console.error(
        "[assistant] message insert failed (lead saved)",
        messageError.code,
        messageError.message,
      );
    }

    await logSubmission({
      formKey: FORM_KEY,
      outcome: "accepted",
      meta,
      bot,
      relatedTable: "leads",
      relatedId: lead.id,
    });

    return { ok: true };
  } catch (cause) {
    console.error("[assistant] unexpected", cause);
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
        "Something went wrong sending that. Please try again, or call Cory on 254-987-0063.",
    };
  }
}
