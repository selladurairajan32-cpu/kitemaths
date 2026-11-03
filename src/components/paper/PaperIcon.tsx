import type { ReactNode, SVGProps } from "react";

/**
 * The paper icon set: drawn pictures for lessons, worlds and islands, in the
 * cut-paper style (ink outline, one or two flat paper colours) on a 48px grid.
 * These replace emoji everywhere. Small interface icons (nav, inline) stay in
 * the plain outline set in components/ui/Icons.tsx.
 */

export const PAPER = {
  ink: "#13203a",
  red: "#e8343f",
  sun: "#ffc23d",
  sunDeep: "#d99a00",
  sky: "#4da8f0",
  skySoft: "#d6ecfd",
  leaf: "#3dae6b",
  leafSoft: "#dcf3e5",
  coral: "#f4623a",
  white: "#ffffff",
} as const;

const { ink, red, sun, sunDeep, sky, skySoft, leaf, leafSoft, coral, white } = PAPER;

/** Ink outline shared by every shape. */
const o = { stroke: ink, strokeWidth: 2.5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

const ICONS = {
  /* ── Lessons ─────────────────────────────── */
  pizza: (
    <>
      <path d="M9 13 L39 13 L24 41 Z" fill={sun} {...o} />
      <path d="M7 10 Q24 4 41 10 L39 15 Q24 10 9 15 Z" fill={sunDeep} {...o} />
      <circle cx="20" cy="21" r="3" fill={red} {...o} />
      <circle cx="28" cy="25" r="2.6" fill={red} {...o} />
      <circle cx="23" cy="31" r="2.2" fill={red} {...o} />
    </>
  ),
  "fraction-bar": (
    <>
      <rect x="5" y="15" width="38" height="18" rx="1.5" fill={white} {...o} />
      <rect x="5" y="15" width="28.5" height="18" fill={coral} {...o} />
      <path d="M14.5 15 V33 M24 15 V33 M33.5 15 V33" {...o} fill="none" />
    </>
  ),
  paint: (
    <>
      <path d="M24 6 C35 6 43 13 43 22 C43 28 38 30 34 29 C30 28 28 31 30 35 C32 40 28 43 22 42 C12 41 5 33 5 23 C5 13 13 6 24 6 Z" fill={white} {...o} />
      <circle cx="15" cy="20" r="4" fill={red} {...o} />
      <circle cx="24" cy="14" r="4" fill={sun} {...o} />
      <circle cx="34" cy="18" r="4" fill={sky} {...o} />
      <circle cx="16" cy="31" r="4" fill={leaf} {...o} />
    </>
  ),
  scales: (
    <>
      <path d="M24 9 V40 M15 41 H33" fill="none" {...o} />
      <path d="M8 14 H40" fill="none" {...o} />
      <path d="M8 14 L3 26 H13 Z" fill={sun} {...o} />
      <path d="M40 14 L35 26 H45 Z" fill={sky} {...o} />
      <circle cx="24" cy="9" r="3" fill={red} {...o} />
    </>
  ),
  puzzle: (
    <path
      d="M8 14 H19 A5 5 0 1 1 29 14 H40 V24 A5 5 0 1 0 40 34 V42 H8 V34 A5 5 0 1 1 8 24 Z"
      fill={leaf}
      {...o}
    />
  ),
  ruler: (
    <>
      <path d="M5 30 H43" fill="none" {...o} />
      <path d="M7 24 V36 M41 24 V36 M15.5 27 V33 M24 27 V33 M32.5 27 V33" fill="none" {...o} />
      <path d="M32.5 12 C27.5 12 25 15.5 25 18.5 C25 22 32.5 27 32.5 27 C32.5 27 40 22 40 18.5 C40 15.5 37.5 12 32.5 12 Z" fill={red} {...o} />
      <circle cx="32.5" cy="18.5" r="2.2" fill={white} {...o} />
    </>
  ),
  sweets: (
    <>
      <path d="M14 24 L4 16 V32 Z" fill={sun} {...o} />
      <path d="M34 24 L44 16 V32 Z" fill={sun} {...o} />
      <circle cx="24" cy="24" r="10" fill={red} {...o} />
      <path d="M19 19 Q24 24 29 29" fill="none" stroke={white} strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  magnifier: (
    <>
      <path d="M30 30 L42 42" fill="none" stroke={ink} strokeWidth="6" strokeLinecap="round" />
      <circle cx="20" cy="20" r="13" fill={skySoft} {...o} />
      <path d="M13 17 A8 8 0 0 1 20 11" fill="none" stroke={white} strokeWidth="3" strokeLinecap="round" />
    </>
  ),

  /* ── Worlds ──────────────────────────────── */
  mountain: (
    <>
      <path d="M3 40 L18 14 L33 40 Z" fill={sky} {...o} />
      <path d="M20 40 L32 20 L45 40 Z" fill={leaf} {...o} />
      <path d="M13 23 L18 14 L23 23 L20.5 21 L18 24 L15.5 21 Z" fill={white} {...o} />
    </>
  ),
  wave: (
    <>
      <circle cx="35" cy="13" r="6" fill={sun} {...o} />
      <path d="M4 28 Q10 22 16 28 T28 28 T40 28 L44 28 V42 H4 Z" fill={sky} {...o} />
      <path d="M4 36 Q10 31 16 36 T28 36 T40 36" fill="none" stroke={white} strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  falls: (
    <>
      <path d="M4 12 H22 V40 H4 Z" fill={leaf} {...o} />
      <path d="M22 12 H32 V40 H22 Z" fill={sky} {...o} />
      <path d="M26 16 V36 M29 20 V38" fill="none" stroke={white} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 12 H44 V40 H32 Z" fill={leaf} {...o} />
      <path d="M18 42 Q27 36 36 42" fill={skySoft} {...o} />
    </>
  ),
  meadow: (
    <>
      <path d="M3 40 Q14 24 26 40 Z" fill={leaf} {...o} />
      <path d="M18 40 Q32 20 45 40 Z" fill={leafSoft} {...o} />
      <path d="M33 30 V22" fill="none" {...o} />
      <circle cx="33" cy="18" r="4" fill={red} {...o} />
      <circle cx="33" cy="18" r="1.5" fill={sun} />
    </>
  ),
  shapes: (
    <>
      <rect x="22" y="22" width="20" height="20" rx="1.5" fill={sky} {...o} />
      <circle cx="16" cy="30" r="10" fill={sun} {...o} />
      <path d="M24 5 L35 24 H13 Z" fill={red} {...o} />
    </>
  ),
  summit: (
    <>
      <path d="M3 42 L24 12 L45 42 Z" fill={sky} {...o} />
      <path d="M17 22 L24 12 L31 22 L27.5 20 L24 24 L20.5 20 Z" fill={white} {...o} />
      <path d="M24 12 V3" fill="none" {...o} />
      <path d="M24 3 L34 6 L24 9 Z" fill={red} {...o} />
    </>
  ),

  /* ── Islands ─────────────────────────────── */
  "place-value": (
    <>
      <rect x="8" y="6" width="9" height="36" rx="1" fill={sky} {...o} />
      <path d="M8 13.2 H17 M8 20.4 H17 M8 27.6 H17 M8 34.8 H17" fill="none" {...o} />
      <rect x="22" y="24" width="18" height="18" rx="1" fill={sun} {...o} />
      <path d="M31 24 V42 M22 33 H40" fill="none" {...o} />
    </>
  ),
  rounding: (
    <>
      <path d="M6 34 A18 18 0 0 1 42 34 Z" fill={white} {...o} />
      <path d="M6 34 A18 18 0 0 1 24 16 V34 Z" fill={leafSoft} />
      <path d="M6 34 A18 18 0 0 1 42 34 Z" fill="none" {...o} />
      <path d="M24 34 L33 21" fill="none" stroke={red} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="24" cy="34" r="3" fill={ink} />
    </>
  ),
  thermometer: (
    <>
      <path d="M20 8 A4 4 0 0 1 28 8 V29 A8 8 0 1 1 20 29 Z" fill={white} {...o} />
      <circle cx="24" cy="35" r="5" fill={red} />
      <path d="M24 34 V18" fill="none" stroke={red} strokeWidth="4" strokeLinecap="round" />
      <path d="M31 12 H36 M31 18 H36 M31 24 H36" fill="none" {...o} />
    </>
  ),
  plus: <path d="M19 6 H29 V19 H42 V29 H29 V42 H19 V29 H6 V19 H19 Z" fill={leaf} {...o} />,
  times: <path d="M12 7 L24 19 L36 7 L41 12 L29 24 L41 36 L36 41 L24 29 L12 41 L7 36 L19 24 L7 12 Z" fill={sky} {...o} />,
  divide: (
    <>
      <rect x="6" y="20" width="36" height="8" rx="1.5" fill={sun} {...o} />
      <circle cx="24" cy="10" r="4.5" fill={sun} {...o} />
      <circle cx="24" cy="38" r="4.5" fill={sun} {...o} />
    </>
  ),
  decimal: (
    <>
      <rect x="5" y="10" width="15" height="28" rx="1.5" fill={sky} {...o} />
      <rect x="28" y="10" width="15" height="28" rx="1.5" fill={sky} {...o} />
      <circle cx="24" cy="35" r="3" fill={red} {...o} />
    </>
  ),
  percent: (
    <>
      <path d="M36 8 L12 40" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round" />
      <circle cx="14" cy="13" r="6" fill={red} {...o} />
      <circle cx="34" cy="35" r="6" fill={red} {...o} />
    </>
  ),
  coin: (
    <>
      <circle cx="24" cy="24" r="17" fill={sun} {...o} />
      <circle cx="24" cy="24" r="11" fill="none" stroke={sunDeep} strokeWidth="2.5" />
      <path d="M27 18 A4 4 0 0 0 20 20 V30 M17 25 H25 M18 30 H29" fill="none" {...o} />
    </>
  ),
  clock: (
    <>
      <circle cx="24" cy="24" r="17" fill={white} {...o} />
      <path d="M24 13 V24 L31 28" fill="none" {...o} />
      <circle cx="24" cy="24" r="2.5" fill={red} />
      <path d="M24 9 V10.5 M39 24 H37.5 M24 39 V37.5 M9 24 H10.5" fill="none" {...o} />
    </>
  ),
  area: (
    <>
      <rect x="7" y="7" width="34" height="34" rx="1.5" fill={white} {...o} />
      <rect x="7" y="7" width="22.7" height="22.7" fill={leaf} {...o} />
      <path d="M18.3 7 V41 M29.7 7 V41 M7 18.3 H41 M7 29.7 H41" fill="none" {...o} />
    </>
  ),
  angle: (
    <>
      <path d="M8 38 H42 M8 38 L34 12" fill="none" {...o} />
      <path d="M22 38 A14 14 0 0 0 18 28" fill="none" stroke={red} strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="8" cy="38" r="2.5" fill={ink} />
    </>
  ),
  compass: (
    <>
      <path d="M10 6 V40 H44" fill="none" {...o} />
      <path d="M10 28 H44 M10 17 H44 M21 6 V40 M32 6 V40" fill="none" stroke={ink} strokeOpacity="0.25" strokeWidth="1.5" />
      <circle cx="32" cy="17" r="5" fill={red} {...o} />
    </>
  ),
  chart: (
    <>
      <path d="M6 41 H42" fill="none" {...o} />
      <rect x="9" y="25" width="8" height="16" rx="1" fill={sky} {...o} />
      <rect x="20" y="13" width="8" height="28" rx="1" fill={sky} {...o} />
      <rect x="31" y="20" width="8" height="21" rx="1" fill={sky} {...o} />
    </>
  ),
  ratio: (
    <>
      <circle cx="11" cy="15" r="5" fill={red} {...o} />
      <circle cx="11" cy="33" r="5" fill={red} {...o} />
      <circle cx="24" cy="18" r="2.5" fill={ink} />
      <circle cx="24" cy="30" r="2.5" fill={ink} />
      <circle cx="37" cy="10" r="5" fill={sky} {...o} />
      <circle cx="37" cy="24" r="5" fill={sky} {...o} />
      <circle cx="37" cy="38" r="5" fill={sky} {...o} />
    </>
  ),
  bulb: (
    <>
      <path d="M24 5 C15 5 10 12 10 19 C10 25 14 28 17 32 V35 H31 V32 C34 28 38 25 38 19 C38 12 33 5 24 5 Z" fill={sun} {...o} />
      <path d="M18 40 H30 M20 44 H28" fill="none" {...o} />
      <path d="M20 22 L24 27 L28 22" fill="none" {...o} />
    </>
  ),
  exam: (
    <>
      <path d="M10 5 H31 L39 13 V43 H10 Z" fill={white} {...o} />
      <path d="M31 5 V13 H39" fill="none" {...o} />
      <path d="M16 20 H33 M16 26 H33 M16 32 H26" fill="none" stroke={ink} strokeOpacity="0.35" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M27 34 L31 38 L40 28" fill="none" stroke={leaf} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),

  /* ── Activities and rewards ──────────────── */
  target: (
    <>
      <circle cx="22" cy="26" r="17" fill={red} {...o} />
      <circle cx="22" cy="26" r="11" fill={white} {...o} />
      <circle cx="22" cy="26" r="5" fill={red} {...o} />
      <path d="M22 26 L42 6" fill="none" {...o} />
      <path d="M37 5 L43 5 L43 11" fill="none" {...o} />
    </>
  ),
  dice: (
    <>
      <rect x="7" y="7" width="34" height="34" rx="6" fill={white} {...o} />
      <circle cx="16" cy="16" r="3" fill={ink} />
      <circle cx="32" cy="16" r="3" fill={ink} />
      <circle cx="24" cy="24" r="3" fill={red} />
      <circle cx="16" cy="32" r="3" fill={ink} />
      <circle cx="32" cy="32" r="3" fill={ink} />
    </>
  ),
  trophy: (
    <>
      <path d="M14 6 H34 V18 C34 25 29 29 24 29 C19 29 14 25 14 18 Z" fill={sun} {...o} />
      <path d="M14 10 H7 C7 17 10 20 14 20 M34 10 H41 C41 17 38 20 34 20" fill="none" {...o} />
      <path d="M24 29 V36 M15 42 H33 L31 36 H17 Z" fill={sunDeep} {...o} />
    </>
  ),
  recheck: (
    <>
      <path d="M38 20 A15 15 0 0 0 11 15" fill="none" stroke={leaf} strokeWidth="5" strokeLinecap="round" />
      <path d="M10 28 A15 15 0 0 0 37 33" fill="none" stroke={leaf} strokeWidth="5" strokeLinecap="round" />
      <path d="M6 9 L10 17 L18 13" fill="none" {...o} />
      <path d="M42 39 L38 31 L30 35" fill="none" {...o} />
    </>
  ),
  kite: (
    <>
      <path d="M24 3 L10 20 L24 20 Z" fill={red} />
      <path d="M24 3 L38 20 L24 20 Z" fill={sun} />
      <path d="M10 20 L24 38 L24 20 Z" fill={sky} />
      <path d="M38 20 L24 38 L24 20 Z" fill={leaf} />
      <path d="M24 3 L38 20 L24 38 L10 20 Z M24 3 V38 M10 20 H38" fill="none" {...o} />
      <path d="M24 38 Q19 41 24 44 T27 47" fill="none" {...o} />
    </>
  ),
  star: <path d="M24 4 L30 17 L44 18.5 L33.5 28 L36.5 42 L24 35 L11.5 42 L14.5 28 L4 18.5 L18 17 Z" fill={sun} {...o} />,
  flame: (
    <>
      <path d="M24 4 C26 13 37 17 37 29 A13 13 0 0 1 11 29 C11 22 15 18 18 15 C18.5 20 20.5 23 23 24 C22 17 22.5 10 24 4 Z" fill={red} {...o} />
      <path d="M24 43 A7 7 0 0 1 17 36 C17 31 21 29 23 26 C24.5 30 31 31 31 36 A7 7 0 0 1 24 43 Z" fill={sun} {...o} />
    </>
  ),
  book: (
    <>
      <path d="M24 12 C18 8 11 8 5 10 V39 C11 37 18 37 24 41 Z" fill={white} {...o} />
      <path d="M24 12 C30 8 37 8 43 10 V39 C37 37 30 37 24 41 Z" fill={sky} {...o} />
      <path d="M10 17 H19 M10 23 H19 M10 29 H17" fill="none" stroke={ink} strokeOpacity="0.35" strokeWidth="2.5" strokeLinecap="round" />
    </>
  ),
  lab: (
    <>
      <path d="M18 5 H30 M20 5 V18 L8 38 C7 41 9 43 12 43 H36 C39 43 41 41 40 38 L28 18 V5" fill={white} {...o} />
      <path d="M13 30 H35 L39.5 38 C40 41 38.5 42.5 36 42.5 H12 C9.5 42.5 8 41 8.5 38 Z" fill={leaf} />
      <path d="M20 5 V18 L8 38 C7 41 9 43 12 43 H36 C39 43 41 41 40 38 L28 18 V5" fill="none" {...o} />
      <circle cx="21" cy="36" r="2" fill={white} />
      <circle cx="28" cy="34" r="1.5" fill={white} />
    </>
  ),
  map: (
    <>
      <path d="M5 10 L17 6 L31 10 L43 6 V38 L31 42 L17 38 L5 42 Z" fill={sun} {...o} />
      <path d="M17 6 V38 M31 10 V42" fill="none" {...o} />
      <path d="M9 32 Q15 22 22 26 T37 16" fill="none" stroke={red} strokeWidth="2.5" strokeDasharray="3 4" strokeLinecap="round" />
    </>
  ),
  lock: (
    <>
      <path d="M15 21 V15 A9 9 0 0 1 33 15 V21" fill="none" {...o} />
      <rect x="9" y="21" width="30" height="22" rx="3" fill={sun} {...o} />
      <path d="M24 29 V35" fill="none" {...o} />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type PaperIconName = keyof typeof ICONS;

export const PAPER_ICON_NAMES = Object.keys(ICONS) as PaperIconName[];

export function isPaperIconName(name: string): name is PaperIconName {
  return name in ICONS;
}

/** A drawn paper icon. Decorative by default; pass `title` when it carries meaning on its own. */
export function PaperIcon({
  name,
  size = 48,
  title,
  className,
  muted = false,
  ...props
}: { name: PaperIconName; size?: number; title?: string; muted?: boolean } & Omit<SVGProps<SVGSVGElement>, "name">) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={`${muted ? "opacity-45 grayscale" : ""} ${className ?? ""}`}
      {...props}
    >
      {ICONS[name]}
    </svg>
  );
}
