"use server";

import { serverEnv } from "@/lib/env";
import { evaluateBot } from "@/lib/security/bot";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getRequestMeta } from "@/lib/security/request-meta";
import { logSubmission } from "@/lib/security/submissions";
import { createAdminClient } from "@/lib/supabase/server";
import { ContactSchema, contactSubject } from "@/lib/validation/contact";

export type ContactFormState = {
  ok?: boolean;
  /** Machine-readable so the UI can respond without parsing prose. */
  code?: "validation" | "rate_limit" | "bot_check" | "unavailable" | "server";
  message?: string;
  fieldErrors?: Record<string, string>;
};

const FORM_KEY = "contact";

/**
 * The public contact form.
 *
 *   browser -> bot check -> rate limit -> validation -> service role -> log
 *
 * There is no anonymous INSERT policy on `leads` or `messages`, so this action
 * is the only route a member of the public has into either table. Every
 * branch logs its outcome to form_submissions, rejections included.
 *
 * It writes twice: a lead so the enquiry enters the pipeline, and a linked
 * inbound message so the words the person actually typed show up in the admin
 * inbox rather than being flattened into a lead note.
 */
export async function sendContactMessage(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const meta = await getRequestMeta();

  // 1. Bot checks first — free, and they catch the highest volume.
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
    // Deliberately vague. Naming the check that caught it helps it adapt.
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
        "You have sent this a few times already. Give it a few minutes, or call Cory directly on 254-987-0063.",
    };
  }

  // 3. Validate.
  const parsed = ContactSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    topic: formData.get("topic"),
    message: formData.get("message"),
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

  // 4. Write. Public writes need the service role; without it nothing reaches
  // the database, so say so plainly rather than throwing.
  if (!serverEnv.hasServiceRole) {
    console.error(
      "[contact] SUPABASE_SERVICE_ROLE_KEY is not set — message was NOT saved.",
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

    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .insert({
        first_name: firstName,
        last_name: rest.join(" ") || null,
        phone: input.phone,
        email: input.email,
        message: input.message,
        source: "contact_form",
        status: "new",
        referrer: meta.referrer,
      })
      .select("id")
      .single();

    if (leadError || !lead) {
      console.error("[contact] lead insert failed", leadError?.code, leadError?.message);
      await logSubmission({
        formKey: FORM_KEY,
        outcome: "error",
        meta,
        bot,
        errorCode: leadError?.code ?? "insert_failed",
      });
      // Never surface a Postgres message to the browser.
      return {
        code: "server",
        message:
          "Something went wrong sending that. Please try again, or call Cory on 254-987-0063.",
      };
    }

    // The message row is a convenience, not the record of truth — the lead
    // already carries the text. If it fails the person still got through, so
    // log it and move on rather than showing them an error.
    const { error: messageError } = await supabase.from("messages").insert({
      lead_id: lead.id,
      channel: "web_form",
      direction: "inbound",
      subject: contactSubject(input),
      body: input.message,
    });

    if (messageError) {
      console.error(
        "[contact] message insert failed (lead saved)",
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
    console.error("[contact] unexpected", cause);
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
