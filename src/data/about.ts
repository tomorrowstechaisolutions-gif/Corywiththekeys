/**
 * Everything the About page says about the business, in one place.
 *
 * The rule here is the same one used on the music page: anything we cannot
 * verify does not render. A claim about the business is not a design element
 * — a car dealer advertising "1000+ happy customers" is making a factual
 * statement a customer can rely on, so it stays switched off until someone
 * who knows the answer switches it on.
 */

export type ExternalUrl = string | null;

/** The founder's story, as approved in the design comp. */
export const STORY = {
  eyebrow: "Our Story",
  heading: "From Killeen, For Killeen.",
  paragraphs: [
    "Cory With The Keys started with a simple belief: treat people right and do business the right way.",
    "What began as a passion for cars turned into a purpose to help people get on the road to a better life.",
    "We're not here to sell you a car. We're here to build relationships that last.",
  ],
  portrait: "/brand/about/cory-cutout.webp",
  portraitAlt:
    "Cory With The Keys in a Cory With The Keys tee and cap at the dealership",
  signature: "Cory",
  signatureSub: "With The Keys",
} as const;

/**
 * The "Watch Our Story" button in the hero.
 *
 * Null until there is a real video. The button does not render without one —
 * a hero CTA that goes nowhere is worse than no CTA at all.
 */
export const STORY_VIDEO_URL: ExternalUrl = null;

/**
 * Where the hero button goes when there is no video yet: down to the story
 * section. The button still appears, as the comp shows it, but it takes the
 * visitor somewhere real instead of nowhere.
 */
export const STORY_FALLBACK_HREF = "#our-story";

export type Value = {
  key: string;
  label: string;
  body: string;
};

export const VALUES: Value[] = [
  { key: "honesty", label: "Honesty", body: "Straight answers. No games." },
  { key: "integrity", label: "Integrity", body: "We do what we say, every time." },
  { key: "community", label: "Community", body: "We support our city and give back." },
  { key: "opportunity", label: "Opportunity", body: "Everyone deserves a second chance." },
];

/**
 * Business stats.
 *
 * THESE ARE UNVERIFIED. The numbers below came from the design comp, where
 * they were placeholder copy. Advertising them is a factual claim about the
 * dealership, and in Texas an inaccurate one is a deceptive-trade-practices
 * problem, not a typo.
 *
 * Switched on at John's request so the page matches the approved comp. The
 * gate is still here: set `confirmed` back to false and the block disappears
 * cleanly. Correct any figure Cory says is wrong — these are published
 * claims now, not layout.
 */
export const STATS = {
  confirmed: true,
  items: [
    { value: "10+", label: "Years in Business" },
    { value: "1000+", label: "Happy Customers" },
    { value: "5★", label: "Customer Rating" },
    { value: "1", label: "Community We Serve" },
  ],
} as const;

export type StaffMember = {
  name: string;
  role: string | null;
  photo: string;
};

/**
 * The team, in front of the People Over Profit mural.
 *
 * Only people whose names are confirmed appear here. There is a fourth badge
 * photo in the asset folder — `/brand/about/staff-unnamed.webp`, the man in
 * the tan suit — saved under a filename that does not identify him. Putting
 * the wrong name on a colleague's photo on a public website is not a bug you
 * can quietly fix later, so he is left out until someone confirms who he is
 * and what he does.
 *
 * Roles are null for the same reason: the filenames carry sales nicknames
 * ("Done Deal", "Drive Today"), not job titles.
 */
export const STAFF: StaffMember[] = [
  { name: "Devin Gill", role: null, photo: "/brand/about/staff-devin.webp" },
  { name: "Jay", role: null, photo: "/brand/about/staff-jay.webp" },
  { name: "Ms. Wanda", role: null, photo: "/brand/about/staff-wanda.webp" },
];

export type GalleryItem = {
  src: string;
  alt: string;
  caption: string | null;
  /** Spans two columns on desktop. */
  wide?: boolean;
  /** Tailwind object-position class, when centre is the wrong crop. */
  objectPosition?: string;
};

export const GALLERY: GalleryItem[] = [
  {
    src: "/brand/about/office.webp",
    alt: "The Key Konnect team talking with a customer at the sales desk",
    caption: "Straight talk at the desk.",
    objectPosition: "object-[center_35%]",
  },
  {
    src: "/brand/about/cory-portrait.webp",
    alt: "Cory With The Keys performing on stage",
    caption: "On the mic.",
    objectPosition: "object-[center_20%]",
  },
  {
    src: "/brand/about/ribbon-cutting.webp",
    alt: "A ribbon-cutting ceremony with families and community members outside The Key Konnect",
    caption: "Ribbon cutting with the community.",
    wide: true,
  },
];

export const HERO = {
  eyebrow: "About",
  name: "Cory",
  script: "With The Keys",
  lines: [
    "More than a car lot.",
    "It's a movement built on trust,",
    "loyalty and community.",
  ],
  image: "/brand/about/hero-team.webp",
  imageAlt:
    "The Key Konnect team standing together beneath the dealership sign in Killeen, Texas",
} as const;
