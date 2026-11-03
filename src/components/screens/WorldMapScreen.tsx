"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Kip } from "@/components/kid/Kip";
import { CheckIcon, LockIcon } from "@/components/ui/Icons";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { lessonsCompleted, recommendNext } from "@/engine/journey";
import { topicLearner } from "@/engine/progress";
import { topicRoutes } from "@/lib/routes";
import { useHydrated, useLearner } from "@/lib/store";
import { topicById } from "@/topics";
import { activeTopic } from "@/topics/recommend";
import { WORLDS } from "@/topics/worlds";

/** Every world and island. Playable islands show progress; the rest are coming soon. */
export function WorldMapScreen() {
  const hydrated = useHydrated();
  const learner = useLearner();
  if (!hydrated) return <ScreenSkeleton />;
  const here = activeTopic(learner).id;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex items-center gap-4">
        <Kip mood="happy" size={64} />
        <div>
          <p className="eyebrow">Kite Maths</p>
          <h1 className="display text-3xl sm:text-4xl">World map</h1>
          <p className="mt-1 text-ink-2">Fly from island to island. New islands are on their way!</p>
        </div>
      </header>

      <ol className="space-y-5">
        {WORLDS.map((world, wi) => (
          <motion.li
            key={world.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: wi * 0.05 }}
            className="overflow-hidden rounded-[2rem] border-2 border-line bg-surface shadow-[var(--shadow-card)]"
          >
            <div className="flex items-center gap-3 px-5 py-4" style={{ background: world.soft }}>
              <span className="grid size-12 place-items-center rounded-2xl bg-white/80 text-2xl" aria-hidden>
                {world.emoji}
              </span>
              <h2 className="display text-2xl" style={{ color: world.color }}>
                {world.title}
              </h2>
            </div>
            <ul className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
              {world.islands.map((island) => {
                const topic = island.topicId ? topicById(island.topicId) : undefined;
                if (!topic) {
                  return (
                    <li key={island.title} className="flex items-center gap-3 rounded-2xl border-2 border-dashed border-line bg-paper p-3 text-muted">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-sunk text-xl opacity-60" aria-hidden>
                        {island.emoji}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold leading-tight">{island.title}</span>
                        <span className="mt-0.5 inline-flex items-center gap-1 text-xs">
                          <LockIcon size={12} /> Coming soon
                        </span>
                      </span>
                    </li>
                  );
                }
                const t = topicLearner(learner, topic.id);
                const done = lessonsCompleted(topic, t);
                const finished = recommendNext(topic, t).kind === "results";
                const isHere = topic.id === here;
                return (
                  <li key={island.title}>
                    <Link
                      href={topicRoutes(topic.id).island()}
                      className={`press relative flex items-center gap-3 rounded-2xl border-2 p-3 ${isHere ? "border-brand bg-brand-soft" : "border-line bg-surface hover:bg-sunk"}`}
                      style={{ boxShadow: `0 4px 0 ${isHere ? "var(--color-brand-strong)" : "var(--color-line)"}` }}
                    >
                      <span className="relative grid size-11 shrink-0 place-items-center rounded-xl text-xl" style={{ background: topic.look.soft }} aria-hidden>
                        {topic.look.emoji}
                        {finished && (
                          <span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full bg-ok-bright text-white ring-2 ring-white">
                            <CheckIcon size={11} strokeWidth={3} />
                          </span>
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold leading-tight text-ink">{island.title}</span>
                        <span className="text-xs text-muted">
                          {done} of {topic.lessons.length} lessons
                          {isHere && <strong className="ml-1 text-brand-strong">· You are here</strong>}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
