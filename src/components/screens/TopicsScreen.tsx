"use client";

import { useState } from "react";
import { FIELDS, WORLD_FIELD } from "@/components/kid/fields";
import { TopicBar, yearsText } from "@/components/kid/Overview";
import { Heading, Hero, Lift, Page, Pop } from "@/components/kid/Play";
import { Pic } from "@/components/paper/Pic";
import { PaperIcon } from "@/components/paper/PaperIcon";
import { CheckIcon } from "@/components/ui/Icons";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { topicRoutes } from "@/lib/routes";
import { useHydrated, useLearner } from "@/lib/store";
import { topicOverviews } from "@/topics/overview";
import { activeTopic } from "@/topics/recommend";
import { WORLDS } from "@/topics/worlds";

/**
 * Topics (D-064, the Playground look): every topic as a picture tile, grouped into its world. Each world has its own
 * colour, so a child finds "the orange ones" again. A tile says one thing in words (the topic's name) and shows how far
 * the child has got as a bar (skills from MAST-001). Filter by world, or by the child's school year.
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

  return (
    <Page>
      <Hero id="topics-title" field={FIELDS.teal} title="Pick a topic" line={started > 0 ? `You have started ${started} of ${all.length}. Carry on, or try a new one.` : `${all.length} topics in six worlds. Start anywhere you like.`} picture={<Pic name="map" size={140} />} />

      <div className="flex flex-col gap-2">
        <div role="group" aria-label="Show topics from" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <button type="button" aria-pressed={world === "all"} onClick={() => setWorld("all")} className={`press flex min-h-12 items-center whitespace-nowrap rounded-full border-2 px-5 text-body font-extrabold ${world === "all" ? "border-ink bg-ink text-white" : "border-line-strong bg-surface text-ink hover:bg-raised"}`}>
            All topics
          </button>
          {WORLDS.map((w) => {
            const f = WORLD_FIELD[w.id] ?? FIELDS.blue;
            const on = world === w.id;
            return (
              <button key={w.id} type="button" aria-pressed={on} onClick={() => setWorld(w.id)} className={`press flex min-h-12 items-center gap-2 whitespace-nowrap rounded-full border-2 py-1 pl-2 pr-5 text-body font-extrabold ${on ? `border-transparent ${f.bg} ${f.text}` : "border-line-strong bg-surface text-ink hover:bg-raised"}`}>
                <span className={`grid size-9 place-items-center rounded-full ${on ? "bg-surface" : f.soft}`} aria-hidden>
                  <PaperIcon name={w.icon} size={24} />
                </span>
                {w.title}
              </button>
            );
          })}
        </div>
        {year !== null && (
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 self-start text-body font-bold text-ink-2">
            <input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} className="size-6 accent-brand" />
            Only Year {year} topics
          </label>
        )}
      </div>

      {shown.length === 0 ? (
        <p className="rounded-[28px] bg-sunk p-6 text-body-lg text-ink-2">No topics here for Year {year}. Untick &ldquo;Only Year {year} topics&rdquo; to see them all.</p>
      ) : (
        WORLDS.map((w) => {
          const mine = shown.filter(({ topic }) => topic.world === w.id);
          if (mine.length === 0) return null;
          const f = WORLD_FIELD[w.id] ?? FIELDS.blue;
          return (
            <section key={w.id} aria-labelledby={`world-${w.id}`} className="flex flex-col gap-4">
              <Heading id={`world-${w.id}`} picture={<span className={`grid size-12 place-items-center rounded-full ${f.soft}`} aria-hidden><PaperIcon name={w.icon} size={32} /></span>}>
                {w.title}
              </Heading>
              <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:gap-5 lg:grid-cols-4" aria-label={`${w.title} topics`}>
                {mine.map(({ topic, o }, i) => {
                  const isHere = topic.id === here;
                  const finished = o.skills > 0 && o.mastered === o.skills;
                  return (
                    <li key={topic.id} className="flex">
                      <Pop i={i} className="flex flex-1">
                        <Lift href={topicRoutes(topic.id).island()} className={`relative flex flex-1 flex-col overflow-hidden rounded-[28px] border-4 bg-surface ${isHere ? "border-ink" : "border-transparent ring-2 ring-line"}`}>
                          <span className={`relative grid h-28 place-items-center sm:h-32 ${f.soft}`} aria-hidden>
                            <PaperIcon name={topic.look.icon} size={76} />
                            {finished && (
                              <span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-ok-bright text-white">
                                <CheckIcon size={18} strokeWidth={3.5} />
                              </span>
                            )}
                          </span>
                          {isHere && <span className="absolute left-3 top-3 rounded-full bg-field-yellow px-3 py-0.5 text-label font-extrabold text-ink">You are here</span>}
                          <span className="flex flex-1 flex-col gap-2 p-4">
                            <span className="display block text-title leading-tight text-ink">{topic.title}</span>
                            <span className="mt-auto block">
                              <TopicBar o={o} label={topic.title} />
                            </span>
                            <span className="block text-label font-bold text-ink-2">
                              {o.started ? `${o.lessonsDone} of ${o.lessons} lessons done` : yearsText(topic.years)}
                            </span>
                          </span>
                        </Lift>
                      </Pop>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })
      )}
    </Page>
  );
}
