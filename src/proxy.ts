import type { NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/session";

/**
 * Next 16 renamed the `middleware` convention to `proxy`. Same runtime, same
 * matcher — only the file name and exported function changed.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
