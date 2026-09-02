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

/**
 * Verified YouTube video ids. Each one was checked against YouTube's oEmbed
 * endpoint, so the title and channel below are what YouTube actually returns
 * — not a guess.
 */
export const VIDEO_IDS = {
  /** "Cory with the Keys - 13 Years Old (Feat. RNB FOE MOB)" — @Corywthekeys */
  thirteenYearsOld: "f63hlQCZszk",
  /**
   * "Cory With The Keys, Lil Flip, Negami - Started From The Bottom Cumbia"
   * — @Corywthekeys.
   *
   * This used to point at xxwTZAUUvQg, the same song on Lil' Flip TV's
   * channel. Cory has his own upload of it, so the views belong to him.
   * Lil' Flip's copy is still there if this one is ever taken down.
   */
  startedFromTheBottom: "m9VyGE9DNqU",
  /** "Cory with the Keys 'Drive Away'" — @Corywthekeys */
  driveAway: "ZfNdkNepZls",
  /** "'I Am The 1' Cory with the Keys & Chalie Boy" — @Corywthekeys */
  iAmThe1: "9nUTzh4msiU",
  /** "'Lost With You'" — @Corywthekeys */
  lostWithYou: "KWmBcYQw_VQ",
  /** "Cory with the Keys 'Ride'" — @Corywthekeys */
  ride: "SEK82zxIWL8",
  /** "Cory with the Keys 'Put You in a Ride'" — @Corywthekeys */
  putYouInARide: "uqwb6bqj8o0",
  /** "Cory with the Keys 'Callin My Phone'" — @Corywthekeys */
  callinMyPhone: "MLWCyEjAvWU",
  /** "'This Moment'" — @Corywthekeys */
  thisMoment: "54iIO3D2bjs",
  /** "Cory with the Keys 'Secret CTX Cypher'" — @Corywthekeys */
  ctxSecretCypher: "UX4Z98aZHyo",
  /**
   * "Cory With The Keys Signing To Lil Flip, Prison, Selling Cars, And More!"
   * — uploaded by IMTOOTV, not by Cory. Someone else's channel, so it can
   * disappear without warning; if the card ever goes blank, that is why.
   */
  interviewImTooTv: "Ofjlf2am6h4",
  /**
   * "From Prison to Billboards: Who is Cory with the Keys?" — KCEN News, the
   * NBC affiliate in Waco/Temple. Also somebody else's channel.
   */
  kcenNewsFeature: "rQxJZaTVIYw",
} as const;

export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@Corywthekeys";

/**
 * Cory's artist pages. He is distributed to all three — confirmed by opening
 * each page, not by guessing an id from his name.
 *
 * Worth knowing: only some of his songs are on streaming. The rest exist on
 * YouTube only, which is why several tracks below carry a video and no
 * Spotify link. That is accurate, not an omission.
 */
export const SPOTIFY_ARTIST_URL =
  "https://open.spotify.com/artist/05VlBpeYculWyIL2eKja0r";
export const APPLE_MUSIC_ARTIST_URL =
  "https://music.apple.com/us/artist/cory-with-the-keys/1677969252";
export const YOUTUBE_MUSIC_ARTIST_URL =
  "https://music.youtube.com/channel/UCK6PoEy9JB2F7lIcK_2TUcw";

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
};

/**
 * Cory's profiles. Every URL below was opened and confirmed to resolve to him
 * — not assumed from a handle. Two supplied links did not, and are recorded
 * as null rather than shipped broken; see the note under CASH_APP_URL.
 */
