import { redirect } from "next/navigation";

import { landingHref, requireStaff } from "@/lib/auth";

/**
 * /admin is an alias for wherever this person's console starts.
 *
 * Not a fixed /admin/dashboard: an employee granted Inventory only has no
 * dashboard, and sending them to one they cannot open would loop.
 */
export default async function AdminIndexPage() {
  const profile = await requireStaff();
  const home = landingHref(profile);

  redirect(home ?? "/login?error=no_access");
}
