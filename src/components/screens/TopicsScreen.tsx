"use client";

import Link from "next/link";
import { useState } from "react";
import { TopicBar, yearsText } from "@/components/kid/Overview";
import { Column, PageTitle, Row, Rows, Section } from "@/components/kid/Plain";
import { PaperIcon } from "@/components/paper/PaperIcon";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { routes, topicRoutes } from "@/lib/routes";
import { useHydrated, useLearner } from "@/lib/store";
import { topicOverviews } from "@/topics/overview";
import { activeTopic } from "@/topics/recommend";
import { WORLDS } from "@/topics/worlds";

/**
 * D-043 step 3: every topic, with progress. Filter by world or by the child's school year; each row opens the topic's
 * page and says how far the child has got (skills from MAST-001, lessons from CUR-002 evidence). D-062: one plain list
 * per world, a row per topic, so all the topics can be seen without a long scroll.
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
    `flex min-h-11 items-center whitespace-nowrap rounded-full px-4 text-label font-bold transition-colors ${active ? "bg-ink text-white" : "bg-sunk text-ink-2 hover:bg-line"}`;

  return (
    <Column>
      <PageTitle id="topics-title" title="Topics" line={`${all.length} topics. You have started ${started}. Pick one to see its sub-topics.`}>
        <div className="mt-3 flex flex-col gap-2">
          <div role="group" aria-label="Show topics from" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
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
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 self-start text-label font-bold text-ink-2">
              <input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} className="size-5 accent-brand" />
              Only Year {year} topics
            </label>
          )}
        </div>
      </PageTitle>

      {shown.length === 0 ? (
        <p className="rounded-[24px] bg-sunk p-6 text-body text-ink-2">No topics here for Year {year}. Untick &ldquo;Only Year {year} topics&rdquo; to see them all.</p>
      ) : (
        WORLDS.map((w) => {
          const mine = shown.filter(({ topic }) => topic.world === w.id);
          if (mine.length === 0) return null;
          return (
            <Section key={w.id} id={`world-${w.id}`} title={w.title}>
              <Rows label={`${w.title} topics`}>
                {mine.map(({ topic, o }) => {
                  const isHere = topic.id === here;
                  const finished = o.skills > 0 && o.mastered === o.skills;
                  return (
                    <Row
                      key={topic.id}
                      href={topicRoutes(topic.id).island()}
                      mark={finished ? { kind: "done" } : { kind: "pic", node: <PaperIcon name={topic.look.icon} size={28} /> }}
                      current={isHere}
                      title={
                        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                          {topic.title}
                          {isHere && <span className="rounded-full bg-ink px-2.5 py-0.5 text-label font-bold text-white">You are here</span>}
                        </span>
                      }
                      line={
                        <span className="flex flex-col gap-1.5">
                          <span>
                            {yearsText(topic.years)} · {o.lessonsDone} of {o.lessons} lessons · {o.mastered} of {o.skills} skills mastered
                          </span>
                          {o.started && (
                            <span className="block max-w-xs">
                              <TopicBar o={o} label={topic.title} />
                            </span>
                          )}
                          {!o.started && (
                            <span className="sr-only">
                              <TopicBar o={o} label={topic.title} />
                            </span>
                          )}
                        </span>
                      }
                    />
                  );
                })}
              </Rows>
            </Section>
          );
        })
      )}

      <Link href={routes.journey()} className="inline-flex min-h-11 items-center gap-1.5 self-start text-body font-bold text-brand-strong underline underline-offset-4">
        See them on the world map <ArrowRightIcon size={18} />
      </Link>
    </Column>
  );
}
