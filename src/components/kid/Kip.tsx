"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { ReadAloud } from "./ReadAloud";

export type KipMood = "happy" | "cheer" | "think" | "oops";

/** Kip — the kite who guides learners through Kite Maths. */
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
  const look = mood === "think" ? { x: 1.5, y: -2 } : { x: 0, y: 0 };
  return (
    <motion.svg
      width={size}
      height={size * (160 / 120)}
      viewBox="0 0 120 160"
      className={`shrink-0 overflow-visible ${className}`}
      aria-hidden
      animate={float && !reduce ? { y: [0, -6, 0], rotate: [-3, 3, -3] } : undefined}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* tail */}
      <path d="M60 116 C 52 128, 70 134, 60 146 S 66 158, 72 160" fill="none" stroke="#1d2350" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M53 127 l-8 -5 l1 10 Z" fill="#ff4f9a" />
      <path d="M67 127 l8 -5 l-1 10 Z" fill="#ff4f9a" />
      <path d="M56 145 l-8 -4 l2 9 Z" fill="#ffc83a" />
      <path d="M64 145 l8 -4 l-2 9 Z" fill="#ffc83a" />

      {/* sail */}
      <path d="M60 6 L12 58 L60 58 Z" fill="#ff6a45" />
      <path d="M60 6 L108 58 L60 58 Z" fill="#ffc83a" />
      <path d="M12 58 L60 118 L60 58 Z" fill="#6a4cff" />
      <path d="M108 58 L60 118 L60 58 Z" fill="#2f74ff" />
      <path d="M60 6 L108 58 L60 118 L12 58 Z" fill="none" stroke="#1d2350" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M60 6 V118 M12 58 H108" stroke="#1d2350" strokeWidth="2" opacity="0.35" />

      {/* face */}
      <ellipse cx="60" cy="62" rx="27" ry="22" fill="#fff" opacity="0.92" />
      <ellipse cx="42" cy="71" rx="5" ry="3" fill="#ff4f9a" opacity="0.45" />
      <ellipse cx="78" cy="71" rx="5" ry="3" fill="#ff4f9a" opacity="0.45" />
      <motion.g
        style={{ originY: "56px" }}
        animate={reduce ? undefined : { scaleY: [1, 1, 0.1, 1, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, times: [0, 0.9, 0.93, 0.96, 1] }}
      >
        {mood === "cheer" ? (
          <>
            <path d="M43 58 Q49 50 55 58" fill="none" stroke="#1d2350" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M65 58 Q71 50 77 58" fill="none" stroke="#1d2350" strokeWidth="3.2" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="49" cy="56" r="6.5" fill="#1d2350" />
            <circle cx="71" cy="56" r="6.5" fill="#1d2350" />
            <circle cx={51 + look.x} cy={53.5 + look.y} r="2.2" fill="#fff" />
            <circle cx={73 + look.x} cy={53.5 + look.y} r="2.2" fill="#fff" />
          </>
        )}
      </motion.g>
      {mood === "oops" && (
        <>
          <path d="M42 46 L54 48" stroke="#1d2350" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M78 46 L66 48" stroke="#1d2350" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
      {mood === "think" && <path d="M64 45 Q71 41 78 45" fill="none" stroke="#1d2350" strokeWidth="2.5" strokeLinecap="round" />}
      {mood === "happy" && <path d="M51 68 Q60 77 69 68" fill="none" stroke="#1d2350" strokeWidth="3.2" strokeLinecap="round" />}
      {mood === "cheer" && (
        <>
          <path d="M48 66 Q60 84 72 66 Z" fill="#1d2350" strokeLinejoin="round" />
          <path d="M54 73 Q60 70 66 73 Q60 79 54 73 Z" fill="#ff6a8a" />
        </>
      )}
      {mood === "think" && <circle cx="63" cy="71" r="3.5" fill="#1d2350" />}
      {mood === "oops" && (
        <path d="M50 71 Q55 67 60 71 Q65 75 70 71" fill="none" stroke="#1d2350" strokeWidth="3" strokeLinecap="round" />
      )}
      {mood === "cheer" && !reduce && (
        <motion.g animate={{ opacity: [0, 1, 0], scale: [0.6, 1.1, 0.6] }} transition={{ duration: 1.6, repeat: Infinity }}>
          <path d="M8 18 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3Z" fill="#ffc83a" />
          <path d="M108 14 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2Z" fill="#ff4f9a" />
        </motion.g>
      )}
    </motion.svg>
  );
}

/** Kip with a speech bubble. Text can be read aloud. */
export function KipSays({
  mood = "happy",
  children,
  speak,
  size = 72,
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
  const bg = { white: "bg-surface border-line", sun: "bg-sun-soft border-sun/60", sky: "bg-sky-soft border-sky/40" }[tone];
  const tail = { white: "border-line bg-surface", sun: "border-sun/60 bg-sun-soft", sky: "border-sky/40 bg-sky-soft" }[tone];
  return (
    <div className={`flex items-end gap-3 ${className}`}>
      <Kip mood={mood} size={size} />
      <div className={`relative mb-6 min-w-0 flex-1 rounded-3xl border-2 px-4 py-3 ${bg}`}>
        <span className={`absolute -left-2 bottom-4 size-4 rotate-45 border-b-2 border-l-2 ${tail}`} aria-hidden />
        <div className="relative flex items-start gap-2">
          <div className="min-w-0 flex-1 font-medium text-ink">{children}</div>
          {speak && <ReadAloud text={speak} className="-mr-1 -mt-1" />}
        </div>
      </div>
    </div>
  );
}
