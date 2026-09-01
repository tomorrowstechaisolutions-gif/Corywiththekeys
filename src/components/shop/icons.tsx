import type { ReactNode } from "react";

/** Shared stroke wrapper so every shop icon matches weight and size. */
export function Icon({
  children,
  className = "h-5 w-5",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

export const SearchIcon = () => (
  <Icon>
    <circle cx="11" cy="11" r="7" />
    <path d="m16.5 16.5 4 4" />
  </Icon>
);

export const AccountIcon = () => (
  <Icon>
    <circle cx="12" cy="8.5" r="3.5" />
    <path d="M5 19.5a7 7 0 0 1 14 0" />
  </Icon>
);

export const BagIcon = () => (
  <Icon>
    <path d="M5.5 8h13l-1 12h-11l-1-12Z" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
  </Icon>
);

export const CloseIcon = () => (
  <Icon>
    <path d="m6 6 12 12M18 6 6 18" />
  </Icon>
);

export const MenuIcon = () => (
  <Icon>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Icon>
);

export const ChevronDown = () => (
  <Icon className="h-3.5 w-3.5">
    <path d="m5 9 7 7 7-7" />
  </Icon>
);

export const ArrowRight = () => (
  <Icon className="h-4 w-4">
    <path d="M4 12h15M13 6l6 6-6 6" />
  </Icon>
);

/** Named brand-benefit marks, keyed to the ids used in shop.ts. */
export const BENEFIT_ICONS: Record<string, ReactNode> = {
  hustle: (
    <>
      <circle cx="8" cy="12" r="3.4" />
      <path d="M11.4 12H21M17.6 12v3.2M20.4 12v2.2" />
    </>
  ),
  people: (
    <>
      <circle cx="12" cy="8" r="2.6" />
      <circle cx="5.8" cy="9.6" r="2" />
      <circle cx="18.2" cy="9.6" r="2" />
      <path d="M7.6 17.2a4.6 4.6 0 0 1 8.8 0" />
      <path d="M2.6 16.4a3.6 3.6 0 0 1 4.2-2.5M21.4 16.4a3.6 3.6 0 0 0-4.2-2.5" />
    </>
  ),
  quality: (
    <>
      <path d="M12 3l7.5 2.6v5.6c0 4.6-3.1 7.6-7.5 8.8-4.4-1.2-7.5-4.2-7.5-8.8V5.6L12 3z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  shipping: (
    <>
      <path d="M2.5 7.5h10v8h-10z" />
      <path d="M12.5 10.5h4l3 3v2h-7z" />
      <circle cx="6.5" cy="17.5" r="1.6" />
      <circle cx="16.5" cy="17.5" r="1.6" />
    </>
  ),
  purpose: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 4v2.5M12 17.5V20M4 12h2.5M17.5 12H20" />
    </>
  ),
  returns: (
    <>
      <path d="M3.5 6.5h17v11h-17z" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  secure: (
    <>
      <rect x="4.5" y="10.5" width="15" height="9" rx="1.6" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
      <path d="M12 14v2" />
    </>
  ),
};
