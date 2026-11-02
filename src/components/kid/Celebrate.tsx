"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";
import { hashString, prng } from "@/engine/random";

const COLORS = ["#ff6a45", "#ffc83a", "#2f74ff", "#6a4cff", "#22c174", "#ff4f9a", "#1fbfae"];

/** A one-shot confetti burst. Remount (change `burstKey`) to fire again. */
export function Confetti({ burstKey, pieces = 36 }: { burstKey: string | number; pieces?: number }) {
  const reduce = useReducedMotion();
  const bits = useMemo(() => {
    // Deterministic per burst so renders are stable.
    const rand = prng(hashString(String(burstKey)));
    return Array.from({ length: pieces }, (_, i) => ({
      id: i,
      x: (rand() - 0.5) * 520,
      y: -120 - rand() * 260,
      r: rand() * 720 - 360,
      color: COLORS[i % COLORS.length],
      w: 6 + rand() * 6,
      h: 8 + rand() * 10,
      round: rand() < 0.3,
      delay: rand() * 0.12,
    }));
  }, [burstKey, pieces]);
  if (reduce) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/2 z-30 flex justify-center" aria-hidden key={burstKey}>
      {bits.map((b) => (
        <motion.span
          key={b.id}
          className="absolute"
          style={{ width: b.w, height: b.round ? b.w : b.h, background: b.color, borderRadius: b.round ? 999 : 2 }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
          animate={{ x: b.x, y: [0, b.y, b.y + 420], opacity: [1, 1, 0], rotate: b.r, scale: 1 }}
          transition={{ duration: 1.6, delay: b.delay, ease: [0.2, 0.7, 0.4, 1], times: [0, 0.35, 1] }}
        />
      ))}
    </div>
  );
}

/** "+3 ⭐" that floats up and fades. */
export function StarPop({ amount, show }: { amount: number; show: boolean }) {
  return (
    <AnimatePresence>
      {show && amount > 0 && (
        <motion.span
          className="pointer-events-none inline-flex items-center gap-1 rounded-full bg-sun px-3 py-1 text-sm font-bold text-ink shadow-[0_3px_0_var(--color-sun-strong)]"
          initial={{ opacity: 0, y: 8, scale: 0.7 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ type: "spring", stiffness: 420, damping: 18 }}
          aria-label={`You earned ${amount} stars`}
        >
          +{amount} <StarGlyph size={16} />
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export function StarGlyph({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 2.8l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"
        fill="#ffc83a"
        stroke="#e09a00"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FlameGlyph({ size = 20, lit = true }: { size?: number; lit?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 2.5c.6 3.2 4.8 5.3 4.8 10.2A4.8 4.8 0 0 1 12 17.6a4.8 4.8 0 0 1-4.8-4.9c0-2.1 1-3.5 2-4.6.2 1.4.9 2.4 1.9 2.8-.3-3.4.6-6 .9-8.4z"
        fill={lit ? "#ff6a45" : "#c2cdea"}
      />
      <path d="M12 21.5a3.4 3.4 0 0 1-3.4-3.4c0-2 1.6-3 2.4-4.6.6 1.5 4.4 2.3 4.4 4.6a3.4 3.4 0 0 1-3.4 3.4z" fill={lit ? "#ffc83a" : "#dde5f6"} />
    </svg>
  );
}
