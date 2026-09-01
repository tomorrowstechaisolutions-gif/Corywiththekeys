import { createHash } from "node:crypto";

import { headers } from "next/headers";

import { serverEnv } from "@/lib/env";

export type RequestMeta = {
  /** sha256(ip + salt). The raw address is never stored. */
  ipHash: string | null;
  /** Raw IP, held in memory only, for TCPA consent evidence where required. */
  ip: string | null;
  userAgent: string | null;
  country: string | null;
  referrer: string | null;
};

/**
 * Everything the abuse layer knows about a request.
 *
 * The raw IP is returned but only ever persisted where consent evidence
 * requires it (prequalifications.consent_ip). Everywhere else — rate limit
 * keys, form_submissions — uses the hash.
 */
export async function getRequestMeta(): Promise<RequestMeta> {
  const headerList = await headers();

  const forwarded = headerList.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip")?.trim() ||
    null;

  return {
    ip,
    ipHash: ip ? hashIp(ip) : null,
    userAgent: headerList.get("user-agent")?.slice(0, 500) ?? null,
    country:
      headerList.get("x-vercel-ip-country") ??
      headerList.get("cf-ipcountry") ??
      null,
    referrer: headerList.get("referer")?.slice(0, 500) ?? null,
  };
}

export function hashIp(ip: string): string {
  return createHash("sha256")
    .update(`${ip}:${serverEnv.rateLimitSalt}`)
    .digest("hex");
}
