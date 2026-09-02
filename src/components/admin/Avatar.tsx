/* eslint-disable @next/next/no-img-element */

/**
 * A staff photo, or their initials.
 *
 * A plain <img>, not next/image, on purpose. These are signed URLs that
 * change every hour, so the image optimiser would fill its cache with entries
 * that can never be hit again — and it would need the Supabase host added to
 * remotePatterns to serve pictures only ever seen by signed-in staff.
 */
export function Avatar({
  url,
  initials,
  size = 40,
  className = "",
}: {
  url: string | null;
  initials: string;
  size?: number;
  className?: string;
}) {
  const style = { width: size, height: size };

  if (url) {
    return (
      <img
        src={url}
        alt=""
        width={size}
        height={size}
        style={style}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <span
      aria-hidden
      style={style}
      className={`grid shrink-0 place-items-center rounded-full bg-keyblue-600 font-bold text-white ${className}`}
    >
      <span style={{ fontSize: Math.round(size * 0.38) }}>{initials}</span>
    </span>
  );
}
