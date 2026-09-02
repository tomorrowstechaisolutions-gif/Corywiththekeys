"use client";

import { useActionState, useState } from "react";

import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { SocialGlyph } from "@/components/ui/SocialIcon";
import { DAY_LABELS } from "@/lib/validation/settings";
import type { Database } from "@/types/database";

import {
  saveBusiness,
  saveHours,
  saveNotifications,
  saveSocials,
  saveSwitches,
  type SettingsState,
} from "./actions";
import { SettingsCard, Toggle } from "./SettingsCard";

type SettingsRow = Database["public"]["Tables"]["site_settings"]["Row"];
type HoursRow = Database["public"]["Tables"]["business_hours"]["Row"];
type NotificationsRow =
  Database["public"]["Tables"]["notification_settings"]["Row"];

const EMPTY: SettingsState = {};

/** "09:00:00" from Postgres, "09:00" for <input type="time">. */
function toTimeInput(value: string | null): string {
  if (!value) return "";
  return value.slice(0, 5);
}

export function BusinessForm({ settings }: { settings: SettingsRow }) {
  const [state, action] = useActionState(saveBusiness, EMPTY);
  const err = (f: string) => state.fieldErrors?.[f];

  return (
    <SettingsCard
      title="Business details"
      description="The phone number, email and address printed in the footer of every page, on the contact page, and in the listing that search engines read."
      state={state}
      action={action}
      footnote="Changing the address here also moves the Get Directions link, so it will always point at wherever the lot actually is."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone" htmlFor="phone" error={err("phone")}>
          <TextInput
            id="phone"
            name="phone"
            inputMode="tel"
            defaultValue={settings.phone ?? ""}
          />
        </Field>

        <Field label="Email" htmlFor="email" error={err("email")}>
          <TextInput
            id="email"
            name="email"
            type="email"
            defaultValue={settings.email ?? ""}
          />
        </Field>

        <Field
          label="Street address"
          htmlFor="addressLine1"
          error={err("addressLine1")}
          className="sm:col-span-2"
        >
          <TextInput
            id="addressLine1"
            name="addressLine1"
            defaultValue={settings.address_line1 ?? ""}
          />
        </Field>

        <Field
          label="Suite / unit"
          htmlFor="addressLine2"
          error={err("addressLine2")}
          hint="Leave blank if there isn't one."
        >
          <TextInput
            id="addressLine2"
            name="addressLine2"
            defaultValue={settings.address_line2 ?? ""}
          />
        </Field>

        <Field label="City" htmlFor="city" error={err("city")}>
          <TextInput id="city" name="city" defaultValue={settings.city ?? ""} />
        </Field>

        <Field label="State" htmlFor="state" error={err("state")}>
          <TextInput
            id="state"
            name="state"
            maxLength={2}
            defaultValue={settings.state ?? ""}
          />
        </Field>

        <Field label="ZIP" htmlFor="postalCode" error={err("postalCode")}>
          <TextInput
            id="postalCode"
            name="postalCode"
            inputMode="numeric"
            defaultValue={settings.postal_code ?? ""}
          />
        </Field>
      </div>
    </SettingsCard>
  );
}

