/**
 * Every external music and social destination, in one place.
 *
 * HOW TO EDIT
 * -----------
 * A `null` URL means "we do not have this link yet". The page treats null as
 * a signal, not a value: the button, card or platform row simply does not
 * render. Nothing on the site links to a dead or invented URL, and nothing
 * shows a play button that cannot play.
 *
 * So: paste a real URL to switch a feature on, leave null to keep it off.
 * No component needs changing either way.
 *
 * Video thumbnails come free from a YouTube id — set `youtubeId` and the
 * artwork is fetched from YouTube automatically, no image file needed.
 */

export type ExternalUrl = string | null;

export type PlatformKey =
  | "spotify"
  | "appleMusic"
  | "youtubeMusic"
  | "youtube"
  | "tiktok"
  | "instagram"
  | "facebook"
  | "snapchat"
  | "linktree";

export type Profile = {
  key: PlatformKey;
  label: string;
  handle: string | null;
  url: ExternalUrl;
  /** Tailwind classes for the platform's brand colour. */
  accent: string;
};

/**
 * Cory's profiles. Only Linktree is confirmed; the rest are waiting on real
 * handles and URLs from Cory.
 */
export const PROFILES: Profile[] = [
  {
    key: "tiktok",
    label: "TikTok",
    handle: "@corywiththekeys",
    url: null,
    accent: "bg-black text-white",
  },
  {
    key: "instagram",
    label: "Instagram",
    handle: "@corywiththekeys",
    url: null,
    accent: "bg-linear-to-br from-fuchsia-600 to-amber-500 text-white",
  },
  {
    key: "facebook",
    label: "Facebook",
    handle: "/corywiththekeys",
    url: null,
    accent: "bg-[#1877F2] text-white",
  },
  {
    key: "youtube",
    label: "YouTube",
    handle: "/corywiththekeys",
    url: null,
    accent: "bg-[#FF0000] text-white",
  },
  {
    key: "snapchat",
    label: "Snapchat",
    handle: "corywiththekeys",
    url: null,
    accent: "bg-[#FFFC00] text-black",
  },
];

/** Confirmed. Kept as a secondary destination — the site is the main event. */
export const LINKTREE_URL = "https://linktr.ee/corywiththekeys";

export type StreamingLinks = {
  spotify: ExternalUrl;
  appleMusic: ExternalUrl;
  youtubeMusic: ExternalUrl;
};

export const EMPTY_STREAMING: StreamingLinks = {
  spotify: null,
  appleMusic: null,
  youtubeMusic: null,
};

export type Release = {
  title: string;
  featuring: string | null;
  blurb: string;
  /** Path under /public, or null until artwork is supplied. */
  artwork: string | null;
  youtubeId: string | null;
  links: StreamingLinks;
};

export const NEW_RELEASE: Release = {
  title: "I Am the 1",
  featuring: "Chalie Boy",
  blurb: "The new anthem is here. Stream it now on all platforms.",
  artwork: null,
  youtubeId: null,
  links: EMPTY_STREAMING,
};

export type MusicVideo = {
  title: string;
  subtitle: string | null;
  /** Set this and the thumbnail comes from YouTube automatically. */
  youtubeId: string | null;
  /** Only needed if the video lives somewhere other than YouTube. */
  url: ExternalUrl;
  thumbnail: string | null;
};

export const MUSIC_VIDEOS: MusicVideo[] = [
  { title: "I Am the 1", subtitle: "feat. Chalie Boy", youtubeId: null, url: null, thumbnail: null },
  { title: "Started From The Bottom", subtitle: "with Lil' Flip", youtubeId: null, url: null, thumbnail: null },
  { title: "Lost With You", subtitle: null, youtubeId: null, url: null, thumbnail: null },
  { title: "Drive Away", subtitle: null, youtubeId: null, url: null, thumbnail: null },
];

export type Track = {
  title: string;
  featuring: string | null;
  artwork: string | null;
  links: StreamingLinks;
};

export const POPULAR_TRACKS: Track[] = [
  { title: "Started From The Bottom", featuring: "Lil' Flip", artwork: null, links: EMPTY_STREAMING },
  { title: "Lost With You", featuring: null, artwork: null, links: EMPTY_STREAMING },
  { title: "Drive Away", featuring: null, artwork: null, links: EMPTY_STREAMING },
  { title: "Ride", featuring: null, artwork: null, links: EMPTY_STREAMING },
  { title: "Put You in a Ride", featuring: null, artwork: null, links: EMPTY_STREAMING },
  { title: "Callin My Phone", featuring: null, artwork: null, links: EMPTY_STREAMING },
  { title: "This Moment", featuring: null, artwork: null, links: EMPTY_STREAMING },
  { title: "13 Years Old", featuring: null, artwork: null, links: EMPTY_STREAMING },
];

export type Feature = {
  title: string;
  description: string | null;
  eyebrow: string | null;
  ctaLabel: string;
  youtubeId: string | null;
  url: ExternalUrl;
  thumbnail: string | null;
};

export const FEATURES: Feature[] = [
  {
    title: "Signing to Lil Flip, Prison, Selling Cars & My Story",
    description:
      "Cory opens up about the grind, the come up, and the passion behind the music and the business.",
    eyebrow: "Interview",
    ctaLabel: "Watch Interview",
    youtubeId: null,
    url: null,
    thumbnail: null,
  },
  {
    title: "On The Come Up",
    description: "With Cory With The Keys.",
    eyebrow: null,
    ctaLabel: "Watch Now",
    youtubeId: null,
    url: null,
    thumbnail: null,
  },
  {
    title: "Secret CK Cypher",
    description: null,
    eyebrow: "Featured on",
    ctaLabel: "Watch Performance",
    youtubeId: null,
    url: null,
    thumbnail: null,
  },
];

/** "View all" destinations. Null hides the link rather than dead-ending. */
export const ALL_VIDEOS_URL: ExternalUrl = null;
export const ALL_MUSIC_URL: ExternalUrl = null;
export const ALL_FEATURES_URL: ExternalUrl = null;

/** YouTube publishes thumbnails at a predictable path — no asset needed. */
export function youtubeThumbnail(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

/**
 * The best available destination for a piece of media, or null.
 *
 * Both fields are optional so releases (which have no standalone `url`) and
 * videos (which may) can share one helper.
 */
export function mediaUrl(item: {
  youtubeId?: string | null;
  url?: ExternalUrl;
}): ExternalUrl {
  if (item.url) return item.url;
  if (item.youtubeId) return youtubeWatchUrl(item.youtubeId);
  return null;
}

/** The best available image, or null to fall back to a branded tile. */
export function mediaImage(item: {
  youtubeId?: string | null;
  thumbnail?: string | null;
}): string | null {
  if (item.thumbnail) return item.thumbnail;
  if (item.youtubeId) return youtubeThumbnail(item.youtubeId);
  return null;
}

export const STREAMING_LABELS: {
  key: keyof StreamingLinks;
  label: string;
  accent: string;
}[] = [
  { key: "spotify", label: "Spotify", accent: "bg-[#1DB954] text-black" },
  { key: "appleMusic", label: "Apple Music", accent: "bg-[#FA243C] text-white" },
  { key: "youtubeMusic", label: "YouTube Music", accent: "bg-[#FF0000] text-white" },
];

export function hasAnyStreaming(links: StreamingLinks): boolean {
  return Boolean(links.spotify || links.appleMusic || links.youtubeMusic);
}

export function firstStreamingUrl(links: StreamingLinks): ExternalUrl {
  return links.spotify ?? links.appleMusic ?? links.youtubeMusic ?? null;
}