export const PROFILES: Profile[] = [
  {
    key: "tiktok",
    label: "TikTok",
    // Note the spelling: no "ith", matching his YouTube handle. The
    // @corywiththekeys spelling is a dead account.
    handle: "@corywthekeys",
    url: "https://www.tiktok.com/@corywthekeys",
  },
  {
    key: "instagram",
    label: "Instagram",
    handle: "@corywiththekeys",
    url: "https://www.instagram.com/corywiththekeys",
  },
  {
    key: "facebook",
    label: "Facebook",
    handle: "/iamcorywiththekeys",
    url: "https://www.facebook.com/iamcorywiththekeys",
  },
  {
    key: "youtube",
    label: "YouTube",
    handle: "@Corywthekeys",
    // Confirmed: this is the channel that hosts his official videos.
    url: YOUTUBE_CHANNEL_URL,
  },
  {
    key: "snapchat",
    label: "Snapchat",
    handle: "@corywiththekeys",
    url: "https://www.snapchat.com/@corywiththekeys",
  },
];

/**
 * Where to hear him, as opposed to where to follow him. Kept separate from
 * PROFILES because they answer different questions and belong in different
 * rows — nobody "follows" a song.
 */
export const LISTEN_PROFILES: Profile[] = [
  {
    key: "spotify",
    label: "Spotify",
    handle: "Cory with the Keys",
    url: SPOTIFY_ARTIST_URL,
  },
  {
    key: "appleMusic",
    label: "Apple Music",
    handle: "Cory with the Keys",
    url: APPLE_MUSIC_ARTIST_URL,
  },
  {
    key: "youtubeMusic",
    label: "YouTube Music",
    handle: "Cory with the Keys",
    url: YOUTUBE_MUSIC_ARTIST_URL,
  },
];

/** Confirmed. Kept as a secondary destination — the site is the main event. */
export const LINKTREE_URL = "https://linktr.ee/corywiththekeys";

/**
 * Cash App — NOT LIVE, and deliberately not in the social row.
 *
 * Two separate reasons, either of which is enough on its own.
 *
 * 1. The supplied link 404s. cash.app/$CorywiththeKeys and the lowercase
 *    spelling both return "Page Not Found". Cory's own Linktree carries the
 *    same dead link, so it is worth him checking the cashtag really exists.
 *
 * 2. Even working, it does not belong beside car listings. A "send money"
 *    link on a dealership page invites someone to pay a deposit through a
 *    channel with no buyer protection, and impersonating a dealer to collect
 *    a Cash App deposit is one of the commonest used-car scams there is. If
 *    Cory wants tips from his music audience, the place for it is the music
 *    page, clearly labelled as a tip — not the footer of every page.
 *
 * Paste a working cashtag here and decide where it goes, together.
 */
export const CASH_APP_URL: ExternalUrl = null;

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

/**
 * Per-release streaming links.
 *
 * Every URL here was resolved against the platform itself and the title it
 * returned was checked against the title we display. Where a platform has no
 * release for a song, the field is null — the button simply does not render,
 * which is the honest outcome and better than sending someone to a search
 * page that may not find it.
 *
 * `youtubeMusic` is null throughout on purpose. His songs are on YouTube
 * Music, but per-song ids there differ from the ids on his main channel, and
 * a wrong id would play the wrong song. The artist link in the Listen row
 * covers it until we have the real per-song ids.
 */
