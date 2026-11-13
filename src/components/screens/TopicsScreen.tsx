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
        eyebrow="Learn"
        title={<>All your <span className="text-field-blue">topics</span></>}
        line={`${all.length} topics to explore. You have started ${started}. Pick one to see its lessons, or carry on where you are.`}
      >
        <Link href={routes.journey()} className="inline-flex min-h-11 items-center gap-1.5 text-lg font-bold text-brand-strong underline underline-offset-4">
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
                  className={`panel flex flex-1 flex-col gap-4 rounded-[28px] p-5 transition hover:-translate-y-0.5 ${isHere ? "border-brand" : ""}`}
                >
                  {/* D-057: the reference site's course card: title first, a picture panel, then the facts in rows. */}
                  <span className="flex items-start justify-between gap-3">
                    <span className="display block text-heading-2 leading-tight text-ink">{topic.title}</span>
                    <span className={`shrink-0 rounded-full px-3 py-0.5 text-label font-extrabold ${(WORLD_FIELD[topic.world] ?? FIELDS.blue).bg} ${(WORLD_FIELD[topic.world] ?? FIELDS.blue).text}`}>{yearsText(topic.years)}</span>
                  </span>
                  <span className={`paper-grid relative grid h-36 place-items-center rounded-[22px] ${(WORLD_FIELD[topic.world] ?? FIELDS.blue).soft}`} aria-hidden>
                    <span className="grid size-24 place-items-center rounded-full bg-surface">
                      <PaperIcon name={topic.look.icon} size={64} />
                    </span>
                    {finished && (
                      <span className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-ok-bright text-white">
                        <CheckIcon size={16} strokeWidth={3} />
                      </span>
                    )}
                  </span>
                  <span className="block text-body text-ink-2">{topic.subtitle}</span>
                  <span className="mt-auto block space-y-2">
                    <TopicBar o={o} label={topic.title} />
                    <span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-label font-semibold text-ink-2">
                      <span>
                        <b className="text-ink">{o.mastered}</b> of {o.skills} skills mastered
                      </span>
                      <span>
                        <b className="text-ink">{o.lessonsDone}</b> of {o.lessons} lessons
                      </span>
                    </span>
                    {(isHere || journeys > 0 || hasStudyPlan(topic.id)) && (
                      <span className="flex flex-wrap gap-2">
                        {isHere && <span className="rounded-full bg-brand-soft px-3 py-0.5 text-label font-bold text-brand-strong">You are here</span>}
                        {hasStudyPlan(topic.id) && <span className="rounded-full bg-field-navy px-3 py-0.5 text-label font-bold text-white">New: 11+ and GCSE</span>}
                        {journeys > 0 && <span className="rounded-full bg-sun-soft px-3 py-0.5 text-label font-bold text-ink">Learn with Emma</span>}
                      </span>
                    )}
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
