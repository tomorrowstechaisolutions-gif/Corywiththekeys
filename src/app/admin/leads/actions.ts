"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { canWrite, requireSection } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { LeadStatus } from "@/lib/leads";
import {
  CONTACT_CHANNEL_LABELS,
  LeadAssignSchema,
  LeadFollowUpSchema,
  LeadNoteSchema,
  LeadStatusSchema,
  LogContactSchema,
  ManualLeadSchema,
} from "@/lib/validation/lead-admin";

export type LeadState = {
  ok?: boolean;
  message?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
};

function collectFieldErrors(
  issues: { path: PropertyKey[]; message: string }[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    out[String(issue.path[0] ?? "form")] ??= issue.message;
  }
  return out;
}

/**
 * Viewers can read the pipeline but not move it.
 *
 * The RLS policy on leads says the same thing (can_write()), so a viewer
 * whose browser posts one of these anyway is refused by the database too.
 */
async function guard() {
  const profile = await requireSection("leads");
  if (!canWrite(profile)) {
    return { profile, denied: "Your role cannot change leads." as const };
  }
  return { profile, denied: null };
}

function refresh(id?: string) {
  revalidatePath("/admin/leads");
  if (id) revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin/dashboard");
}

export async function setLeadStatus(
  _prev: LeadState,
  formData: FormData,
): Promise<LeadState> {
  const { denied } = await guard();
  if (denied) return { error: denied };

  const parsed = LeadStatusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: "That is not a stage we recognise." };

  const { id, status } = parsed.data;
  const supabase = await createClient();

  /*
   * Moving a lead off "new" means somebody has been in touch, so the first
   * time that happens we stamp contacted_at. Without this the list would keep
   * flagging a lead as "nobody has replied yet" after someone plainly had.
   */
  const patch: { status: LeadStatus; contacted_at?: string } = {
    status: status as LeadStatus,
  };

  if (status !== "new") {
    const { data: current } = await supabase
      .from("leads")
      .select("contacted_at")
      .eq("id", id)
      .maybeSingle();

    if (current && !current.contacted_at) {
      patch.contacted_at = new Date().toISOString();
    }
  }

  const { error } = await supabase.from("leads").update(patch).eq("id", id);
  if (error) return { error: "Could not save that. Please try again." };

  refresh(id);
  return { ok: true, message: "Stage updated." };
}

export async function assignLead(
  _prev: LeadState,
  formData: FormData,
): Promise<LeadState> {
  const { denied } = await guard();
  if (denied) return { error: denied };

  const parsed = LeadAssignSchema.safeParse({
    id: formData.get("id"),
    assignedTo: formData.get("assignedTo"),
  });
  if (!parsed.success) return { error: "That is not somebody we recognise." };

  const { id, assignedTo } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase
    .from("leads")
    .update({ assigned_to: assignedTo })
    .eq("id", id);

  if (error) return { error: "Could not save that. Please try again." };

  refresh(id);
  return { ok: true, message: assignedTo ? "Assigned." : "Unassigned." };
}

export async function setFollowUp(
  _prev: LeadState,
  formData: FormData,
): Promise<LeadState> {
  const { denied } = await guard();
  if (denied) return { error: denied };

  const parsed = LeadFollowUpSchema.safeParse({
    id: formData.get("id"),
    followUpAt: formData.get("followUpAt"),
  });
  if (!parsed.success) {
    return { fieldErrors: collectFieldErrors(parsed.error.issues) };
  }

  const { id, followUpAt } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase
    .from("leads")
    .update({ next_follow_up_at: followUpAt })
    .eq("id", id);

  if (error) return { error: "Could not save that. Please try again." };

  refresh(id);
  return {
    ok: true,
    message: followUpAt ? "Follow-up set." : "Follow-up cleared.",
  };
}

export async function addNote(
  _prev: LeadState,
  formData: FormData,
): Promise<LeadState> {
  const { profile, denied } = await guard();
  if (denied) return { error: denied };

  const parsed = LeadNoteSchema.safeParse({
    id: formData.get("id"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    return { fieldErrors: collectFieldErrors(parsed.error.issues) };
  }

  const { id, body } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.from("lead_events").insert({
    lead_id: id,
    type: "note",
    body,
    author_id: profile.id,
  });

  if (error) return { error: "Could not save that note. Please try again." };

  refresh(id);
  return { ok: true, message: "Note added." };
}

/**
 * "I just rang them."
 *
 * The single most-used button in a dealership CRM, so it does everything that
 * moment implies in one go: records what happened, stamps contacted_at, moves
 * a brand new lead to Contacted, and — the part that matters — lets them set
 * the next follow-up while the call is still in their head. A follow-up date
 * entered five minutes later is a follow-up date that never gets entered.
 */
export async function logContact(
  _prev: LeadState,
  formData: FormData,
): Promise<LeadState> {
  const { profile, denied } = await guard();
  if (denied) return { error: denied };

  const parsed = LogContactSchema.safeParse({
    id: formData.get("id"),
    channel: formData.get("channel"),
    body: formData.get("body"),
    followUpAt: formData.get("followUpAt"),
  });
  if (!parsed.success) {
    return { fieldErrors: collectFieldErrors(parsed.error.issues) };
  }

  const { id, channel, body, followUpAt } = parsed.data;
  const supabase = await createClient();

  const { data: current } = await supabase
    .from("leads")
    .select("status, contacted_at")
    .eq("id", id)
    .maybeSingle();

  if (!current) return { error: "That lead no longer exists." };

  const label = CONTACT_CHANNEL_LABELS[channel];

  const { error: eventError } = await supabase.from("lead_events").insert({
    lead_id: id,
    type: "contact_logged",
    body: body ? `${label} — ${body}` : label,
    author_id: profile.id,
  });

  if (eventError) {
    return { error: "Could not log that. Please try again." };
  }

  // The status change and follow-up write their own timeline entries, so this
  // update is deliberately last: the timeline reads in the order it happened.
  const { error } = await supabase
    .from("leads")
    .update({
      contacted_at: current.contacted_at ?? new Date().toISOString(),
      status: current.status === "new" ? "contacted" : current.status,
      next_follow_up_at: followUpAt,
    })
    .eq("id", id);

  if (error) {
    return {
      error: "Logged the contact, but could not update the lead. Try again.",
    };
  }

  refresh(id);
  return {
    ok: true,
    message: followUpAt
      ? "Logged, and the follow-up is set."
      : "Logged. No follow-up set — worth picking a day.",
  };
}

/** A walk-in or a phone enquiry, typed in by whoever took it. */
export async function createLead(
  _prev: LeadState,
  formData: FormData,
): Promise<LeadState> {
  const { profile, denied } = await guard();
  if (denied) return { error: denied };

  const parsed = ManualLeadSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    source: formData.get("source"),
    message: formData.get("message"),
    assignedTo: formData.get("assignedTo"),
    followUpAt: formData.get("followUpAt"),
  });

  if (!parsed.success) {
    return { fieldErrors: collectFieldErrors(parsed.error.issues) };
  }

  const input = parsed.data;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leads")
    .insert({
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone,
      email: input.email,
      source: input.source as never,
      message: input.message,
      // Whoever typed it in has already spoken to them — that is how they
      // know about them at all.
      status: "contacted",
      contacted_at: new Date().toISOString(),
      assigned_to: input.assignedTo ?? profile.id,
      next_follow_up_at: input.followUpAt,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[leads] create failed", error?.code, error?.message);
    return { error: "Could not save that lead. Please try again." };
  }

  refresh();
  redirect(`/admin/leads/${data.id}?created=1`);
}