const STREAMING = {
  thirteenYearsOld: {
    spotify: "https://open.spotify.com/album/3yqx8k2ZToO4geJdMOr1UI",
    appleMusic: "https://music.apple.com/us/album/13-years-old-single/1874226232",
    youtubeMusic: null,
  },
  startedFromTheBottom: {
    spotify: "https://open.spotify.com/album/2FDeZwxKBB9Aom5l7NgV4A",
    // Apple carries the song but not under a single of his own, so there is
    // no stable album URL to point at. The artist page covers it.
    appleMusic: null,
    youtubeMusic: null,
  },
  lostWithYou: {
    spotify: "https://open.spotify.com/album/5vr6XiHZ9PG3tG3eFo35GI",
    appleMusic: "https://music.apple.com/us/album/lost-with-you-single/1859959700",
    youtubeMusic: null,
  },
  ctxSecretCypher: {
    spotify: "https://open.spotify.com/album/4gMU1Uk7pavzJe9fChx9Xo",
    appleMusic:
      "https://music.apple.com/us/album/ctx-secret-cypher-single/1859954326",
    youtubeMusic: null,
  },
} as const satisfies Record<string, StreamingLinks>;

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
  /**
   * Careful with this line. "I Am the 1" is on YouTube only — it is not on
   * Spotify or Apple Music, so it cannot claim to be on all platforms.
   *
   * Also worth Cory's attention: his newest actual release is "Grow up Glow
   * Up (feat. Peso Peso)", which is out on both services and has an official
   * video. If he wants the banner to show what is genuinely newest, that is
   * the one — say the word and it takes a minute to switch.
   */
  blurb: "The new anthem is here. Watch the official video.",
  artwork: null,
  youtubeId: VIDEO_IDS.iAmThe1,
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
  {
    title: "13 Years Old",
    subtitle: "feat. RNB FOE MOB",
    youtubeId: VIDEO_IDS.thirteenYearsOld,
    url: null,
    thumbnail: null,
  },
  {
    title: "I Am the 1",
    subtitle: "feat. Chalie Boy",
    youtubeId: VIDEO_IDS.iAmThe1,
    url: null,
    thumbnail: null,
  },
  {
    title: "Started From The Bottom",
    // Titled accurately: the version that exists online is the Cumbia Remix,
    // and it lives on Lil' Flip's channel rather than Cory's.
    subtitle: "Cumbia Remix, with Lil' Flip & Negami",
    youtubeId: VIDEO_IDS.startedFromTheBottom,
    url: null,
    thumbnail: null,
  },
  {
    title: "Drive Away",
    subtitle: null,
    youtubeId: VIDEO_IDS.driveAway,
    url: null,
    thumbnail: null,
  },
  {
    title: "Lost With You",
    subtitle: null,
    youtubeId: VIDEO_IDS.lostWithYou,
    url: null,
    thumbnail: null,
  },
];

export type Track = {
  title: string;
  featuring: string | null;
  artwork: string | null;
  /**
   * Falls back to the YouTube video when there is no streaming link yet, so a
   * track people can actually hear is never a dead tile.
   */
  youtubeId?: string | null;
  links: StreamingLinks;
};

export const POPULAR_TRACKS: Track[] = [
  {
    title: "13 Years Old",
    featuring: "RNB FOE MOB",
    artwork: null,
    youtubeId: VIDEO_IDS.thirteenYearsOld,
    links: STREAMING.thirteenYearsOld,
  },
  {
    title: "Started From The Bottom",
    featuring: "Lil' Flip & Negami",
    artwork: null,
    youtubeId: VIDEO_IDS.startedFromTheBottom,
    links: STREAMING.startedFromTheBottom,
  },
  {
    title: "Drive Away",
    featuring: null,
    artwork: null,
    youtubeId: VIDEO_IDS.driveAway,
    links: EMPTY_STREAMING,
  },
  {
    title: "Lost With You",
    featuring: null,
    artwork: null,
    youtubeId: VIDEO_IDS.lostWithYou,
    links: STREAMING.lostWithYou,
  },
  {
    title: "Ride",
    featuring: null,
    artwork: null,
    youtubeId: VIDEO_IDS.ride,
    links: EMPTY_STREAMING,
  },
  {
    title: "Put You in a Ride",
    featuring: null,
    artwork: null,
    youtubeId: VIDEO_IDS.putYouInARide,
    links: EMPTY_STREAMING,
  },
  {
    title: "Callin My Phone",
    featuring: null,
    artwork: null,
    youtubeId: VIDEO_IDS.callinMyPhone,
    links: EMPTY_STREAMING,
  },
  {
    title: "This Moment",
    featuring: null,
    artwork: null,
    youtubeId: VIDEO_IDS.thisMoment,
    links: EMPTY_STREAMING,
  },
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
    youtubeId: VIDEO_IDS.interviewImTooTv,
    url: null,
    thumbnail: null,
  },
  {
    /**
     * This slot used to say "On The Come Up". No such video exists — not on
     * Cory's channel and not anywhere findable, so it was a placeholder from
     * the design, never a real thing to link to.
     *
     * Rather than leave the card blank it now carries a real press feature:
     * KCEN, the NBC affiliate for Waco / Temple / Killeen. Local TV news
     * saying his name is stronger third-party proof than another interview.
     * If Cory had a specific video in mind, swap the id and the wording back.
     */
    title: "From Prison to Billboards: Who is Cory with the Keys?",
    description: "KCEN News on the come up, the dealership, and the music.",
    eyebrow: "On the news",
    ctaLabel: "Watch the story",
    youtubeId: VIDEO_IDS.kcenNewsFeature,
    url: null,
    thumbnail: null,
  },
  {
    // Titled "Secret CK Cypher" in the comp. YouTube and both streaming
    // services all spell it CTX — Central Texas. Corrected to match.
    title: "Secret CTX Cypher",
    description: null,
    eyebrow: "Featured on",
    ctaLabel: "Watch Performance",
    youtubeId: VIDEO_IDS.ctxSecretCypher,
    url: null,
    thumbnail: null,
  },
];

