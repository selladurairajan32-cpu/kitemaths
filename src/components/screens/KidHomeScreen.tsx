"use client";

import { CountUp } from "@/components/explain/CountUp";
import { WORLD_FIELD, CYCLE, FIELDS } from "@/components/kid/fields";
import { Kip } from "@/components/kid/Kip";
import { kidNext } from "@/components/kid/kidText";
import { GoLink, Heading, Hero, Lift, Page, Pips, Pop } from "@/components/kid/Play";
import { RichText } from "@/components/math/RichText";
import { PaperIcon } from "@/components/paper/PaperIcon";
import { Pic } from "@/components/paper/Pic";
import { ProgressRing } from "@/components/ui/Progress";
import { ScreenSkeleton, StorageNotice } from "@/components/ui/Screen";
import { recommendNext, reviewSkills } from "@/engine/journey";
import { DEFAULT_PLAN } from "@/engine/progress";
import { answeredToday, DAILY_GOAL, levelFor, streakFor, totalStars } from "@/engine/rewards";
import { CANVAS_LABEL, CANVAS_PHASES, canvasReached, JOURNEY_STAGES, STAGE_LABEL } from "@/engine/topicJourney";
import { routes, topicRoutes } from "@/lib/routes";
import { useHydrated, useLearner, useNow } from "@/lib/store";
import { topicById } from "@/topics";
import { ActiveTopicProvider } from "@/topics/ActiveTopic";
import { useTopicState } from "@/topics/context";
import { continueJourney, subTopicHref } from "@/topics/overview";
import { PLAN_KIND_LABEL, weeklyPlan } from "@/topics/plan";
import { WORLDS } from "@/topics/worlds";

/**
 * Home (D-064, the Playground look). A child sees three things, top to bottom: a hello, the ONE thing to do next (a big
 * card with a picture and the page's only yellow button), and how they are doing in three numbers. Under that, today's
 * plan as numbered cards and a door to all the topics. Nothing else.
 */

