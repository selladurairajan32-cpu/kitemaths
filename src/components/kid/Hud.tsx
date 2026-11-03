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
      className="flex h-11 items-center gap-3 rounded-full px-3 hover:bg-sunk"
      aria-label={`${stars} stars, level ${level.level}${streak.current ? `, ${streak.current} day streak` : ""}. See your kites.`}
    >
      <span className="relative flex items-center gap-1.5">
        <motion.span
          key={stars}
          className="grid"
          initial={gained ? { scale: 1.35 } : false}
          animate={{ scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <StarGlyph size={22} />
        </motion.span>
        <span className="text-lg font-semibold tabular-nums leading-none text-ink">{stars}</span>
        <AnimatePresence>
          {gained > 0 && (
            <motion.span
              key={`gain-${stars}`}
              className="absolute -top-4 left-0 whitespace-nowrap text-sm font-semibold text-ink"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -12 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              aria-hidden
            >
              +{gained}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      {!compact && <span className="hidden whitespace-nowrap text-sm text-muted xl:inline">Level {level.level}</span>}
      <span className="flex items-center gap-1" title={`${streak.current} day streak`}>
        <FlameGlyph size={22} lit={streak.activeToday} />
        <span className={`text-lg font-semibold tabular-nums leading-none ${streak.activeToday ? "text-ink" : "text-muted"}`}>{streak.current}</span>
      </span>
    </Link>
  );
}