/**
 * The song that sits in the looping player near the top of the page.
 *
 * Autoplay with sound is blocked by every current browser, so this plays on
 * the visitor's click and then repeats until they stop it.
 */
export const FEATURED_VIDEO = {
  youtubeId: VIDEO_IDS.thirteenYearsOld,
  title: "13 Years Old",
  featuring: "RNB FOE MOB",
  eyebrow: "On Repeat",
  blurb: "Cory's own pick. Press play and let it ride.",
} as const;

/**
 * The song that plays on the music page itself, from our own server.
 *
 * IMPORTANT — it cannot start before the visitor touches the page. Chrome,
 * Safari and Firefox all refuse to start audible media until the visitor has
 * interacted with the document, and hosting the file ourselves changes
 * nothing: the rule is about audio, not about where the audio came from. The
 * player therefore asks to start, and if it is refused it waits and starts on
 * the visitor's first click, tap or keypress anywhere on the page.
 *
 * Set `startOnFirstInteraction` to false to make it a plain press-play bar.
 */
export const FEATURED_AUDIO = {
  src: "/audio/13-years-old.m4a",
  title: "13 Years Old",
  featuring: "RNB FOE MOB",
  youtubeId: VIDEO_IDS.thirteenYearsOld,
  startOnFirstInteraction: true,
} as const;

/** "View all" destinations. Null hides the link rather than dead-ending. */
export const ALL_VIDEOS_URL: ExternalUrl = `${YOUTUBE_CHANNEL_URL}/videos`;
export const ALL_MUSIC_URL: ExternalUrl = SPOTIFY_ARTIST_URL;
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
}[] = [
  { key: "spotify", label: "Spotify" },
  { key: "appleMusic", label: "Apple Music" },
  { key: "youtubeMusic", label: "YouTube Music" },
];

export function hasAnyStreaming(links: StreamingLinks): boolean {
  return Boolean(links.spotify || links.appleMusic || links.youtubeMusic);
}

export function firstStreamingUrl(links: StreamingLinks): ExternalUrl {
  return links.spotify ?? links.appleMusic ?? links.youtubeMusic ?? null;
}

/**
 * Where a track tile should point. Streaming wins when it exists; otherwise
 * the YouTube video, if there is one; otherwise nothing, and the tile renders
 * without a play button.
 */
export function trackUrl(track: Track): ExternalUrl {
  return firstStreamingUrl(track.links) ?? mediaUrl({ youtubeId: track.youtubeId });
}

/** Artwork for a track: supplied art, else the YouTube frame, else null. */
export function trackArtwork(track: Track): string | null {
  return track.artwork ?? mediaImage({ youtubeId: track.youtubeId });
}