export function HoursForm({ hours }: { hours: HoursRow[] }) {
  const [state, action] = useActionState(saveHours, EMPTY);

  const byDay = new Map(hours.map((row) => [row.day_of_week, row]));
  const [closed, setClosed] = useState<boolean[]>(() =>
    DAY_LABELS.map((_, day) => byDay.get(day)?.is_closed ?? false),
  );

  const err = (f: string) => state.fieldErrors?.[f];

  return (
    <SettingsCard
      title="Opening hours"
      description="Set each day. Days in a row that share the same hours are joined up automatically, so Monday to Friday reads as one line rather than five."
      state={state}
      action={action}
      saveLabel="Save hours"
      footnote="For a one-off closure — a holiday, a family thing — leave these alone and use the announcement banner below instead. That way the normal hours come back by themselves."
    >
      <ul className="space-y-2.5">
        {DAY_LABELS.map((label, day) => {
          const row = byDay.get(day);
          const isClosed = closed[day];

          return (
            <li
              key={label}
              className="grid grid-cols-[7.5rem_1fr] items-center gap-3 rounded-md border border-slate-200 p-3 sm:grid-cols-[8rem_auto_auto_1fr]"
            >
              <span className="text-sm font-semibold text-navy-900">
                {label}
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="time"
                  name={`opens-${day}`}
                  aria-label={`${label} opening time`}
                  disabled={isClosed}
                  defaultValue={toTimeInput(row?.opens ?? null)}
                  className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-navy-900 disabled:bg-slate-100 disabled:text-slate-400"
                />
                <span className="text-sm text-navy-700">to</span>
                <input
                  type="time"
                  name={`closes-${day}`}
                  aria-label={`${label} closing time`}
                  disabled={isClosed}
                  defaultValue={toTimeInput(row?.closes ?? null)}
                  className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-navy-900 disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>

              <label className="col-span-2 flex cursor-pointer items-center gap-2 sm:col-span-1">
                <input
                  type="checkbox"
                  name={`closed-${day}`}
                  checked={isClosed}
                  onChange={(event) =>
                    setClosed((current) =>
                      current.map((value, index) =>
                        index === day ? event.target.checked : value,
                      ),
                    )
                  }
                  className="h-4 w-4 rounded border-slate-300 text-keyblue-600 focus:ring-keyblue-500"
                />
                <span className="text-sm text-navy-900">Closed</span>
              </label>

              {err(`opens-${day}`) || err(`closes-${day}`) ? (
                <p className="col-span-2 text-xs text-red-700 sm:col-span-4">
                  {err(`opens-${day}`) ?? err(`closes-${day}`)}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </SettingsCard>
  );
}

const SOCIAL_FIELDS = [
  {
    name: "facebookUrl",
    icon: "facebook",
    label: "Facebook",
    column: "facebook_url",
    placeholder: "https://www.facebook.com/…",
  },
  {
    name: "instagramUrl",
    icon: "instagram",
    label: "Instagram",
    column: "instagram_url",
    placeholder: "https://www.instagram.com/…",
  },
  {
    name: "tiktokUrl",
    icon: "tiktok",
    label: "TikTok",
    column: "tiktok_url",
    placeholder: "https://www.tiktok.com/@…",
  },
  {
    name: "snapchatUrl",
    icon: "snapchat",
    label: "Snapchat",
    column: "snapchat_url",
    placeholder: "https://www.snapchat.com/@…",
  },
  {
    name: "youtubeUrl",
    icon: "youtube",
    label: "YouTube",
    column: "youtube_url",
    placeholder: "https://www.youtube.com/@…",
  },
  {
    name: "linktreeUrl",
    icon: "linktree",
    label: "Linktree",
    column: "linktree_url",
    placeholder: "https://linktr.ee/…",
  },
] as const;

export function SocialsForm({ settings }: { settings: SettingsRow }) {
  const [state, action] = useActionState(saveSocials, EMPTY);
  const err = (f: string) => state.fieldErrors?.[f];

  return (
    <SettingsCard
      title="Social links"
      description="The icons in the footer and on the contact page. Empty means the icon is not shown at all — better than an icon that goes nowhere."
      state={state}
      action={action}
      saveLabel="Save links"
      footnote="Paste the full address from the browser bar. Anything that is not a normal https:// link is refused, because whatever goes here ends up on every page of the site."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {SOCIAL_FIELDS.map((field) => (
          <Field
            key={field.name}
            label={field.label}
            htmlFor={field.name}
            error={err(field.name)}
          >
            <div className="mt-1 flex items-center gap-2.5">
              <span className="text-navy-700" aria-hidden>
                <SocialGlyph name={field.icon} className="h-5 w-5" />
              </span>
              <TextInput
                id={field.name}
                name={field.name}
                inputMode="url"
                placeholder={field.placeholder}
                className="mt-0"
                defaultValue={settings[field.column] ?? ""}
              />
            </div>
          </Field>
        ))}
      </div>
    </SettingsCard>
  );
}

export function SwitchesForm({ settings }: { settings: SettingsRow }) {
  const [state, action] = useActionState(saveSwitches, EMPTY);
  const [bannerOn, setBannerOn] = useState(settings.announcement_enabled);
  const err = (f: string) => state.fieldErrors?.[f];

  return (
    <SettingsCard
      title="Site switches"
      description="Things you can turn on and off without anyone touching the code."
      state={state}
      action={action}
      saveLabel="Save switches"
    >
      <div className="space-y-4">
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <label className="flex cursor-not-allowed items-start gap-2.5">
            <input
              type="checkbox"
              name="shopCheckoutEnabled"
              disabled
              checked={settings.shop_checkout_enabled}
              readOnly
              className="mt-0.5 h-4 w-4 rounded border-slate-300"
            />
            <span>
              <span className="block text-sm font-medium text-navy-900">
                Take card payments in the merch store
              </span>
              <span className="block text-xs leading-relaxed text-navy-700">
                Not available yet, so this is switched off and locked. There is
                no checkout page and no card processor behind one — turning it
                on would put a Checkout button in the bag that leads nowhere and
                lose the order. Today the bag says &ldquo;text Cory to
                order&rdquo;, which works. Ask and I&rsquo;ll build the real
                checkout.
              </span>
            </span>
          </label>
        </div>

        <Toggle
          name="showInventoryPrices"
          label="Show prices on vehicle listings"
          hint="Turn off to replace every price with “Call for price”. Some lots do this for cars they would rather discuss in person."
          defaultChecked={settings.show_inventory_prices}
        />

        <div className="rounded-md border border-slate-200 p-4">
          <Toggle
            name="announcementEnabled"
            label="Show an announcement bar at the top of the site"
            hint="For a holiday closure, a sale, a new drop. It sits above the menu on every page."
            checked={bannerOn}
            onChange={setBannerOn}
          />

          <div className="mt-4 grid gap-4">
            <Field
              label="Banner message"
              htmlFor="announcementText"
              error={err("announcementText")}
              hint="Up to 240 characters."
            >
              <TextArea
                id="announcementText"
                name="announcementText"
                maxLength={240}
                placeholder="Closed Thursday for the holiday — back Friday at 9."
                defaultValue={settings.announcement_text ?? ""}
              />
            </Field>

            <Field
              label="Link (optional)"
              htmlFor="announcementHref"
              error={err("announcementHref")}
              hint="Give the banner somewhere to go when someone taps it. Leave blank for plain text."
            >
              <TextInput
                id="announcementHref"
                name="announcementHref"
                inputMode="url"
                placeholder="https://thekeykonnect.com/inventory"
                defaultValue={settings.announcement_href ?? ""}
              />
            </Field>
          </div>
        </div>
      </div>
    </SettingsCard>
  );
}

export function NotificationsForm({
  notifications,
}: {
  notifications: NotificationsRow;
}) {
  const [state, action] = useActionState(saveNotifications, EMPTY);
  const err = (f: string) => state.fieldErrors?.[f];

  return (
    <SettingsCard
      title="Where notifications go"
      description="The inbox that should hear about a new lead or a new message."
      state={state}
      action={action}
      saveLabel="Save addresses"
      footnote="These are stored privately and are never shown on the website — unlike the business email above, which is public."
    >
      <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        Nothing sends email yet. Every enquiry is saved and waiting in Leads and
        Messages, and it is safe to fill these in now, but no mail will arrive
        until a sending service is connected.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="New leads"
          htmlFor="leadsEmail"
          error={err("leadsEmail")}
          hint="Finance enquiries, availability questions, find-my-car."
        >
          <TextInput
            id="leadsEmail"
            name="leadsEmail"
            type="email"
            defaultValue={notifications.leads_email ?? ""}
          />
        </Field>

        <Field
          label="New messages"
          htmlFor="messagesEmail"
          error={err("messagesEmail")}
          hint="The contact form."
        >
          <TextInput
            id="messagesEmail"
            name="messagesEmail"
            type="email"
            defaultValue={notifications.messages_email ?? ""}
          />
        </Field>
      </div>
    </SettingsCard>
  );
}
