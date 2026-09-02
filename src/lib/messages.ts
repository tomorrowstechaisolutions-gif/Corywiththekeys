import type { Database } from "@/types/database";

export type Message = Database["public"]["Tables"]["messages"]["Row"];
export type MessageChannel = Database["public"]["Enums"]["message_channel"];
export type MessageDirection =
  Database["public"]["Enums"]["message_direction"];

export const CHANNEL_LABELS: Record<MessageChannel, string> = {
  web_form: "Website",
  sms: "Text",
  email: "Email",
  phone: "Phone",
  other: "Other",
};

/**
 * One conversation in the inbox.
 *
 * Threads are keyed by lead, because every public route that can start a
 * conversation creates a lead first. A message attached only to a customer
 * has no thread yet — nothing writes one today, and inventing a second
 * threading key before there is a second writer would be guesswork.
 */
export type Thread = {
  leadId: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: Database["public"]["Enums"]["lead_status"];
  channel: MessageChannel;
  subject: string | null;
  preview: string;
  lastAt: string;
  lastDirection: MessageDirection;
  unread: number;
  total: number;
};

/** Trimmed to one line so the list stays scannable at a glance. */
export function preview(body: string, max = 140): string {
  const flat = body.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

/** "2:14 PM" for today, "12 Aug" for anything older. */
export function messageTime(iso: string, now = new Date()): string {
  const date = new Date(iso);
  const sameDay = date.toDateString() === now.toDateString();

  return sameDay
    ? date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

export function messageStamp(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
