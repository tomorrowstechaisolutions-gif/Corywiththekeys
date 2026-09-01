import { serverEnv } from "@/lib/env";

export type BotVerdict = {
  passed: boolean;
  provider: string | null;
  score: number | null;
  honeypotTripped: boolean;
  timeToSubmitMs: number | null;
  signals: string[];
};

/** Anything faster than this was not typed by a person. */
const MIN_HUMAN_MS = 1500;

/**
 * Four independent checks. Each records its finding whether or not it fires,
 * so /admin/analytics can show what is actually hitting the forms.
 *
 * 1. honeypot     — a field hidden from people; filled means a bot
 * 2. timing       — a form completed in under 1.5s was scripted
 * 3. token        — Cloudflare Turnstile, verified server-side
 * 4. content      — link count, repetition, known spam shapes
 */
export async function evaluateBot(input: {
  honeypot: string | null;
  renderedAt: string | null;
  token: string | null;
  text: string[];
}): Promise<BotVerdict> {
  const signals: string[] = [];

  const honeypotTripped = Boolean(input.honeypot && input.honeypot.trim());
  if (honeypotTripped) signals.push("honeypot");

  let timeToSubmitMs: number | null = null;
  if (input.renderedAt) {
    const started = Number(input.renderedAt);
    if (Number.isFinite(started)) {
      timeToSubmitMs = Date.now() - started;
      if (timeToSubmitMs < MIN_HUMAN_MS) signals.push("too_fast");
      // A form open for over a day is a stale tab, not necessarily a bot.
      if (timeToSubmitMs > 86_400_000) signals.push("stale_form");
    }
  }

  const body = input.text.filter(Boolean).join(" ");
  const linkCount = (body.match(/https?:\/\//gi) ?? []).length;
  if (linkCount >= 2) signals.push("links");
  if (/\b(viagra|casino|crypto airdrop|seo services|backlink)\b/i.test(body)) {
    signals.push("spam_terms");
  }
  if (/(.)\1{12,}/.test(body)) signals.push("repetition");

  const { passed, provider, score } = await verifyTurnstile(input.token);
  if (!passed) signals.push("token_failed");

  return {
    // Honeypot and timing are hard fails. Content signals inform, they do not
    // block — a real customer may legitimately paste a link to a car.
    passed: passed && !honeypotTripped && !signals.includes("too_fast"),
    provider,
    score,
    honeypotTripped,
    timeToSubmitMs,
    signals,
  };
}

/**
 * Verify a Turnstile token. Returns passed:true when no secret is configured,
 * so the site works before the key is set — the honeypot and timing checks
 * still apply.
 */
async function verifyTurnstile(token: string | null): Promise<{
  passed: boolean;
  provider: string | null;
  score: number | null;
}> {
  const secret = serverEnv.turnstileSecretKey;
  if (!secret) return { passed: true, provider: null, score: null };

  if (!token) return { passed: false, provider: "turnstile", score: null };

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret, response: token }),
      },
    );

    const result = (await response.json()) as { success?: boolean };
    return {
      passed: result.success === true,
      provider: "turnstile",
      score: null,
    };
  } catch (cause) {
    console.error("[bot] turnstile verification unavailable", cause);
    // Fail open on an outage at Cloudflare rather than blocking every lead.
    return { passed: true, provider: "turnstile", score: null };
  }
}
