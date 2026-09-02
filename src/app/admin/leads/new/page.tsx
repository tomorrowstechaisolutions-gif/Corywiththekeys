import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/ui/Container";
import { canWrite, requireSection } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import { NewLeadForm } from "./NewLeadForm";

export const metadata: Metadata = { title: "Add a lead" };

export default async function NewLeadPage() {
  const profile = await requireSection("leads");

  if (!canWrite(profile)) {
    redirect("/admin/leads?error=forbidden");
  }

  const supabase = await createClient();
  const { data: staff } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("is_active", true)
    .in("role", ["owner", "admin", "sales"])
    .order("full_name");

  return (
    <Container className="py-8">
      <Link
        href="/admin/leads"
        className="text-sm font-medium text-navy-700 hover:text-keyblue-600"
      >
        ← Back to leads
      </Link>

      <div className="mt-4">
        <h1 className="text-2xl font-bold text-navy-900">Add a lead</h1>
        <p className="mt-1 max-w-2xl text-sm text-navy-700">
          For somebody who walked onto the lot or rang up. Anything that comes
          through the website is already here.
        </p>
      </div>

      <div className="mt-6 max-w-3xl">
        <NewLeadForm
          currentUserId={profile.id}
          staff={(staff ?? []).map((s) => ({
            id: s.id,
            name: s.full_name?.trim() || s.email,
          }))}
        />
      </div>
    </Container>
  );
}
