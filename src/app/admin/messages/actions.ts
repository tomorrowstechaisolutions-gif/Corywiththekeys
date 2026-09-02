"use server";

import { revalidatePath } from "next/cache";

import { canWrite, requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ReplyState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

async function guard() {
  const profile = await requireStaff();
  return canWrite(profile)
    ? { profile, denied: null as string | null }
    : { profile, denied: "Your role cannot send replies." };
}

/** Opening a thread is what marks it read — there is no separate button. */
export async function markThreadRead(leadId: string) {
  await requireStaff();

  const supabase = await createClient();

  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("lead_id", leadId)
    .eq("direction", "inbound")
    .is("read_at", null);

  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${leadId}`);
}

/**
 * Log a reply on the thread.
 *
 * Nothing is delivered to the customer yet — no email or SMS provider is
 * wired up — so the copy in the UI says so plainly rather than implying the
 * message was sent. When a provider is added, this is the one place to send
 * from, and `channel` becomes the delivery route rather than a label.
 */
export async function sendReply(
  leadId: string,
  _prev: ReplyState,
  formData: FormData,
): Promise<ReplyState> {
  const { profile, denied } = await guard();
  if (denied) return { error: denied };

  const body = String(formData.get("body") ?? "").trim();

  if (body.length < 2) {
    return { fieldErrors: { body: "Write something before saving it." } };
  }

  if (body.length > 4000) {
    return { fieldErrors: { body: "Keep this under 4000 characters." } };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("messages").insert({
    lead_id: leadId,
    channel: "other",
    direction: "outbound",
    body,
    author_id: profile.id,
  });

  if (error) {
    return { error: "Could not save that reply. Please try again." };
  }

  revalidatePath("/admin/messages");
  revalidatePath(`/admin/messages/${leadId}`);
  return { ok: true };
}
