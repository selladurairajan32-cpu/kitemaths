"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { levelFor, streakFor, totalStars } from "@/engine/rewards";
import { routes } from "@/lib/routes";
import { playSound } from "@/lib/sound";
import { useHydrated, useLearner, useNow } from "@/lib/store";
import { Pic } from "@/components/paper/Pic";

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

  // D-046: the reward is called XP (the same numbers as stars before); the avatar wears the level as a ring that fills
  // towards the next level.
  const toNext = level.needed - level.into;
  const ring = 2 * Math.PI * 21;
  return (
    <Link
      href={routes.progress()}
      className="flex items-center gap-1.5 rounded-full sm:gap-2"
      aria-label={`${stars} XP, level ${level.level}, ${toNext} XP to level ${level.level + 1}${streak.current ? `, ${streak.current} day streak` : ""}. See your progress.`}
    >
      <span className="relative flex min-h-11 items-center gap-1.5 rounded-full bg-surface pl-1.5 pr-3.5 shadow-[var(--shadow-card)] ring-1 ring-line">
        <motion.span key={stars} className="grid" initial={gained ? { scale: 1.35 } : false} animate={{ scale: 1 }} transition={{ duration: 0.35, ease: "easeOut" }}>
          <Pic name="star" size={26} />
        </motion.span>
        <span className="whitespace-nowrap text-body font-extrabold tabular-nums leading-none text-ink">
          {stars.toLocaleString("en-GB")} <span className="text-label font-bold text-ink-2">XP</span>
        </span>
        <AnimatePresence>
          {gained > 0 && (
            <motion.span
              key={`gain-${stars}`}
              className="absolute -top-4 left-2 whitespace-nowrap text-label font-bold text-ink"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -12 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              aria-hidden
            >
              +{gained} XP
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      {!compact && (
        <span className="hidden min-h-11 items-center gap-1 rounded-full bg-surface pl-1.5 pr-3 shadow-[var(--shadow-card)] ring-1 ring-line sm:flex" title={`${streak.current} day streak`}>
          <Pic name="flame" size={24} muted={!streak.activeToday} />
          <span className={`text-body font-extrabold tabular-nums leading-none ${streak.activeToday ? "text-ink" : "text-muted"}`}>{streak.current}</span>
        </span>
      )}
      <span className="relative grid size-12 shrink-0 place-items-center" data-testid="hud-level">
        <svg width={48} height={48} viewBox="0 0 48 48" className="absolute inset-0 -rotate-90" aria-hidden>
          <circle cx={24} cy={24} r={21} fill="var(--color-surface)" stroke="var(--color-line)" strokeWidth={4} />
          <circle cx={24} cy={24} r={21} fill="none" stroke="var(--color-ok-bright)" strokeWidth={4} strokeLinecap="round" strokeDasharray={`${(level.into / level.needed) * ring} ${ring}`} />
        </svg>
        <Pic name="avatar" size={34} className="relative" />
        <span className="absolute -bottom-1 -right-1 grid min-w-6 place-items-center rounded-full bg-brand px-1 text-label font-extrabold leading-6 text-on-brand ring-2 ring-white" aria-hidden>
          {level.level}
        </span>
      </span>
    </Link>
  );
}
