"use client";

import { useState } from "react";
import { TopicBar, yearsText } from "@/components/kid/Overview";
import Link from "next/link";
import { motion } from "motion/react";
import { PaperIcon } from "@/components/paper/PaperIcon";
import { CheckIcon } from "@/components/ui/Icons";
import { KID_STATUS } from "@/components/kid/kidText";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { topicRoutes } from "@/lib/routes";
import { useHydrated, useLearner } from "@/lib/store";
import { topicOverviews } from "@/topics/overview";
import { activeTopic } from "@/topics/recommend";
import { WORLDS } from "@/topics/worlds";

/**
 * Topics, in the first prototype's look (D-066): a page header, filters as outlined pills (the active one ink), and each
 * world's topics as white cards with the topic's picture, its name, what it covers and how far the child has got (skills
 * from MAST-001, lessons from CUR-002 evidence). Filter by world, or by the child's school year.
 */
export function TopicsScreen() {
  const hydrated = useHydrated();
  const learner = useLearner();
  const [world, setWorld] = useState<string>("all");
  const year = learner.profile.year;
  // Unset until the child ticks or unticks it: then "only my year" follows whether a year is chosen (it loads after hydration).
  const [onlyMine, setMine] = useState<boolean | null>(null);
  const mine = onlyMine ?? year !== null;
  if (!hydrated) return <ScreenSkeleton />;
  const here = activeTopic(learner).id;
  const all = topicOverviews(learner);
  const shown = all.filter(({ topic }) => (world === "all" || topic.world === world) && (!mine || year === null || topic.years.includes(year)));
  const started = all.filter(({ o }) => o.started).length;

  const chip = (on: boolean) => `flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border px-4 text-label font-medium transition-colors ${on ? "border-ink bg-ink text-white" : "border-line-strong bg-surface text-ink hover:bg-sunk"}`;

  return (
    <div className="space-y-8">
      <header>
        <p className="eyebrow">Topics</p>
        <h1 id="topics-title" className="display text-heading-1 sm:text-display-2">
          Choose a topic
        </h1>
        <p className="mt-2 max-w-xl text-body text-ink-2">
          {all.length} topics for Years 3 to 6 and the 11+, in six worlds. You have started {started}. Each topic has short lessons, then practice, then a
          mastery check.
        </p>
      </header>

      <div className="space-y-3">
        <p className="text-label font-medium text-ink">Show topics from</p>
        <div role="group" aria-label="Show topics from" className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={world === "all"} onClick={() => setWorld("all")} className={chip(world === "all")}>
            All topics
          </button>
          {WORLDS.map((w) => (
            <button key={w.id} type="button" aria-pressed={world === w.id} onClick={() => setWorld(w.id)} className={chip(world === w.id)}>
              {w.title}
            </button>
          ))}
        </div>
        {year !== null && (
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-label font-medium text-ink-2">
            <input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} className="size-5 accent-ink" />
            Only Year {year} topics
          </label>
        )}
      </div>

      {shown.length === 0 ? (
        <p className="rounded-[var(--radius-card)] border border-dashed border-line-strong p-6 text-body text-ink-2">No topics here for Year {year}. Untick &ldquo;Only Year {year} topics&rdquo; to see them all.</p>
      ) : (
        WORLDS.map((w) => {
          const mine = shown.filter(({ topic }) => topic.world === w.id);
          if (mine.length === 0) return null;
          return (
            <section key={w.id} aria-labelledby={`world-${w.id}`} className="space-y-3">
              <h2 id={`world-${w.id}`} className="eyebrow">
                {w.title}
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label={`${w.title} topics`}>
                {mine.map(({ topic, o }, i) => {
                  const isHere = topic.id === here;
                  const finished = o.skills > 0 && o.mastered === o.skills;
                  const status = finished ? KID_STATUS.mastered : o.started ? KID_STATUS.developing : KID_STATUS["not-started"];
                  return (
                    <motion.li key={topic.id} className="flex" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 6) * 0.04 }}>
                      <Link href={topicRoutes(topic.id).island()} aria-label={`${topic.title}. ${yearsText(topic.years)}. ${o.lessonsDone} of ${o.lessons} lessons done, ${o.mastered} of ${o.skills} skills mastered.${isHere ? " You are here." : ""}`} className={`card flex flex-1 flex-col gap-3 p-5 transition-shadow hover:shadow-[var(--shadow-lift)] ${isHere ? "ring-1 ring-ink/15" : ""}`}>
                        <span className="flex items-start justify-between gap-3">
                          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-sunk" aria-hidden>
                            <PaperIcon name={topic.look.icon} size={30} />
                          </span>
                          {finished ? (
                            <span className="grid size-7 place-items-center rounded-full bg-ok text-white" aria-hidden>
                              <CheckIcon size={15} />
                            </span>
                          ) : (
                            <span className="rounded-full bg-sunk px-2.5 py-0.5 text-label font-medium text-muted">{yearsText(topic.years)}</span>
                          )}
                        </span>
                        <span className="block">
                          <span className="block font-sans text-title font-semibold text-ink">{topic.title}</span>
                          <span className="mt-0.5 block text-label text-ink-2">{topic.subtitle}</span>
                        </span>
                        <span className="mt-auto block space-y-2 pt-1">
                          <TopicBar o={o} label={topic.title} />
                          <span className="flex flex-wrap items-center justify-between gap-2 text-label text-muted">
                            <span>
                              {o.lessonsDone} / {o.lessons} lessons · {o.mastered} / {o.skills} mastered
                            </span>
                            {isHere ? <span className="font-medium text-den">You are here</span> : <span className={`rounded-full px-2.5 py-0.5 font-medium ${status.cls}`}>{status.label}</span>}
                          </span>
                        </span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}
