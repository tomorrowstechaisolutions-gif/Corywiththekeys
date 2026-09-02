import Link from "next/link";

import { Container } from "@/components/ui/Container";
import type { SiteSettings } from "@/lib/settings";

/**
 * The strip above the header. Renders nothing at all unless Cory has both
 * written a message and switched it on, so the normal state of the site is
 * exactly as it was before this existed.
 *
 * Gold on navy rather than the usual red alert bar: this is used far more
 * often for a sale or a new drop than for something going wrong.
 */
export function AnnouncementBar({ settings }: { settings: SiteSettings }) {
  const announcement = settings.announcement;
  if (!announcement) return null;

  const message = (
    <span className="block text-center text-sm font-semibold text-navy-950">
      {announcement.text}
      {announcement.href ? (
        <span className="ml-2 underline underline-offset-2" aria-hidden>
          →
        </span>
      ) : null}
    </span>
  );

  return (
    <div className="bg-gold-500 py-2">
      <Container>
        {announcement.href ? (
          <Link
            href={announcement.href}
            className="block rounded transition hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-950"
          >
            {message}
          </Link>
        ) : (
          message
        )}
      </Container>
    </div>
  );
}
