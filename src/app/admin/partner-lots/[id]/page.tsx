import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/ui/Container";
import { canWrite, requireSection } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

import { updatePartnerLot } from "../actions";
import { PartnerLotForm } from "../PartnerLotForm";

export const metadata: Metadata = { title: "Edit partner lot" };

export default async function EditPartnerLotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireSection("partner-lots");
  const { id } = await params;

  const supabase = await createClient();
  const { data: lot } = await supabase
    .from("partner_lots")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!lot) notFound();

  const editable = canWrite(profile);

  return (
    <Container className="py-8">
      <nav className="text-xs text-navy-700">
        <Link href="/admin/partner-lots" className="hover:text-keyblue-600">
          Partner lots
        </Link>
        <span className="mx-1.5">/</span>
        <span>{lot.name}</span>
      </nav>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">{lot.name}</h1>
          <p className="mt-1 text-sm text-navy-700">
            {[lot.city, lot.state].filter(Boolean).join(", ") ||
              "No location on file"}
          </p>
        </div>

        {lot.website ? (
          <a
            href={lot.website}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-navy-700 hover:bg-slate-50"
          >
            Visit website ↗
          </a>
        ) : null}
      </div>

      {!editable ? (
        <p className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          You are signed in as a viewer, so this record is read-only.
        </p>
      ) : (
        <div className="mt-6 max-w-4xl">
          <PartnerLotForm
            action={updatePartnerLot.bind(null, lot.id)}
            lot={lot}
            submitLabel="Save changes"
          />
        </div>
      )}
    </Container>
  );
}
