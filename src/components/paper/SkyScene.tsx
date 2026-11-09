"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { Kip, type KipMood } from "@/components/kid/Kip";
import { PAPER } from "./PaperIcon";

/** The scene's own coordinates. The box keeps this shape, so pictures and Kip line up at every width. */
const W = 600;
const H = 360;
/** Kip's width as a share of the scene, and Kip's drawing (viewBox 110 × 150). */
const KIP_W = 0.14 * W;
const KIP_SCALE = KIP_W / 110;
/** Where the string meets the sail: the crossing of Kip's spars, in Kip's drawing. */
const BRIDLE = { x: 55, y: 52 };
/** The reel on the hill that holds the string. */
const REEL = { x: 112, y: 314 };
/** The next level's line. */
const LINE_Y = 46;

/**
 * The home picture: a cut-paper sky with Kip flying on a string. Kip's height
 * is the learner's progress through their current level, and the dashed line
 * at the top is the next level. A drawn picture made for this subject
 * (kid exception 2), with flat fields of colour (kid exception 1).
 */
export function SkyScene({
  progress,
  nextLevel,
  mood = "happy",
  children,
  className = "",
}: {
  /** 0–1 through the current level. */
  progress: number;
  nextLevel: number;
  mood?: KipMood;
  children?: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const p = Math.max(0, Math.min(1, progress));
  // Kip's top edge in scene units: clear of the hills at the start of a level, just under the line at the end.
  const kipTop = 150 - p * (150 - LINE_Y - 10);
  const kipLeft = 0.64 * W - KIP_W / 2;
  const bx = kipLeft + BRIDLE.x * KIP_SCALE;
  const by = kipTop + BRIDLE.y * KIP_SCALE;
  // A gentle sag below the straight line, as a real string has.
  const cx = (REEL.x + bx) / 2 + 36;
  const cy = (REEL.y + by) / 2 + 34;
  const string = `M ${REEL.x} ${REEL.y} Q ${cx} ${cy} ${bx} ${by}`;
  const move = reduce ? { duration: 0 } : { duration: 0.8, ease: "easeOut" as const };

  return (
    <div className={`relative aspect-[5/3] w-full overflow-hidden bg-sky-soft ${className}`}>
      <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${W} ${H}`} aria-hidden>
        <circle cx="530" cy="112" r="30" fill={PAPER.sun} />
        <g fill={PAPER.white}>
          <path d="M48 128 a22 22 0 0 1 40 -10 a26 26 0 0 1 48 6 a18 18 0 0 1 4 34 h-92 a16 16 0 0 1 0 -30 z" />
          <path d="M300 92 a18 18 0 0 1 32 -8 a22 22 0 0 1 40 6 a14 14 0 0 1 2 26 h-74 a13 13 0 0 1 0 -24 z" />
          <path d="M452 214 a16 16 0 0 1 28 -6 a20 20 0 0 1 36 6 a12 12 0 0 1 2 22 h-66 a11 11 0 0 1 0 -22 z" />
        </g>
        <path d="M-10 360 V300 Q90 256 200 296 T420 290 T620 274 V360 Z" fill={PAPER.leafSoft} />
        <path d="M-10 360 V326 Q120 292 260 322 T620 314 V360 Z" fill={PAPER.leaf} />

        <line x1="0" x2={W} y1={LINE_Y} y2={LINE_Y} stroke={PAPER.ink} strokeOpacity="0.35" strokeWidth="2" strokeDasharray="8 8" />
        <motion.path initial={false} animate={{ d: string }} transition={move} fill="none" stroke={PAPER.ink} strokeWidth="2" strokeLinecap="round" />

        {/* The reel: a paper spool pegged into the hill. */}
        <path d={`M${REEL.x} ${REEL.y + 6} v14`} stroke={PAPER.ink} strokeWidth="3" strokeLinecap="round" />
        <rect x={REEL.x - 13} y={REEL.y - 9} width="26" height="18" rx="3" fill={PAPER.red} stroke={PAPER.ink} strokeWidth="2.5" />
        <path d={`M${REEL.x - 6} ${REEL.y - 9} v18 M${REEL.x + 6} ${REEL.y - 9} v18`} stroke={PAPER.ink} strokeWidth="1.5" strokeOpacity="0.5" />
      </svg>

      <span className="absolute right-4 -translate-y-full pb-1 text-label font-semibold text-ink-2" style={{ top: `${(LINE_Y / H) * 100}%` }}>
        Level {nextLevel}
      </span>

      <motion.div
        className="absolute"
        style={{ left: `${(kipLeft / W) * 100}%`, width: `${(KIP_W / W) * 100}%` }}
        initial={false}
        animate={{ top: `${(kipTop / H) * 100}%` }}
        transition={move}
      >
        <Kip mood={mood} size={110} className="!h-auto !w-full" />
      </motion.div>

      {children && <div className="relative">{children}</div>}
    </div>
  );
}
