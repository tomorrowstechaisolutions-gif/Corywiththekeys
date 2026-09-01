import Image from "next/image";

/**
 * A thumbnail that degrades honestly.
 *
 * With artwork it shows the artwork. Without, it shows a branded tile rather
 * than a broken image or a stock placeholder — and if there is no destination
 * URL it renders no play affordance at all, so nothing on the page promises
 * a video that cannot play.
 */
export function MediaTile({
  image,
  alt,
  href,
  aspect = "video",
  showPlay = true,
  priority = false,
  sizes = "(max-width: 640px) 100vw, 25vw",
}: {
  image: string | null;
  alt: string;
  href: string | null;
  aspect?: "video" | "square";
  showPlay?: boolean;
  priority?: boolean;
  sizes?: string;
}) {
  const playable = Boolean(href) && showPlay;

  const inner = (
    <div
      className={`relative overflow-hidden rounded-lg bg-navy-900 ${
        aspect === "video" ? "aspect-video" : "aspect-square"
      }`}
    >
      {image ? (
        <Image
          src={image}
          alt={alt}
          fill
          priority={priority}
          loading={priority ? undefined : "lazy"}
          sizes={sizes}
          className="object-cover transition duration-300 group-hover:scale-[1.04]"
          unoptimized={image.startsWith("http")}
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-br from-navy-800 via-navy-950 to-black"
        >
          <div className="absolute inset-0 opacity-40 [background:radial-gradient(120%_80%_at_70%_20%,rgba(47,123,240,0.5),transparent_60%)]" />
          <span className="absolute bottom-2 left-3 font-serif text-lg font-bold italic text-white/25">
            CK
          </span>
        </div>
      )}

      {playable ? (
        <span
          aria-hidden
          className="absolute inset-0 grid place-items-center bg-black/20 transition group-hover:bg-black/35"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 pl-1 text-lg text-navy-950 shadow-lg transition group-hover:scale-110">
            ▶
          </span>
        </span>
      ) : null}
    </div>
  );

  if (!href) return inner;

  return (
    <a href={href} target="_blank" rel="noreferrer" className="block">
      {inner}
    </a>
  );
}
