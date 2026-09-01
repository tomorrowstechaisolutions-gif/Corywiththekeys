/**
 * The Key Konnect merch store — catalogue, collections and store settings.
 *
 * ── TWO THINGS TO READ BEFORE THIS STORE TAKES MONEY ──────────────────────
 *
 * 1. PRODUCT IMAGES ARE THE DESIGNER'S RENDERS, NOT PHOTOGRAPHS.
 *    Every file under /brand/shop/product-*.webp was lifted from the design
 *    mockup. They show what the garments are meant to look like; nobody has
 *    photographed the actual stock. Selling a $65 hoodie against a render is
 *    how you end up with chargebacks and "this isn't what I ordered", so each
 *    product carries `photographyIsRender: true` until a real photo replaces
 *    it. `STORE.checkoutEnabled` stays false while any of them is still true.
 *
 * 2. THERE ARE NO REVIEWS YET.
 *    The mockup shows three glowing quotes with names attached. They are the
 *    designer's filler. Publishing invented reviews as genuine is illegal in
 *    the US — the FTC's rule on fake consumer reviews carries civil penalties
 *    per violation — so REVIEWS is empty and the section hides itself. Wire it
 *    to the `reviews` table, or paste in real ones people actually sent.
 */

export type Money = number;

export type ColorOption = {
  name: string;
  /** CSS colour for the swatch dot. */
  hex: string;
};

export type ProductImage = {
  src: string;
  alt: string;
};

export type Product = {
  slug: string;
  name: string;
  category: string;
  subtitle: string;
  price: Money;
  compareAt: Money | null;
  images: ProductImage[];
  colors: ColorOption[];
  sizes: string[];
  isNew: boolean;
  collection: string;
  description: string;
  details: string[];
  /** True while the imagery is a mockup render rather than a real photo. */
  photographyIsRender: boolean;
};

export const SIZES = ["S", "M", "L", "XL", "2XL", "3XL"] as const;

export const PRODUCTS: Product[] = [
  {
    slug: "keys-2-success-signature-hoodie",
    name: "Keys 2 Success",
    category: "Keys 2 Success",
    subtitle: "Signature Hoodie – Red",
    price: 65,
    compareAt: null,
    images: [
      {
        src: "/brand/shop/product-1.webp",
        alt: "Keys 2 Success signature hoodie in red, front and back",
      },
    ],
    colors: [
      { name: "Red", hex: "#c0231f" },
      { name: "Black", hex: "#111318" },
      { name: "Gold", hex: "#d6a321" },
      { name: "Charcoal", hex: "#3b3f45" },
    ],
    sizes: [...SIZES],
    isNew: true,
    collection: "keys-2-success",
    description:
      "The signature piece. Heavyweight fleece with the Keys 2 Success script across the chest and again across the back, so it reads from either side of the room.",
    details: [
      "Heavyweight cotton-blend fleece",
      "Double-lined hood with flat drawcords",
      "Front pouch pocket, ribbed cuffs and hem",
      "Screen-printed script front and back",
    ],
    photographyIsRender: true,
  },
  {
    slug: "sober-truth-crewneck",
    name: "Sober Truth",
    category: "Statement",
    subtitle: "Crewneck – Heather Gray",
    price: 55,
    compareAt: null,
    images: [
      {
        src: "/brand/shop/product-2.webp",
        alt: "Sober Truth crewneck in heather gray, front and back",
      },
    ],
    colors: [
      { name: "Heather Gray", hex: "#9aa0a6" },
      { name: "Black", hex: "#111318" },
      { name: "Charcoal", hex: "#3b3f45" },
    ],
    sizes: [...SIZES],
    isNew: true,
    collection: "statement-tees",
    description:
      "Says the quiet part out loud. Keys 2 Success script on the front, the punchline across the back.",
    details: [
      "Midweight cotton-blend fleece crewneck",
      "Ribbed collar, cuffs and hem",
      "Front script, back statement print",
    ],
    photographyIsRender: true,
  },
  {
    slug: "hustle-harder-hoodie",
    name: "Hustle Harder",
    category: "Hustle",
    subtitle: "Hoodie – Black",
    price: 65,
    compareAt: null,
    images: [
      {
        src: "/brand/shop/product-3.webp",
        alt: "Hustle Harder hoodie in black, front and back",
      },
    ],
    colors: [
      { name: "Black", hex: "#111318" },
      { name: "Red", hex: "#c0231f" },
      { name: "Bone", hex: "#e8e4dc" },
    ],
    sizes: [...SIZES],
    isNew: true,
    collection: "hustle",
    description:
      "No one cares. Hustle harder. Crossed keys on the chest, the reminder stacked down the back in four lines you can read across a parking lot.",
    details: [
      "Heavyweight fleece with a structured hood",
      "Crossed-keys chest mark",
      "Four-line back print with signature",
    ],
    photographyIsRender: true,
  },
  {
    slug: "mind-to-hustle-tee",
    name: "Mind To Hustle",
    category: "Statement",
    subtitle: "Premium Tee – White",
    price: 35,
    compareAt: null,
    images: [
      {
        src: "/brand/shop/product-4.webp",
        alt: "Mind To Hustle premium tee in white, front and back",
      },
    ],
    colors: [
      { name: "White", hex: "#f2f2f0" },
      { name: "Red", hex: "#c0231f" },
      { name: "Navy", hex: "#16305a" },
    ],
    sizes: [...SIZES],
    isNew: true,
    collection: "statement-tees",
    description:
      "You can do anything you put your mind to, if you hustle hard enough. Anatomical brain graphic with the quote set around it.",
    details: [
      "Premium combed-cotton tee",
      "Ribbed crew neck, shoulder-to-shoulder taping",
      "Full-colour back graphic, script signature",
    ],
    photographyIsRender: true,
  },
];

