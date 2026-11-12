"use client";

import Link from "next/link";
import { MasteryKey, MasteryRing, TopicBar } from "@/components/kid/Overview";
import { PaperIcon } from "@/components/paper/PaperIcon";
import { Pic } from "@/components/paper/Pic";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { badgesFor, levelFor, streakFor, totalStars } from "@/engine/rewards";
import { routes, topicRoutes } from "@/lib/routes";
import { useHydrated, useLearner, useNow } from "@/lib/store";
import { TOPICS } from "@/topics";
import { ringSummary, topicOverviews } from "@/topics/overview";
import { activeTopic, startedTopics } from "@/topics/recommend";

/**
 * D-043 step 3: how the child is doing. A mastery ring over the topics they have started (MAST-001 statuses, no new
 * thresholds), their level and streak, and one bar per topic.
 */
export function ProgressScreen() {
  const hydrated = useHydrated();
  const learner = useLearner();
  const now = useNow();
  if (!hydrated) return <ScreenSkeleton />;
  const all = topicOverviews(learner);
  const ring = ringSummary(learner, all);
  const here = activeTopic(learner).id;
  const mine = all.filter(({ topic, o }) => o.started || topic.id === here);
  const notYet = all.length - mine.length;
  const stars = totalStars(learner);
  const level = levelFor(stars);
  const streak = streakFor(learner, now);
  const lessonCount = TOPICS.reduce((n, t) => n + t.lessons.length, 0);
  const badges = badgesFor(learner, startedTopics(learner).flatMap((t) => t.skills), lessonCount, now);
  const won = badges.filter((b) => b.earned).length;
  const name = learner.profile.name.trim();

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-line bg-brand-soft px-5 py-7 sm:px-10 sm:py-10" aria-labelledby="progress-title">
        <div className="flex flex-col items-center gap-8 sm:flex-row">
          <MasteryRing s={ring} />
          <div className="min-w-0 flex-1">
            <h1 id="progress-title" className="display text-heading-1 sm:text-display-2">
              {name ? `${name}'s progress` : "Your progress"}
            </h1>
            <p className="mt-2 max-w-xl text-lg text-ink-2">
              {ring.mastered} of {ring.skills} skills mastered in your {mine.length === 1 ? "topic" : `${mine.length} topics`}. A skill is mastered when you get it right in practice and then in a check.
            </p>
            <div className="mt-4">
              <MasteryKey s={ring} />
            </div>
          </div>
        </div>
      </section>

      <section aria-label="XP, level and streak">
        <ul className="grid gap-3 sm:grid-cols-3">
          <li className="card flex items-center gap-3 p-4">
            <Pic name="star" size={40} />
            <span className="min-w-0 flex-1">
              <span className="block text-title font-extrabold text-ink">
                Level {level.level} · {level.title}
              </span>
              <span className="mt-1 block h-2 overflow-hidden rounded-full bg-sunk" aria-hidden>
                <span className="block h-full rounded-full bg-sun-strong" style={{ width: `${Math.round((level.into / level.needed) * 100)}%` }} />
              </span>
              <span className="mt-1 block text-label font-semibold text-ink-2">
                {stars} XP · {level.needed - level.into} more to level {level.level + 1}
              </span>
            </span>
          </li>
          <li className="card flex items-center gap-3 p-4">
            <Pic name="flame" size={40} muted={!streak.activeToday} />
            <span>
              <span className="block text-title font-extrabold text-ink">
                {streak.current} {streak.current === 1 ? "day" : "days"} in a row
              </span>
              <span className="block text-label font-semibold text-ink-2">Best: {streak.best} {streak.best === 1 ? "day" : "days"}</span>
            </span>
          </li>
          <li className="flex">
            <Link href={routes.badges()} className="card flex flex-1 items-center gap-3 p-4 hover:bg-raised">
              <Pic name="medal" size={40} />
              <span className="min-w-0 flex-1">
                <span className="block text-title font-extrabold text-ink">
                  {won} of {badges.length} badges
                </span>
                <span className="block text-label font-semibold text-brand-strong underline underline-offset-4">See your badges</span>
              </span>
            </Link>
          </li>
        </ul>
      </section>

      <section aria-labelledby="bars-title">
        <h2 id="bars-title" className="display text-heading-2">
          Your topics
        </h2>
        <ul className="mt-4 space-y-3">
          {mine.map(({ topic, o }) => (
            <li key={topic.id}>
              <Link href={topicRoutes(topic.id).island()} className="card grid grid-cols-[3.5rem_1fr] items-center gap-x-4 gap-y-2 p-4 hover:bg-raised sm:grid-cols-[3.5rem_14rem_1fr]">
                <span className="grid size-14 place-items-center rounded-[18px] bg-tile-blue" aria-hidden>
                  <PaperIcon name={topic.look.icon} size={38} />
                </span>
                <span className="min-w-0">
                  <span className="block font-extrabold leading-snug text-ink">{topic.title}</span>
                  <span className="block text-label font-semibold text-ink-2">
                    {o.mastered} of {o.skills} skills · {o.lessonsDone} of {o.lessons} lessons
                  </span>
                </span>
                <span className="col-span-2 sm:col-span-1">
                  <TopicBar o={o} label={topic.title} />
                  {o.needsReview > 0 && <span className="mt-1 block text-label font-bold text-num-strong">{o.needsReview === 1 ? "1 skill" : `${o.needsReview} skills`} to look at again</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {notYet > 0 && (
          <Link href={routes.topics()} className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-lg font-bold text-brand-strong underline underline-offset-4">
            {notYet} more topics to start <ArrowRightIcon size={18} />
          </Link>
        )}
      </section>
    </div>
  );
}
