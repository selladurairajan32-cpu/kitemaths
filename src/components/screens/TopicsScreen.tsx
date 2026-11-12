"use client";

import Link from "next/link";
import { useState } from "react";
import { ScreenHero } from "@/components/kid/ScreenHero";
import { TopicBar, yearsText } from "@/components/kid/Overview";
import { PaperIcon } from "@/components/paper/PaperIcon";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/Icons";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { routes, topicRoutes } from "@/lib/routes";
import { useHydrated, useLearner } from "@/lib/store";
import { JOURNEYS } from "@/topics/kit/journeys";
import { hasStudyPlan } from "@/topics/kit/study";
import { topicOverviews } from "@/topics/overview";
import { activeTopic } from "@/topics/recommend";
import { WORLDS } from "@/topics/worlds";
import { FIELDS, WORLD_FIELD } from "@/components/kid/fields";


/**
 * D-043 step 3: every topic in one grid, with progress. Filter by world or by the child's school year; each card opens
 * the topic's island and says how far the child has got (skills from MAST-001, lessons from CUR-002 evidence).
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

  const chip = (active: boolean) =>
    `flex min-h-11 items-center whitespace-nowrap rounded-full px-4 text-label font-bold transition-colors ${active ? "bg-brand text-on-brand shadow-[0_6px_16px_rgb(37_99_235/0.3)]" : "bg-surface text-ink-2 shadow-[var(--shadow-card)] hover:bg-brand-soft"}`;

  return (
    <div className="space-y-8">
      <ScreenHero
        guide
        field={FIELDS.blue}
        titleId="topics-title"
        title="Topics"
        line={`${all.length} topics to explore. You have started ${started}. Pick one to see its lessons, or carry on where you are.`}
      >
        <Link href={routes.journey()} className="inline-flex min-h-11 items-center gap-1.5 text-lg font-bold text-white underline underline-offset-4">
          See them on the world map <ArrowRightIcon size={18} />
        </Link>
      </ScreenHero>

      <div className="space-y-3">
        <div role="group" aria-label="Show topics from" className="flex gap-2 overflow-x-auto pb-1">
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
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-label font-bold text-ink-2">
            <input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} className="size-5 accent-brand" />
            Only Year {year} topics
          </label>
        )}
      </div>

      {shown.length === 0 ? (
        <p className="rounded-[24px] bg-sunk p-6 text-body text-ink-2">No topics here for Year {year}. Untick &ldquo;Only Year {year} topics&rdquo; to see them all.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Topics">
          {shown.map(({ topic, o }) => {
            const isHere = topic.id === here;
            const finished = o.skills > 0 && o.mastered === o.skills;
            const journeys = JOURNEYS.filter((j) => j.topicId === topic.id).length;
            return (
              <li key={topic.id} className="flex">
                <Link
                  href={hasStudyPlan(topic.id) ? topicRoutes(topic.id).study() : topicRoutes(topic.id).island()}
                  className={`panel flex flex-1 flex-col overflow-hidden rounded-[24px] transition hover:-translate-y-0.5 ${isHere ? "ring-4 ring-brand" : ""}`}
                >
                  {/* D-052: the topic's world colour, so a child can tell the worlds apart at a glance. */}
                  <span className={`flex items-center gap-3 px-4 py-3 sm:px-5 ${(WORLD_FIELD[topic.world] ?? FIELDS.blue).bg} ${(WORLD_FIELD[topic.world] ?? FIELDS.blue).text}`}>
                    <span className="relative grid size-14 shrink-0 place-items-center rounded-full bg-surface" aria-hidden>
                      <PaperIcon name={topic.look.icon} size={38} />
                      {finished && (
                        <span className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full bg-ok-bright text-white ring-2 ring-white">
                          <CheckIcon size={12} strokeWidth={3} />
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-title font-extrabold leading-snug">{topic.title}</span>
                      <span className="block text-label font-bold">{yearsText(topic.years)}</span>
                    </span>
                    <ArrowRightIcon size={22} className="shrink-0" />
                  </span>
                  <span className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
                    <span className="block text-label text-ink-2">{topic.subtitle}</span>
                  <span className="mt-auto block space-y-2">
                    <TopicBar o={o} label={topic.title} />
                    <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-label font-semibold text-ink-2">
                      <span>
                        {o.mastered} of {o.skills} skills mastered
                      </span>
                      <span>
                        {o.lessonsDone} of {o.lessons} lessons
                      </span>
                    </span>
                    {(isHere || journeys > 0) && (
                      <span className="flex flex-wrap gap-2">
                        {isHere && <span className="rounded-full bg-brand-soft px-3 py-0.5 text-label font-bold text-brand-strong">You are here</span>}
                        {journeys > 0 && <span className="rounded-full bg-sun-soft px-3 py-0.5 text-label font-bold text-ink">Learn with Emma</span>}
                      </span>
                    )}
                  </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
