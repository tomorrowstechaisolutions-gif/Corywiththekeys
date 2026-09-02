/**
 * Finance page configuration.
 *
 * ── WHAT THIS PAGE IS ─────────────────────────────────────────────────────
 * A branded introduction to financing that hands the customer off to The Key
 * Konnect's existing secure credit application. It is NOT the credit
 * application. Nothing on this page — and nothing in our database — collects
 * an SSN, ITIN, driver's licence, date of birth, bank details or credit
 * report data. Those live with the financing provider, where they belong.
 *
 * The optional lead form here captures shopping preferences only, so Cory
 * knows who is coming and what they want. Skipping it never blocks anyone
 * from reaching the secure application.
 */

/**
 * The Key Konnect's existing secure credit application.
 *
 * Defined once. Every application CTA on the site imports this — never a
 * pasted copy — so the day the provider changes, one edit moves all of them.
 */
export const FINANCE_APPLICATION_URL =
  "https://www.accreditapp.com/ACCreditApp_spf.aspx?ACCFX=86228o12199";

/** Attributes every outbound application link. Opens in its own tab. */
export const EXTERNAL_LINK_PROPS = {
  target: "_blank",
  rel: "noopener noreferrer",
} as const;

export const HERO = {
  eyebrow: "Get Approved",
  title: "Get The Keys.",
  titleAccent: "Start Your Approval.",
  body: [
    "Good credit. Bad credit. First-time buyer.",
    "The Key Konnect will work to help you find a path forward.",
  ],
  trust: [
    { key: "credit", label: "All Credit Types Welcome" },
    { key: "secure", label: "Secure Application" },
    { key: "works", label: "The Key Konnect Works For You" },
  ],
  cta: "Start Secure Application",
  ctaNote: "Secure credit application",
  image: "/brand/finance/hero.webp",
  imageAlt:
    "Cory's blue Cybertruck at night in front of a city skyline, lettered in gold with Keys 2 Success and Cory With The Keys",
  quote: {
    lines: ["Cars open doors.", "Opportunities change lives."],
    attribution: "Cory With The Keys",
  },
} as const;

export type ProcessStep = {
  number: string;
  title: string[];
  body: string;
  image: string;
  imageAlt: string;
  /** Internal destination, rendered as a quiet link. */
  link?: { label: string; href: string };
  /** Renders the external application button on this card. */
  applyButton?: boolean;
};

export const STEPS: ProcessStep[] = [
  {
    number: "01",
    title: ["Tell Us What", "You Want"],
    body: "Choose a vehicle from our inventory or tell Cory what you're looking for.",
    image: "/brand/finance/step-1.webp",
    imageAlt: "A black performance sedan outside a modern dealership at night",
    link: { label: "View Inventory", href: "/inventory" },
  },
  {
    number: "02",
    title: ["Complete Your", "Secure Application"],
    body: "Fill out our secure credit application. It only takes a few minutes.",
    image: "/brand/finance/step-2.webp",
    imageAlt: "A credit application open on a tablet screen",
    applyButton: true,
  },
  {
    number: "03",
    title: ["The Key Konnect", "Gets To Work"],
    // Wording fixed by the client. Do not reword.
    body: "They will contact you and work to find the best vehicle and financing options for you.",
    image: "/brand/finance/step-3.webp",
    imageAlt: "A member of the team taking a call at a desk",
  },
];

export type TrustItem = { key: string; title: string; body: string };

/**
 * Deliberately understated.
 *
 * No approval guarantees, no named lenders, no encryption claims we cannot
 * stand behind, and no promised response time. Everything here is either a
 * statement of intent or a plain fact about how the process works.
 */
export const TRUST: TrustItem[] = [
  {
    key: "community",
    title: "Helping Our Community",
    body: "We believe in second chances and helping people move forward.",
  },
  {
    key: "secure",
    title: "Safe & Secure",
    body: "Your credit application is completed through The Key Konnect's secure financing application.",
  },
  {
    key: "obligation",
    title: "No Obligation",
    body: "Submitting an application does not require you to purchase a vehicle.",
  },
  {
    key: "response",
    title: "Personal Response",
    body: "The Key Konnect will follow up with you about your vehicle and financing options.",
  },
];

export const BANNER = {
  title: "More Than A Car Dealer.",
  titleAccent: "We Change Lives.",
  body: [
    "At Cory With The Keys, we don't just sell cars —",
    "we open doors to new opportunities.",
  ],
  signature: "Cory With The Keys",
  ctaTitle: ["Let's Get You", "Behind The Wheel."],
  cta: "Apply Now",
  image: "/brand/finance/banner.webp",
  imageAlt:
    "A row of vehicles on The Key Konnect lot at sunset beneath the dealership sign",
} as const;
