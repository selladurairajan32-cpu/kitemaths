import { useId } from "react";
import { PAPER } from "./PaperIcon";

/**
 * A paper kite of four triangle panels: quarters. Panels fill clockwise from
 * the top left, so a lesson stop shows how far through it you are, and a
 * collected kite on the shelf is fully coloured with its own pattern.
 */

export type KitePattern = "plain" | "stripes" | "dots" | "chevrons" | "checks" | "waves" | "sun";

export const KITE_PATTERNS: KitePattern[] = ["plain", "stripes", "dots", "chevrons", "checks", "waves", "sun"];

const DEFAULT_COLOURS = [PAPER.red, PAPER.sun, PAPER.leaf, PAPER.sky] as const;

/** Panels in clockwise order: top left, top right, bottom right, bottom left. */
const PANELS = ["M30 4 L8 32 L30 32 Z", "M30 4 L52 32 L30 32 Z", "M52 32 L30 66 L30 32 Z", "M8 32 L30 66 L30 32 Z"];

export function PaperKite({
  filled = 4,
  colours = DEFAULT_COLOURS,
  pattern = "plain",
  outline = "solid",
  tail = true,
  size = 60,
  className = "",
  title,
}: {
  /** How many of the four panels are coloured (0–4). */
  filled?: number;
  colours?: readonly string[];
  pattern?: KitePattern;
  /** "dashed" draws a kite you haven't reached yet. */
  outline?: "solid" | "dashed";
  tail?: boolean;
  size?: number;
  className?: string;
  title?: string;
}) {
  const id = useId().replace(/:/g, "");
  const pid = `kp-${id}`;
  const height = tail ? (size * 90) / 60 : (size * 70) / 60;
  const dash = outline === "dashed" ? { strokeDasharray: "5 5" } : {};

  return (
    <svg
      width={size}
      height={height}
      viewBox={`0 0 60 ${tail ? 90 : 70}`}
      className={`shrink-0 overflow-visible ${className}`}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {pattern !== "plain" && (
        <defs>
          <PatternDef id={pid} pattern={pattern} />
        </defs>
      )}
      {PANELS.map((d, i) => {
        const on = i < filled;
        return (
          <g key={d}>
            <path d={d} fill={on ? colours[i % colours.length] : PAPER.white} />
            {on && pattern !== "plain" && <path d={d} fill={`url(#${pid})`} />}
          </g>
        );
      })}
      <path d="M30 4 L52 32 L30 66 L8 32 Z" fill="none" stroke={PAPER.ink} strokeWidth="3" strokeLinejoin="round" {...dash} />
      <path d="M30 4 V66 M8 32 H52" fill="none" stroke={PAPER.ink} strokeWidth="2" strokeOpacity={outline === "dashed" ? 0.35 : 1} {...dash} />
      {tail && (
        <g>
          <path d="M30 66 C24 72 36 76 30 82 S 33 88 36 90" fill="none" stroke={PAPER.ink} strokeWidth="2" strokeLinecap="round" strokeOpacity={outline === "dashed" ? 0.35 : 1} />
          {outline === "solid" && (
            <>
              <path d="M27 73 l-6 -3 l1 7 Z" fill={colours[0]} stroke={PAPER.ink} strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M33 73 l6 -3 l-1 7 Z" fill={colours[0]} stroke={PAPER.ink} strokeWidth="1.5" strokeLinejoin="round" />
            </>
          )}
        </g>
      )}
    </svg>
  );
}

function PatternDef({ id, pattern }: { id: string; pattern: Exclude<KitePattern, "plain"> }) {
  const w = "rgba(255,255,255,0.55)";
  switch (pattern) {
    case "stripes":
      return (
        <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="3.5" height="8" fill={w} />
        </pattern>
      );
    case "dots":
      return (
        <pattern id={id} width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="4" cy="4" r="1.8" fill={w} />
        </pattern>
      );
    case "chevrons":
      return (
        <pattern id={id} width="10" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 6 L5 2 L10 6" fill="none" stroke={w} strokeWidth="2" />
        </pattern>
      );
    case "checks":
      return (
        <pattern id={id} width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="5" height="5" fill={w} />
          <rect x="5" y="5" width="5" height="5" fill={w} />
        </pattern>
      );
    case "waves":
      return (
        <pattern id={id} width="12" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 4 Q3 1 6 4 T12 4" fill="none" stroke={w} strokeWidth="2" />
        </pattern>
      );
    case "sun":
      return (
        <pattern id={id} width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="3" fill={w} />
          <path d="M7 0 V2 M7 12 V14 M0 7 H2 M12 7 H14" stroke={w} strokeWidth="1.5" />
        </pattern>
      );
  }
}
