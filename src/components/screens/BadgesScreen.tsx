"use client";

import { motion } from "motion/react";
import { StarGlyph } from "@/components/kid/Celebrate";
import { Kip } from "@/components/kid/Kip";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { badgesFor, levelFor, totalStars } from "@/engine/rewards";
import { useHydrated, useLearner, useNow } from "@/lib/store";
import { FRACTIONS_TOPIC } from "@/topics/fractions";

export function BadgesScreen() {
  const hydrated = useHydrated();
  const learner = useLearner();
  const now = useNow();
  if (!hydrated) return <ScreenSkeleton />;

  const stars = totalStars(learner);
  const level = levelFor(stars);
  const badges = badgesFor(learner, FRACTIONS_TOPIC.skills, FRACTIONS_TOPIC.lessons.length, now);
  const earned = badges.filter((b) => b.earned);
  // Show the earned ones first, then the closest to being earned.
  const ordered = [...earned, ...badges.filter((b) => !b.earned).sort((a, b) => b.progress - a.progress)];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-sun via-[#ffb347] to-num p-5 text-ink shadow-[0_6px_0_#e08a00] sm:p-8">
        <div className="flex items-center gap-4 sm:gap-6">
          <Kip mood={earned.length ? "cheer" : "happy"} size={84} />
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase tracking-wide text-ink/70">Trophy room</p>
            <h1 className="display text-3xl leading-tight sm:text-4xl">
              {earned.length} badge{earned.length === 1 ? "" : "s"} collected
            </h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-semibold">
              <span className="inline-flex items-center gap-1">
                <StarGlyph size={20} /> {stars} stars
              </span>
              <span>
                Level {level.level} · {level.title}
              </span>
            </p>
          </div>
        </div>
      </section>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {ordered.map((b, i) => (
          <motion.li
            key={b.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: Math.min(i, 12) * 0.03 }}
            className={`card flex flex-col items-center gap-2 p-4 text-center ${b.earned ? "" : "bg-paper"}`}
          >
            <span
              className={`relative grid size-20 place-items-center rounded-full text-4xl ${
                b.earned ? "bg-gradient-to-br from-sun-soft to-[#ffe0a3] shadow-[0_4px_0_#f0c040] ring-4 ring-white" : "bg-sunk"
              }`}
            >
              <span aria-hidden className={b.earned ? "" : "opacity-30 grayscale"}>
                {b.icon}
              </span>
            </span>
            <p className="display text-base leading-tight">{b.title}</p>
            <p className="text-xs text-muted">{b.description}</p>
            {b.earned ? (
              <span className="rounded-full bg-ok-soft px-2.5 py-0.5 text-xs font-bold text-ok">Earned!</span>
            ) : (
              <div className="mt-auto w-full" role="progressbar" aria-label={`${b.title} progress`} aria-valuenow={Math.round(b.progress * 100)} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-2 overflow-hidden rounded-full bg-sunk">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${b.progress * 100}%` }} />
                </div>
              </div>
            )}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