export type Collection = {
  slug: string;
  title: string;
  image: string;
  alt: string;
};

export const COLLECTIONS: Collection[] = [
  {
    slug: "keys-2-success",
    title: "Keys 2 Success",
    image: "/brand/shop/collection-1.webp",
    alt: "Keys 2 Success hoodie worn from behind",
  },
  {
    slug: "cory-with-the-keys",
    title: "Cory With The Keys",
    image: "/brand/shop/collection-2.webp",
    alt: "Cory With The Keys tee worn from behind",
  },
  {
    slug: "hustle",
    title: "Hustle Collection",
    image: "/brand/shop/collection-3.webp",
    alt: "Hustle Harder hoodie worn from behind",
  },
  {
    slug: "statement-tees",
    title: "Statement Tees",
    image: "/brand/shop/collection-4.webp",
    alt: "Mind To Hustle tee worn from behind",
  },
];

export type Benefit = { key: string; title: string; body?: string };

/** Compact strip under the hero. */
export const HERO_BENEFITS: Benefit[] = [
  { key: "hustle", title: "Built On Hustle" },
  { key: "people", title: "People Over Profit" },
  { key: "quality", title: "Quality You Can Feel" },
  { key: "shipping", title: "Fast Shipping" },
];

/** Full row further down the page. */
export const BENEFITS: Benefit[] = [
  {
    key: "quality",
    title: "Premium Quality",
    body: "Top tier materials that feel as good as they look.",
  },
  {
    key: "purpose",
    title: "Built On Purpose",
    body: "Every drop is designed to inspire and motivate.",
  },
  {
    key: "shipping",
    title: "Fast Shipping",
    body: "Quick, reliable shipping straight to your door.",
  },
  {
    key: "returns",
    title: "Easy Returns",
    body: "Hassle-free returns within 15 days.",
  },
  {
    key: "secure",
    title: "Secure Checkout",
    body: "Safe, encrypted and secure payments.",
  },
];

export type Review = {
  quote: string;
  author: string;
  rating: number;
};

/**
 * Empty on purpose — see the note at the top of this file. Add real reviews
 * here (or read them from the `reviews` table) and the section appears.
 */
export const REVIEWS: Review[] = [];

export type GalleryShot = { src: string; alt: string };

/** Real photographs only. Merch-in-the-wild shots go here as they arrive. */
export const MOVEMENT: GalleryShot[] = [
  {
    src: "/brand/about/ribbon-cutting.webp",
    alt: "Ribbon cutting with families and community members",
  },
  { src: "/brand/music-hero.webp", alt: "Cory performing on stage beside a car" },
  {
    src: "/brand/about/office.webp",
    alt: "The Key Konnect team at the sales desk",
  },
  {
    src: "/brand/about/hero-team.webp",
    alt: "The Key Konnect team beneath the dealership sign",
  },
  { src: "/brand/inventory-hero.webp", alt: "Cars on the lot at The Key Konnect" },
];

export const STORE = {
  /**
   * Master switch for taking orders.
   *
   * Off until there is (a) real product photography and (b) a payment
   * processor and fulfilment behind it. With it off the cart still works, so
   * the whole flow is testable, but the final step invites the customer to
   * message Cory rather than pretending to charge a card that goes nowhere.
   */
  checkoutEnabled: false,
  currency: "USD",
  freeShippingOver: 100,
  returnsWindowDays: 15,
} as const;

export const QUOTE = {
  lines: ["You can do anything", "you put your mind to"],
  emphasis: ["if you hustle", "hard enough."],
  attribution: "Cory with the keys",
  headline: "More Than Merch.",
  headlineAccent: "It's A Movement.",
  body:
    "Every piece represents hustle, loyalty, and showing up every day for your dreams and your people.",
} as const;

export function formatPrice(value: Money): string {
  return `$${value.toFixed(2)}`;
}

export function productsInCollection(slug: string): Product[] {
  return PRODUCTS.filter((p) => p.collection === slug);
}

export function findProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

/** True while any product is still shown with mockup art. */
export const HAS_RENDER_PHOTOGRAPHY = PRODUCTS.some((p) => p.photographyIsRender);
