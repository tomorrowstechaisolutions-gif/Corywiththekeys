import type { ReactNode } from "react";
import type { ContactTopic } from "@/lib/validation/contact";

/**
 * The "What can we help with?" list.
 *
 * Each card is a shortcut: it preselects the matching topic on the form, and
 * where a better-suited page already exists it links there instead. Someone
 * who wants financing is better served by /apply than by typing it out.
 */
export type HelpTopic = {
  key: string;
  /** Must match one of CONTACT_TOPICS so the select can be preset. */
  topic: ContactTopic;
  title: string;
  body: string;
  /** Optional destination that serves this need better than the form. */
  href?: string;
};

export const TOPICS: HelpTopic[] = [
  {
    key: "car",
    topic: "Buy a car",
    title: "Buy A Car",
    body: "Pricing, financing, trade-ins",
    href: "/inventory",
  },
  {
    key: "merch",
    topic: "Merch & orders",
    title: "Merch & Orders",
    body: "Product questions, order support, returns",
    href: "/shop",
  },
  {
    key: "music",
    topic: "Music / media",
    title: "Music / Media",
    body: "Music, podcast, interviews, appearances",
    href: "/music",
  },
  {
    key: "partnerships",
    topic: "Partnerships",
    title: "Partnerships",
    body: "Sponsorships, collaborations, business opportunities",
  },
  {
    key: "community",
    topic: "Community",
    title: "Community",
    body: "Events, outreach, local initiatives",
  },
  {
    key: "general",
    topic: "General question",
    title: "General Question",
    body: "Anything else",
  },
];

export const HERO = {
  eyebrow: "Get In Touch",
  title: "Let's",
  titleAccent: "Konnect.",
  lead: "Cars. Merch. Music. Community.",
  body: "Whatever brought you here, we'll get you to the right place.",
  image: "/brand/contact/hero-car.webp",
  /** Decorative: the words beside it already say everything it says. */
  imageAlt: "",
} as const;

export const CTA = {
  eyebrow: "Need A Car?",
  title: "Looking For",
  titleAccent: "Your Next Ride?",
  body: "Skip the contact form and start shopping now.",
  image: "/brand/contact/cta-car.webp",
  imageAlt: "",
} as const;

export type IconKey =
  | "car"
  | "merch"
  | "music"
  | "partnerships"
  | "community"
  | "general";

export type { ReactNode };
