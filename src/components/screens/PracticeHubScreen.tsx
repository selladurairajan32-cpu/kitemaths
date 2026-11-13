"use client";

import Link from "next/link";
import { ScreenHero } from "@/components/kid/ScreenHero";
import { TopicBar } from "@/components/kid/Overview";
import { PaperIcon } from "@/components/paper/PaperIcon";
import { Pic, type PicName } from "@/components/paper/Pic";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { reviewSkills } from "@/engine/journey";
import { topicLearner } from "@/engine/progress";
import { answeredToday, DAILY_GOAL } from "@/engine/rewards";
import { routes, topicRoutes } from "@/lib/routes";
import { useHydrated, useLearner, useNow } from "@/lib/store";
import { topicById } from "@/topics";
import { topicOverviews } from "@/topics/overview";
import { activeTopic } from "@/topics/recommend";
import { FIELDS } from "@/components/kid/fields";

/**
 * D-043 step 3: the Practice tab. Before, `/practice` went straight into the current island's practice (DEF-014); now it
 * offers that first, with one button, then skills to look at again, quick practice and every started topic.
 */
export function PracticeHubScreen() {
  const hydrated = useHydrated();
  const learner = useLearner();
  const now = useNow();
  if (!hydrated) return <ScreenSkeleton />;
  const active = activeTopic(learner);
  const resuming = !!learner.topics[active.id]?.practice.active;
  const all = topicOverviews(learner);
  const mine = all.filter(({ topic, o }) => o.started || topic.id === active.id);
  const review = mine.flatMap(({ topic }) => reviewSkills(topic, topicLearner(learner, topic.id)).map((skill) => ({ topic, skill })));
  const today = Math.min(answeredToday(learner, now), DAILY_GOAL);

  const quick: { id: string; title: string; line: string; pic: PicName; href: string }[] = [];
  if (topicById("times-tables")) quick.push({ id: "times-tables", title: "Times-table facts", line: "Quick facts, a few at a time", pic: "times", href: topicRoutes("times-tables").factsRun("practice") });
  if (topicById("mental-maths")) quick.push({ id: "mental-maths", title: "Mental maths", line: "Clever ways to work it out in your head", pic: "bulb", href: topicRoutes("mental-maths").practice() });
  if (topicById("problem-solving")) quick.push({ id: "problem-solving", title: "Problem solving", line: "Word problems with more than one step", pic: "puzzle", href: topicRoutes("problem-solving").practice() });

  return (
    <div className="space-y-10">
      <ScreenHero pic="target" field={FIELDS.green} titleId="practice-title" eyebrow="Get stronger" title={<>Time to <span className="text-field-green">practise</span></>} line={`${today} of ${DAILY_GOAL} questions done today. Practice makes each skill stronger, and it counts towards mastery.`}>
        <ButtonLink href={topicRoutes(active.id).practice()} variant="cta" size="xl">
          {resuming ? "Carry on" : "Practise"} {active.title} <ArrowRightIcon size={20} />
        </ButtonLink>
      </ScreenHero>

      {review.length > 0 && (
        <section aria-labelledby="review-title">
          <h2 id="review-title" className="display text-heading-2">
            Look at again
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {review.map(({ topic, skill }) => (
              <li key={skill} className="flex">
                <Link href={topicRoutes(topic.id).practice(skill)} className="panel rounded-[24px] flex flex-1 items-center justify-between gap-3 p-4 hover:-translate-y-0.5">
                  <span className="min-w-0">
                    <span className="block font-extrabold text-ink">{topic.skillById(skill).title}</span>
                    <span className="block text-label font-semibold text-ink-2">{topic.title}</span>
                  </span>
                  <ArrowRightIcon size={20} className="shrink-0 text-brand-strong" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {quick.length > 0 && (
        <section aria-labelledby="quick-title">
          <h2 id="quick-title" className="display text-heading-2">
            Quick practice
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {quick.map((q) => (
              <li key={q.id} className="flex">
                <Link href={q.href} className="panel rounded-[24px] flex flex-1 items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
                  <span className="grid size-14 shrink-0 place-items-center rounded-[18px] bg-tile-green" aria-hidden>
                    <Pic name={q.pic} size={40} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-extrabold leading-snug text-ink">{q.title}</span>
                    <span className="block text-label text-ink-2">{q.line}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="mine-title">
        <h2 id="mine-title" className="display text-heading-2">
          Your topics
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {mine.map(({ topic, o }) => (
            <li key={topic.id} className="flex">
              <Link href={topicRoutes(topic.id).practice()} className="panel rounded-[24px] flex flex-1 flex-col gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
                <span className="flex items-center gap-3">
                  <span className="grid size-12 shrink-0 place-items-center rounded-[16px] bg-tile-blue" aria-hidden>
                    <PaperIcon name={topic.look.icon} size={34} />
                  </span>
                  <span className="block font-extrabold leading-snug text-ink">Practise {topic.title}</span>
                </span>
                <TopicBar o={o} label={topic.title} />
                <span className="text-label font-semibold text-ink-2">
                  {o.mastered} of {o.skills} skills mastered
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href={routes.topics()} className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-lg font-bold text-brand-strong underline underline-offset-4">
          Practise another topic <ArrowRightIcon size={18} />
        </Link>
      </section>
    </div>
  );
}
