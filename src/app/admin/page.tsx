import { redirect } from "next/navigation";

/** /admin is an alias for the dashboard. */
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
