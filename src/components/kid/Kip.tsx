"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { PAPER } from "@/components/paper/PaperIcon";
import { ReadAloud } from "./ReadAloud";

export type KipMood = "happy" | "cheer" | "think" | "oops";

const { ink, red, sun, sky, leaf, white } = PAPER;

/**
 * Kip, the kite who guides learners: four cut-paper panels (quarters) with an
 * ink outline, and a face drawn straight onto the sail. Kip sways gently in
 * the wind (kid exception 4: idle character motion, off with reduced motion).
 */
export function Kip({
  mood = "happy",
  size = 96,
  float = true,
  className = "",
}: {
  mood?: KipMood;
  size?: number;
  float?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const look = mood === "think" ? { x: 1.5, y: -1.5 } : { x: 0, y: 0 };
  const eye = (cx: number) =>
    mood === "cheer" ? (
      <path d={`M${cx - 6} 33 Q${cx} 26 ${cx + 6} 33`} fill="none" stroke={ink} strokeWidth="3.5" strokeLinecap="round" />
    ) : (
      <>
        <circle cx={cx} cy={31} r="7" fill={white} stroke={ink} strokeWidth="2.5" />
        <circle cx={cx + look.x} cy={31.5 + look.y} r="3.4" fill={ink} />
      </>
    );

  return (
    <motion.svg
      width={size}
      height={size * (150 / 110)}
      viewBox="0 0 110 150"
      className={`shrink-0 overflow-visible ${className}`}
      aria-hidden
      style={{ originX: "50%", originY: "45%" }}
      animate={float && !reduce ? { rotate: [-3, 3, -3] } : undefined}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* tail */}
      <path d="M55 112 C46 122 64 128 55 138 S 60 146 66 150" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />
      <path d="M50 121 l-9 -4 l2 10 Z" fill={red} stroke={ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M60 121 l9 -4 l-2 10 Z" fill={red} stroke={ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M53 139 l-9 -3 l3 9 Z" fill={sun} stroke={ink} strokeWidth="2" strokeLinejoin="round" />

      {/* sail: four paper panels */}
      <path d="M55 4 L8 52 L55 52 Z" fill={red} />
      <path d="M55 4 L102 52 L55 52 Z" fill={sun} />
      <path d="M102 52 L55 112 L55 52 Z" fill={leaf} />
      <path d="M8 52 L55 112 L55 52 Z" fill={sky} />
      <path d="M55 4 V112 M8 52 H102" stroke={ink} strokeWidth="2.5" strokeOpacity="0.4" />
      <path d="M55 4 L102 52 L55 112 L8 52 Z" fill="none" stroke={ink} strokeWidth="4" strokeLinejoin="round" />

      {/* face */}
      {eye(41)}
      {eye(69)}
      {mood === "oops" && <path d="M33 20 L46 23 M77 20 L64 23" stroke={ink} strokeWidth="3" strokeLinecap="round" />}
      {mood === "think" && <path d="M62 19 Q69 15 77 19" fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round" />}
      {mood === "happy" && <path d="M44 57 Q55 68 66 57" fill="none" stroke={ink} strokeWidth="3.5" strokeLinecap="round" />}
      {mood === "cheer" && <path d="M42 55 Q55 75 68 55 Z" fill={ink} stroke={ink} strokeWidth="2.5" strokeLinejoin="round" />}
      {mood === "think" && <circle cx="58" cy="62" r="4" fill={ink} />}
      {mood === "oops" && <path d="M44 62 Q49.5 57 55 62 Q60.5 67 66 62" fill="none" stroke={ink} strokeWidth="3.5" strokeLinecap="round" />}
    </motion.svg>
  );
}

/** Kip with a speech bubble: a flat tone shape, no border (kid exception 6). Text can be read aloud. */
export function KipSays({
  mood = "happy",
  children,
  speak,
  size = 64,
  className = "",
  tone = "white",
}: {
  mood?: KipMood;
  children: ReactNode;
  /** Plain text to read aloud (markup allowed: **bold** and {n/d}). */
  speak?: string;
  size?: number;
  className?: string;
  tone?: "white" | "sun" | "sky";
}) {
  const bg = { white: "bg-surface", sun: "bg-sun-soft", sky: "bg-sky-soft" }[tone];
  const tailFill = { white: "#ffffff", sun: "var(--color-sun-soft)", sky: "var(--color-sky-soft)" }[tone];
  return (
    <div className={`flex items-end gap-2 ${className}`}>
      <Kip mood={mood} size={size} />
      <div className={`relative mb-5 min-w-0 flex-1 rounded-[4px] px-4 py-3 ${bg}`}>
        <svg className="absolute -left-[10px] bottom-4" width="12" height="16" viewBox="0 0 12 16" aria-hidden>
          <path d="M12 0 L0 10 L12 16 Z" fill={tailFill} />
        </svg>
        <div className="relative flex items-start gap-2">
          <div className="min-w-0 flex-1 text-ink">{children}</div>
          {speak && <ReadAloud text={speak} className="-mr-1 -mt-1" />}
        </div>
      </div>
    </div>
  );
}
