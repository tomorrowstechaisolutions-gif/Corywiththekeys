/**
 * Storage bucket names.
 *
 * Their own file with no imports, and that is the whole point. Bucket names
 * are needed on both sides — the browser uploads into them, the server signs
 * and verifies them — and anything that also reaches for the Supabase server
 * client is `server-only`, which breaks the build the moment a client
 * component imports it. Keeping the plain strings here means both sides can
 * name the same bucket without dragging the server along.
 *
 * This has now caught us three times (the admin sidebar, the team form, the
 * avatar uploader). The pattern: constants a client component needs live in a
 * module that imports nothing.
 */
export const AVATAR_BUCKET = "staff-avatars";
export const VEHICLE_PHOTO_BUCKET = "vehicle-photos";
export const PRODUCT_PHOTO_BUCKET = "product-photos";
export const TRADE_IN_PHOTO_BUCKET = "trade-in-photos";
