"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { levelFor, streakFor, totalStars } from "@/engine/rewards";
import { routes } from "@/lib/routes";
import { playSound } from "@/lib/sound";
import { useHydrated, useLearner, useNow } from "@/lib/store";
import { FlameGlyph, StarGlyph } from "./Celebrate";

/**
 * Tracks how many stars just arrived (and whether the level went up),
 * using React's "adjust state while rendering" pattern.
 */
function useGain(stars: number, level: number, ready: boolean) {
  const [seen, setSeen] = useState<{ stars: number; level: number } | null>(null);
  const [gain, setGain] = useState({ amount: 0, levelUp: false, at: 0 });
  if (ready && (seen === null || seen.stars !== stars)) {
    setSeen({ stars, level });
    if (seen !== null && stars > seen.stars) setGain({ amount: stars - seen.stars, levelUp: level > seen.level, at: stars });
  }
  return gain;
}

/** Stars + streak, shown in the header. Pops and chimes when stars arrive. */
export function Hud({ compact = false }: { compact?: boolean }) {
  const hydrated = useHydrated();
  const learner = useLearner();
  const stars = totalStars(learner);
  const level = levelFor(stars);
  const now = useNow();
  const streak = streakFor(learner, now);
  const gain = useGain(stars, level.level, hydrated);
  const gained = gain.at === stars ? gain.amount : 0;

  useEffect(() => {
    if (!gain.amount) return;
    playSound(gain.levelUp ? "levelUp" : "star");
  }, [gain]);

  if (!hydrated) return <div className="h-10 w-32" aria-hidden />;

  return (
    <Link
      href={routes.badges()}
      className="group flex items-center gap-1.5 rounded-full border-2 border-line bg-surface py-1 pl-1.5 pr-3 shadow-[0_3px_0_var(--color-line)] transition-transform hover:-translate-y-0.5"
      aria-label={`${stars} stars, level ${level.level}${streak.current ? `, ${streak.current} day streak` : ""}. See your badges.`}
    >
      <span className="relative grid size-8 place-items-center rounded-full bg-sun-soft">
        <motion.span key={stars} initial={gained ? { scale: 1.6, rotate: -20 } : false} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 380, damping: 12 }}>
          <StarGlyph size={20} />
        </motion.span>
        <AnimatePresence>
          {gained > 0 && (
            <motion.span
              key={`gain-${stars}`}
              className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold text-sun-strong"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -14 }}
              transition={{ duration: 1.2 }}
              aria-hidden
            >
              +{gained}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <span className="display text-lg tabular-nums leading-none">{stars}</span>
      {!compact && (
        <span className="ml-1 hidden whitespace-nowrap rounded-full bg-brand-soft px-2 py-0.5 text-xs font-bold text-brand-strong xl:inline">Lv {level.level}</span>
      )}
      <span className="ml-1.5 flex items-center gap-0.5" title={`${streak.current} day streak`}>
        <FlameGlyph size={20} lit={streak.activeToday} />
        <span className={`display text-lg tabular-nums leading-none ${streak.activeToday ? "text-num-strong" : "text-muted"}`}>{streak.current}</span>
      </span>
    </Link>
  );
}
