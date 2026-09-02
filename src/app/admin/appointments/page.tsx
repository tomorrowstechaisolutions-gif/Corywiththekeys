import type { Metadata } from "next";

import { PagePlaceholder } from "@/components/ui/PagePlaceholder";
import { requireSection } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Appointments",
};

export default async function AdminAppointmentsPage() {
  await requireSection("appointments");

  return (
    <PagePlaceholder
      eyebrow="Admin"
      title="Appointments"
      description="Test drives, deliveries and consultations."
      scope={[
        "Calendar and day views",
        "Booking and rescheduling",
        "Reminder notifications",
        "No-show tracking",
      ]}
    />
  );
}
