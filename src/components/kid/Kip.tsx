"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { Pic } from "@/components/paper/Pic";
import { ReadAloud } from "./ReadAloud";

export type KipMood = "happy" | "cheer" | "think" | "oops";

const INK = "#1b2559";

/** Kip's face, drawn on the sail of the 3D kite (on a 60 × 40 grid). */
function Face({ mood }: { mood: KipMood }) {
  const look = mood === "think" ? 1.4 : 0;
  return (
    <>
      <ellipse cx="17" cy="14" rx="6.5" ry="7.5" fill="#fff" />
      <ellipse cx="43" cy="14" rx="6.5" ry="7.5" fill="#fff" />
      <circle cx={18 + look} cy={15 - look} r="4" fill={INK} />
      <circle cx={44 + look} cy={15 - look} r="4" fill={INK} />
      <circle cx={19.5 + look} cy={13.2 - look} r="1.4" fill="#fff" />
      <circle cx={45.5 + look} cy={13.2 - look} r="1.4" fill="#fff" />
      {mood === "happy" && <path d="M21 27 Q30 36 39 27" fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />}
      {mood === "cheer" && (
        <>
          <path d="M20 25 Q30 40 40 25 Z" fill={INK} />
          <path d="M25 31 Q30 35 35 31" fill="#ff7a8a" />
        </>
      )}
      {mood === "think" && <circle cx="31" cy="29" r="3.4" fill={INK} />}
      {mood === "oops" && (
        <>
          <path d="M10 5 L22 8 M50 5 L38 8" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
          <path d="M22 30 Q26 26 30 30 Q34 34 38 30" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      <ellipse cx="9" cy="26" rx="4" ry="2.4" fill="#ff8fab" opacity=".7" />
      <ellipse cx="51" cy="26" rx="4" ry="2.4" fill="#ff8fab" opacity=".7" />
    </>
  );
}

/**
 * Kip, the kite who guides learners: a 3D kite with a face on the sail. Kip sways gently in the wind
 * (feedback-only motion; still when reduced motion is on). `size` is Kip's width in pixels.
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
  return (
    <motion.span
      className={`relative inline-block shrink-0 leading-none ${className}`}
      style={{ width: size, height: size, originX: "35%", originY: "45%" }}
      animate={float && !reduce ? { rotate: [-3, 3, -3] } : undefined}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden
    >
      <Pic name="kite" size={size} fluid className="h-full w-full" />
      <svg
        viewBox="0 0 60 40"
        className="absolute"
        style={{ left: "32%", top: "41%", width: "28%", transform: "translate(-50%, -50%) rotate(-14deg)" }}
      >
        <Face mood={mood} />
      </svg>
    </motion.span>
  );
}

/** Kip with a speech bubble. Text can be read aloud. */
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
  const bg = { white: "bg-surface border border-line", sun: "bg-warn-soft", sky: "bg-brand-soft" }[tone];
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Kip mood={mood} size={size} />
      <div className={`relative min-w-0 flex-1 rounded-[20px] px-5 py-3.5 ${bg}`}>
        <div className="relative flex items-start gap-2">
          <div className="min-w-0 flex-1 text-ink">{children}</div>
          {speak && <ReadAloud text={speak} className="-mr-1 -mt-1" />}
        </div>
      </div>
    </div>
  );
}
