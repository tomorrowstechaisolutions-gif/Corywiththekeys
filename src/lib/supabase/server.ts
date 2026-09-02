import { cookies } from "next/headers";

import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { publicEnv, serverEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Supabase client for Server Components, Route Handlers and Server Actions.
 * Reads and refreshes the auth session from cookies. Honors Row Level Security.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component, where cookies are read-only.
            // Middleware is responsible for refreshing the session cookie.
          }
        },
      },
    },
  );
}

/**
 * Anonymous client for public data, with no cookies involved.
 *
 * Reading cookies makes a page dynamic, so a page that only needs public
 * information — the opening hours in the footer, say — would lose static
 * rendering for no benefit. This client has no session and gets exactly what
 * a logged-out visitor gets, which for public tables is the whole point.
 *
 * Use it only where the answer does not depend on who is asking. Anything
 * behind a login needs `createClient` so RLS can see the user.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

/**
 * Service-role client. Bypasses Row Level Security — server-only.
 * Never import this from a Client Component.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    publicEnv.supabaseUrl,
    serverEnv.supabaseServiceRoleKey,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
