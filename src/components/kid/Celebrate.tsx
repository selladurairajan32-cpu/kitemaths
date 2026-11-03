"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";
import { PAPER } from "@/components/paper/PaperIcon";
import { hashString, prng } from "@/engine/random";

const COLOURS = [PAPER.red, PAPER.sun, PAPER.sky, PAPER.leaf];

/**
 * A short burst of paper bits (kite-panel triangles and ribbons) when a child
 * gets something right. Feedback motion (kid exception 4): one burst, no
 * loops, nothing at all with reduced motion. Remount with a new `burstKey` to
 * fire again.
 */
export function Confetti({ burstKey, pieces = 24 }: { burstKey: string | number; pieces?: number }) {
  const reduce = useReducedMotion();
  const bits = useMemo(() => {
    // Seeded per burst so renders are stable.
    const rand = prng(hashString(String(burstKey)));
    return Array.from({ length: pieces }, (_, i) => ({
      id: i,
      x: (rand() - 0.5) * 460,
      rise: 90 + rand() * 170,
      r: rand() * 540 - 270,
      color: COLOURS[i % COLOURS.length],
      kind: rand() < 0.55 ? ("triangle" as const) : ("ribbon" as const),
      size: 10 + rand() * 8,
      delay: rand() * 0.08,
    }));
  }, [burstKey, pieces]);
  if (reduce) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/2 z-30 flex justify-center" aria-hidden key={burstKey}>
      {bits.map((b) => (
        <motion.svg
          key={b.id}
          className="absolute"
          width={b.size}
          height={b.size}
          viewBox="0 0 10 10"
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: b.x, y: [0, -b.rise, -b.rise + 260], opacity: [1, 1, 0], rotate: b.r }}
          transition={{ duration: 1.3, delay: b.delay, ease: "easeOut", times: [0, 0.4, 1] }}
        >
          {b.kind === "triangle" ? <path d="M5 0 L10 9 L0 9 Z" fill={b.color} /> : <rect x="3.5" y="0" width="3" height="10" fill={b.color} />}
        </motion.svg>
      ))}
    </div>
  );
}

/** "+3" with a star, beside the praise line. */
export function StarPop({ amount, show }: { amount: number; show: boolean }) {
  return (
    <AnimatePresence>
      {show && amount > 0 && (
        <motion.span
          className="inline-flex items-center gap-1 whitespace-nowrap text-lg font-semibold text-ink"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          aria-label={`You earned ${amount} stars`}
        >
          +{amount} <StarGlyph size={20} />
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export function StarGlyph({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 2.6l2.8 5.8 6.3.8-4.6 4.4 1.1 6.3L12 16.9l-5.6 3 1.1-6.3L2.9 9.2l6.3-.8z"
        fill={PAPER.sun}
        stroke={PAPER.ink}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FlameGlyph({ size = 20, lit = true }: { size?: number; lit?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 2.5c.6 3.2 5 5.3 5 10.2a5 5 0 0 1-10 0c0-2.1 1-3.5 2-4.6.2 1.4.9 2.4 1.9 2.8-.3-3.4.7-6 1.1-8.4z"
        fill={lit ? PAPER.red : "var(--color-line)"}
        stroke={PAPER.ink}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeOpacity={lit ? 1 : 0.4}
      />
      <path d="M12 21.4a3.3 3.3 0 0 1-3.3-3.3c0-2 1.6-3 2.4-4.6.6 1.5 4.2 2.3 4.2 4.6a3.3 3.3 0 0 1-3.3 3.3z" fill={lit ? PAPER.sun : "var(--color-sunk)"} />
    </svg>
  );
}
