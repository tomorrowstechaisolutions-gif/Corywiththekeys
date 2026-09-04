/**
 * Who built and owns this console.
 *
 * Deliberately compiled in rather than stored in `site_settings`. Everything
 * on the Settings screen is the dealership's to change; this is not. Putting
 * it in the database would make the vendor's own credit editable — and
 * removable — by the client's staff, which is the opposite of the point.
 *
 * Imports nothing, so both the server-rendered sign-in page and any client
 * component can read it.
 *
 * NOTE FOR WHOEVER MAINTAINS THIS: the notice below is a statement of the
 * position, not the agreement itself. What is actually licensed, to whom, on
 * what terms and what happens at the end of it lives in the contract between
 * TomorrowsTech AI Solutions and the dealership. A line on a sign-in screen
 * does not create rights; it only tells anyone signing in where to look.
 */
export const PLATFORM = {
  vendor: "TomorrowsTech AI Solutions",
  vendorShort: "TomorrowsTech",
  vendorUrl: "https://tomorrowstechai.com",
  /** Shown under the sign-in card. Keep it to one short sentence. */
  notice: "Proprietary platform. Licensed, not sold.",
} as const;
