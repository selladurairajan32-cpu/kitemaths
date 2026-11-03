"use client";

import Link from "next/link";
import { ScreenHero } from "@/components/kid/ScreenHero";
import { PaperIcon } from "@/components/paper/PaperIcon";
import { CheckIcon, LockIcon } from "@/components/ui/Icons";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { lessonsCompleted, recommendNext } from "@/engine/journey";
import { topicLearner } from "@/engine/progress";
import { topicRoutes } from "@/lib/routes";
import { useHydrated, useLearner } from "@/lib/store";
import { topicById } from "@/topics";
import { activeTopic } from "@/topics/recommend";
import { WORLDS } from "@/topics/worlds";

/** Each world gets its own soft panel colour, in turn. */
const PANELS = ["bg-[#eef4ff]", "bg-[#e9f8f1]", "bg-[#fff4e6]", "bg-[#fdeef4]", "bg-[#e8f7fd]", "bg-[#fff8dc]"];
const TILES = ["bg-tile-blue", "bg-tile-green", "bg-tile-orange", "bg-tile-pink", "bg-tile-sky", "bg-tile-yellow"];

/** Every world and island. Playable islands show progress; the rest are on their way. */
export function WorldMapScreen() {
  const hydrated = useHydrated();
  const learner = useLearner();
  if (!hydrated) return <ScreenSkeleton />;
  const here = activeTopic(learner).id;
  const open = WORLDS.flatMap((w) => w.islands).filter((i) => i.topicId && topicById(i.topicId)).length;
  const all = WORLDS.flatMap((w) => w.islands).length;

  return (
    <div className="space-y-10">
      <ScreenHero kip="happy" titleId="map-title" title="World map" line={open === all ? `Fly from island to island. All ${all} islands are open: pick one and go!` : `Fly from island to island. ${open} of ${all} islands are open, and more are on their way.`} />

      <ol className="space-y-6">
        {WORLDS.map((world, wi) => {
          const playable = world.islands.filter((i) => i.topicId && topicById(i.topicId)).length;
          return (
            <li key={world.id} className={`rounded-[32px] px-4 py-6 sm:px-8 sm:py-8 ${PANELS[wi % PANELS.length]}`} aria-labelledby={`world-${world.id}`}>
              <div className="mb-5 flex items-center gap-4">
                <span className="grid size-16 shrink-0 place-items-center rounded-[22px] bg-surface shadow-[var(--shadow-card)]" aria-hidden>
                  <PaperIcon name={world.icon} size={46} />
                </span>
                <div>
                  <h2 id={`world-${world.id}`} className="display text-[1.5rem] sm:text-[1.875rem]">
                    {world.title}
                  </h2>
                  <p className="text-[0.9375rem] font-semibold text-muted">
                    {playable ? `${playable} of ${world.islands.length} islands open` : `${world.islands.length} islands, opening soon`}
                  </p>
                </div>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {world.islands.map((island, ii) => {
                  const topic = island.topicId ? topicById(island.topicId) : undefined;
                  if (!topic) {
                    return (
                      <li key={island.title} className="flex items-center gap-3 rounded-[22px] border border-dashed border-line-strong bg-surface/70 p-3.5">
                        <span className="grid size-14 shrink-0 place-items-center rounded-[18px] bg-sunk" aria-hidden>
                          <PaperIcon name={island.icon} size={38} muted />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-bold leading-snug text-ink-2">{island.title}</span>
                          <span className="mt-0.5 inline-flex items-center gap-1 text-[0.9375rem] font-semibold text-muted">
                            <LockIcon size={14} /> Opens soon
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
                        className={`relative flex items-center gap-3 rounded-[22px] border bg-surface p-3.5 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] ${
                          isHere ? "border-2 border-brand" : "border-line"
                        }`}
                      >
                        <span className={`relative grid size-14 shrink-0 place-items-center rounded-[18px] ${TILES[(wi + ii) % TILES.length]}`} aria-hidden>
                          <PaperIcon name={topic.look.icon} size={40} />
                          {finished && (
                            <span className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full bg-ok-bright text-white ring-2 ring-white">
                              <CheckIcon size={12} strokeWidth={3} />
                            </span>
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-extrabold leading-snug text-ink">{island.title}</span>
                          <span className="block text-[0.9375rem] font-semibold text-muted">
                            {done} of {topic.lessons.length} lessons
                          </span>
                          {isHere && <span className="text-[0.9375rem] font-bold text-brand-strong">You are here</span>}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