function greeting(now: number) {
  const h = new Date(now).getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export function KidHomeScreen() {
  const hydrated = useHydrated();
  if (!hydrated) return <ScreenSkeleton />;
  return (
    <ActiveTopicProvider>
      <KidHome />
    </ActiveTopicProvider>
  );
}

function KidHome() {
  const learner = useLearner();
  const { topic, learner: inTopic, links } = useTopicState();
  const now = useNow();
  const { skillById } = topic;

  // DEF-003: any lesson progress means the child has started, even before answering a question.
  // D-062: a lesson begun on the canvas also counts, so Home offers to continue it.
  const brandNew = inTopic.placement.status === "not-started" && learner.results.length === 0 && Object.keys(inTopic.lessons).length === 0 && !continueJourney(learner);
  // DEF-011: every island's warm-up is offered from home until it is done or skipped.
  const warmUpOpen = !brandNew && inTopic.placement.status === "not-started" && !!topic.placement;
  const rec = recommendNext(topic, inTopic);
  const next = kidNext(rec, topic);
  const stars = totalStars(learner);
  const level = levelFor(stars);
  const streak = streakFor(learner, now);
  const today = Math.min(answeredToday(learner, now), DAILY_GOAL);
  const review = reviewSkills(topic, inTopic);
  const name = learner.profile.name.trim();
  // FR-011 AC3: a lesson is done when it has independent evidence, not when its last page was reached.
  const nextIndex = rec.kind === "lesson" ? topic.lessons.findIndex((l) => l.id === rec.lessonId) : -1;
  // R1 (content audit): Home shows the next three unfinished lessons; the island map lists them all.
  // D-043 step 3: Continue Learning picks up the topic journey worked in last; with none open, the next step on the island.
  const cont = brandNew ? null : continueJourney(learner);
  const contTopic = cont ? topicById(cont.def.topicId) : undefined;
  // Today's plan: the first day of the weekly plan (PARENT-003), rebuilt from the evidence each time.
  const plan = brandNew ? null : weeklyPlan(learner, now, learner.settings.planDays ?? DEFAULT_PLAN.days, learner.settings.planMinutes ?? DEFAULT_PLAN.minutes)[0];
  // A lesson on the canvas has six steps; a journey in the earlier layout has five.
  const steps = cont ? (cont.def.canvas ? { count: CANVAS_PHASES.length, at: canvasReached(cont.progress), label: CANVAS_LABEL[CANVAS_PHASES[Math.min(canvasReached(cont.progress), CANVAS_PHASES.length - 1)]!] } : { count: JOURNEY_STAGES.length, at: cont.progress.reached, label: STAGE_LABEL[JOURNEY_STAGES[cont.progress.reached]!] }) : null;

  // Where the next thing opens, what it is called, and its picture.
  const nextLesson = rec.kind === "lesson" ? topic.lessons[nextIndex] : undefined;
  const go = brandNew
    ? { href: links.start(), label: "Play the warm-up", title: "Let's find your start!", line: `A quick warm-up game finds the right ${topic.title} lesson for you.` }
    : cont && steps
      ? { href: topicRoutes(cont.def.topicId).learn(cont.def.concept), label: "Continue", title: cont.def.title, line: `${contTopic?.title ?? cont.def.topicId} · Step ${steps.at + 1} of ${steps.count}: ${steps.label}` }
      : { href: nextLesson ? subTopicHref(topic.id, nextLesson.id, topic.skills.find((k) => k.lessonId === nextLesson.id)?.id) : next.href, label: next.cta, title: next.title, line: next.line };
  const nextIcon = cont ? (contTopic?.look.icon ?? "bulb") : next.icon;

  return (
    <Page>
      <StorageNotice />

      <Hero id="hello-title" tag={greeting(now)} title={<>Hi {name || "there"}!</>} line={streak.current > 1 ? `${streak.current} days in a row. Keep it going!` : "Ready for some maths?"} picture={<Kip mood="cheer" size={150} />} />

      {/* The one thing to do next: the only yellow button on the page. */}
      <Pop className="-mt-4 sm:-mt-6">
        <section aria-labelledby="next-title" className="flex flex-col gap-5 rounded-[var(--radius-hero)] border-4 border-ink bg-surface p-5 sm:flex-row sm:items-center sm:gap-7 sm:p-7">
          <span className="grid size-24 shrink-0 place-items-center rounded-[28px] bg-tile-yellow sm:size-32" aria-hidden>
            {brandNew ? <Pic name="rocket" size={84} /> : <PaperIcon name={nextIcon} size={84} />}
          </span>
          <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
            <p className="rounded-full bg-ink px-4 py-1 text-label font-extrabold text-white">{brandNew ? "Start here" : cont ? "Carry on" : "Next up"}</p>
            <h2 id="next-title" className="display text-heading-2 text-ink sm:text-heading-1">
              {go.title}
            </h2>
            <p className="text-body-lg text-ink-2">
              <RichText text={go.line} />
            </p>
            {cont && steps && <Pips count={steps.count} done={steps.at} label={`Your learning path: step ${steps.at + 1} of ${steps.count}`} />}
          </div>
          <GoLink href={go.href} className="w-full shrink-0 sm:w-auto">
            {go.label}
          </GoLink>
        </section>
      </Pop>

      {/* How I am doing: three numbers, each with a picture. */}
      <ul aria-label="Your numbers" className="m-0 grid list-none grid-cols-3 gap-3 p-0 sm:gap-5">
        {[
          { key: "level", tint: "bg-tile-blue", node: <ProgressRing value={level.into / level.needed} size={64} label={`Level ${level.level}`}><span className="display text-title leading-none text-ink">{level.level}</span></ProgressRing>, big: null as number | null, label: `Level ${level.level}`, small: level.title, href: routes.progress(), aria: `Level ${level.level}: ${stars} XP, ${level.needed - level.into} XP to level ${level.level + 1}. See your progress.` },
          { key: "streak", tint: "bg-tile-orange", node: <Pic name="flame" size={56} muted={streak.current === 0} />, big: streak.current, label: streak.current === 1 ? "day in a row" : "days in a row", small: `Best: ${streak.best}` },
          { key: "today", tint: "bg-tile-green", node: <Pic name="target" size={56} />, big: today, label: `of ${DAILY_GOAL} today`, small: today >= DAILY_GOAL ? "Goal done!" : "Your daily goal" },
        ].map((c, i) => {
          const inner = (
            <>
              <span className="shrink-0">{c.node}</span>
              <span className="min-w-0">
                <span className="display block text-heading-2 leading-tight text-ink">
                  {c.big !== null && <CountUp value={c.big} />} <span className="text-title">{c.label}</span>
                </span>
                <span className="hidden text-label font-bold text-ink-2 sm:block">{c.small}</span>
              </span>
            </>
          );
          const cls = `flex h-full flex-col items-center gap-2 rounded-[28px] p-4 text-center sm:flex-row sm:gap-4 sm:p-5 sm:text-left ${c.tint}`;
          return (
            <li key={c.key}>
              <Pop i={i + 1} className="h-full">
                {c.href ? (
                  <Lift href={c.href} aria-label={c.aria} className={cls}>
                    {inner}
                  </Lift>
                ) : (
                  <div className={cls}>{inner}</div>
                )}
              </Pop>
            </li>
          );
        })}
      </ul>

      {/* One nudge at most: a skill to look at again, else the warm-up. */}
      {(review.length > 0 || warmUpOpen) && (
        <Lift href={review.length > 0 ? links.practice(review[0]) : links.start()} className="flex items-center gap-4 rounded-[28px] bg-tile-pink p-4 sm:p-5">
          <Pic name={review.length > 0 ? "recheck" : "sparkles"} size={56} />
          <span className="min-w-0 flex-1">
            <span className="block text-title font-extrabold text-ink">{review.length > 0 ? <>Let&apos;s look again at {skillById(review[0]).title}</> : <>New to {topic.title}?</>}</span>
            <span className="block text-body text-ink-2">{review.length > 0 ? "A few quick questions will make it strong." : "A warm-up game finds where to start."}</span>
          </span>
          <span className="hidden shrink-0 rounded-full bg-surface px-5 py-2 text-body font-extrabold text-ink sm:block">{review.length > 0 ? "Practise it" : "Play the warm-up"}</span>
        </Lift>
      )}

      {/* Today's plan, from the weekly plan the grown-up sets (D-043 step 3). */}
      {plan && plan.items.length > 0 && (
        <section aria-labelledby="plan-title" className="flex flex-col gap-4">
          <Heading id="plan-title" picture={<Pic name="memo" size={40} />} side={<span className="text-body font-bold text-ink-2">About {plan.minutes} minutes</span>}>
            Today&apos;s plan
          </Heading>
          <ol className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {plan.items.map((it, i) => {
              const f = CYCLE[i % CYCLE.length]!;
              return (
                <li key={it.href + i} className="flex">
                  <Pop i={i} className="flex flex-1">
                    <Lift href={it.href} className={`flex flex-1 items-center gap-4 rounded-[28px] p-5 ${f.soft}`}>
                      <span className={`display grid size-14 shrink-0 place-items-center rounded-full text-heading-2 ${f.bg} ${f.text}`} aria-hidden>
                        {i + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-title font-extrabold leading-snug text-ink">{it.title}</span>
                        <span className="block text-body font-semibold text-ink-2">
                          {PLAN_KIND_LABEL[it.kind]} · {it.minutes} min
                        </span>
                      </span>
                    </Lift>
                  </Pop>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* The door to every topic: the six worlds as pictures. */}
      <Lift href={routes.topics()} aria-label="Explore all the topics" className={`flex flex-col items-start gap-5 rounded-[var(--radius-hero)] p-6 sm:flex-row sm:items-center sm:p-8 ${FIELDS.navy.bg} ${FIELDS.navy.text}`}>
        <span className="min-w-0 flex-1">
          <span className="display block text-heading-2 sm:text-heading-1">Explore all the topics</span>
          <span className="block text-body-lg font-semibold">Six worlds of maths. Pick any one you like.</span>
        </span>
        <span className="flex shrink-0 gap-2" aria-hidden>
          {WORLDS.map((w) => (
            <span key={w.id} className={`grid size-12 place-items-center rounded-full sm:size-14 ${(WORLD_FIELD[w.id] ?? FIELDS.blue).soft}`}>
              <PaperIcon name={w.icon} size={34} />
            </span>
          ))}
        </span>
      </Lift>

      <footer>
        <p className="text-label text-muted">3D pictures: Microsoft Fluent Emoji, MIT licence.</p>
      </footer>
    </Page>
  );
}
