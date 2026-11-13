"use client";

import Link from "next/link";
import { kidNext } from "@/components/kid/kidText";
import { Column, NextStep, PageTitle, Row, Rows, Section, Steps } from "@/components/kid/Plain";
import { RichText } from "@/components/math/RichText";
import { PaperIcon } from "@/components/paper/PaperIcon";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { ScreenSkeleton, StorageNotice } from "@/components/ui/Screen";
import { allLessonEvidence } from "@/engine/evidence";
import { lessonsEvidenced, recommendNext, reviewSkills } from "@/engine/journey";
import { journeyDone } from "@/engine/overview";
import { DEFAULT_PLAN } from "@/engine/progress";
import { answeredToday, DAILY_GOAL, levelFor, STARS, streakFor, totalStars } from "@/engine/rewards";
import { CANVAS_LABEL, CANVAS_PHASES, canvasReached, JOURNEY_STAGES, STAGE_LABEL } from "@/engine/topicJourney";
import { routes, topicRoutes } from "@/lib/routes";
import { useHydrated, useLearner, useNow } from "@/lib/store";
import { topicById } from "@/topics";
import { ActiveTopicProvider } from "@/topics/ActiveTopic";
import { useTopicState } from "@/topics/context";
import { continueJourney, journeyCards, subTopicHref } from "@/topics/overview";
import { PLAN_KIND_LABEL, weeklyPlan } from "@/topics/plan";

/**
 * Home (D-043 step 3). D-062: in the plain language of the lesson canvas. The first thing on the page is the one thing
 * to do next, with the only yellow button. Under it, in quiet rows: today's plan, the hands-on lessons, and what is
 * next in the child's topic. The child's numbers are one line, not four tiles.
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
  const done = lessonsEvidenced(topic, inTopic);
  const evidence = new Map(allLessonEvidence(topic, inTopic).map((e) => [e.lessonId, e]));
  const nextIndex = rec.kind === "lesson" ? topic.lessons.findIndex((l) => l.id === rec.lessonId) : -1;
  // R1 (content audit): Home shows the next three unfinished lessons; the island map lists them all.
  // D-043 step 3: Continue Learning picks up the topic journey worked in last; with none open, the next step on the island.
  const cont = brandNew ? null : continueJourney(learner);
  const contTopic = cont ? topicById(cont.def.topicId) : undefined;
  // Today's plan: the first day of the weekly plan (PARENT-003), rebuilt from the evidence each time.
  const plan = brandNew ? null : weeklyPlan(learner, now, learner.settings.planDays ?? DEFAULT_PLAN.days, learner.settings.planMinutes ?? DEFAULT_PLAN.minutes)[0];
  // D-062: the lessons taught on the canvas, apart from the one Continue already offers; the film journeys are reached from their topic's page.
  const journeys = journeyCards(learner).filter(({ def }) => def.canvas && def !== cont?.def);
  // A lesson on the canvas has six steps; a journey in the earlier layout has five.
  const steps = cont ? (cont.def.canvas ? { count: CANVAS_PHASES.length, at: canvasReached(cont.progress), label: CANVAS_LABEL[CANVAS_PHASES[Math.min(canvasReached(cont.progress), CANVAS_PHASES.length - 1)]!] } : { count: JOURNEY_STAGES.length, at: cont.progress.reached, label: STAGE_LABEL[JOURNEY_STAGES[cont.progress.reached]!] }) : null;
  const upcoming = topic.lessons.map((l, i) => ({ l, i })).filter(({ l }) => evidence.get(l.id)!.status !== "evidenced").slice(0, 3);

  return (
    <Column>
      <StorageNotice />

      <PageTitle
        id="hello-title"
        eyebrow={greeting(now)}
        title={<>Hi {name || "there"}!</>}
        line={
          <>
            {streak.current > 0 ? `You're on a ${streak.current}-day streak. ` : "Let's build your maths today. "}
            {!brandNew && `${today} of ${DAILY_GOAL} questions done today.`}
          </>
        }
      />

      {/* The one thing to do next, with the one yellow button (D-037, D-043 step 3). */}
      <NextStep
        id="next-title"
        label={brandNew ? "Start here" : cont ? "Continue learning" : next.kicker}
        title={brandNew ? <>I&apos;m Kip. Let&apos;s find your start!</> : cont ? cont.def.title : next.title}
        line={
          brandNew ? (
            <>A short warm-up game finds the right {topic.title} lesson for you.</>
          ) : cont && steps ? (
            <>
              {contTopic?.title ?? cont.def.topicId} · Step {steps.at + 1} of {steps.count}: {steps.label}
            </>
          ) : (
            <RichText text={next.line} />
          )
        }
        action={
          <>
            <ButtonLink href={brandNew ? links.start() : cont ? topicRoutes(cont.def.topicId).learn(cont.def.concept) : next.href} variant="cta" size="xl" className="w-full sm:w-auto">
              {brandNew ? "Play the warm-up" : cont ? "Continue" : next.cta} <ArrowRightIcon size={20} />
            </ButtonLink>
            {!brandNew && !cont && nextIndex >= 0 && (
              <span className="text-body font-semibold text-ink-2">
                Lesson {nextIndex + 1} of {topic.lessons.length} · about {topic.lessons[nextIndex].minutes} minutes
              </span>
            )}
          </>
        }
      >
        {cont && steps && <Steps count={steps.count} done={steps.at} label={`Your learning path: step ${steps.at + 1} of ${steps.count}`} />}
      </NextStep>

      <ul aria-label="Your numbers" className="m-0 flex list-none flex-wrap gap-x-8 gap-y-3 border-y border-line p-0 py-4">
        {[
          { n: `${level.level}`, label: `Level · ${level.title}`, href: routes.progress(), aria: `Level ${level.level}: ${stars} XP, ${level.needed - level.into} XP to level ${level.level + 1}. See your progress.` },
          { n: `${stars}`, label: "XP earned" },
          { n: `${streak.current}`, label: streak.current === 1 ? "Day in a row" : "Days in a row" },
          { n: `${today}/${DAILY_GOAL}`, label: "Questions today" },
        ].map((c) => {
          const inner = (
            <>
              <span className="display text-heading-2 leading-none text-ink">{c.n}</span>
              <span className="text-label font-bold text-ink-2">{c.label}</span>
            </>
          );
          return (
            <li key={c.label}>
              {c.href ? (
                <Link href={c.href} aria-label={c.aria} className="flex min-h-11 items-baseline gap-2 underline-offset-4 hover:underline">
                  {inner}
                </Link>
              ) : (
                <span className="flex min-h-11 items-baseline gap-2">{inner}</span>
              )}
            </li>
          );
        })}
      </ul>

      {/* One nudge at most: a skill to revisit, else the warm-up. */}
      {(review.length > 0 || warmUpOpen) && (
        <Rows>
          {review.length > 0 ? (
            <Row href={links.practice(review[0])} mark={{ kind: "pic", node: <PaperIcon name="target" size={26} /> }} title={<>Let&apos;s revisit {skillById(review[0]).title}</>} line="A few questions on just this skill." trail="Practise it" />
          ) : (
            <Row href={links.start()} mark={{ kind: "pic", node: <PaperIcon name="bulb" size={26} /> }} title={`New to ${topic.title}?`} line="A warm-up finds where to start." trail="Play the warm-up" />
          )}
        </Rows>
      )}

      {/* D-043 step 3: today's plan, from the weekly plan the grown-up sets. */}
      {plan && plan.items.length > 0 && (
        <Section id="plan-title" title="Today's plan" line={`About ${plan.minutes} minutes, one step at a time`}>
          <Rows ordered>
            {plan.items.map((it, i) => (
              <Row key={it.href + i} href={it.href} mark={{ kind: "number", n: i + 1 }} title={it.title} line={`${PLAN_KIND_LABEL[it.kind]} · ${it.minutes} min`} />
            ))}
          </Rows>
        </Section>
      )}

      {/* D-060: the lessons taught on the canvas. */}
      {!brandNew && journeys.length > 0 && (
        <Section id="learn-title" title="Hands-on lessons" line="Guess, try it with your hands, then see why it works">
          <Rows>
            {journeys.map(({ def, progress }) => {
              const finished = !!progress && journeyDone(progress);
              const at = progress ? canvasReached(progress) : 0;
              return (
                <Row
                  key={`${def.topicId}/${def.concept}`}
                  href={topicRoutes(def.topicId).learn(def.concept)}
                  mark={finished ? { kind: "done" } : { kind: "pic", node: <PaperIcon name={topicById(def.topicId)?.look.icon ?? "bulb"} size={26} /> }}
                  title={def.title}
                  line={!progress ? `${topicById(def.topicId)?.title ?? ""} · Year ${def.year}` : finished ? "Done · open it again any time" : `Step ${at + 1} of ${CANVAS_PHASES.length}: ${CANVAS_LABEL[CANVAS_PHASES[Math.min(at, CANVAS_PHASES.length - 1)]!]}`}
                />
              );
            })}
          </Rows>
        </Section>
      )}

      {/* Up next in the topic: the next lessons, then the big challenge. */}
      <Section
        id="island-title"
        title={<>Up next in {topic.title}</>}
        line={`${done} of ${topic.lessons.length} lessons done`}
        action={
          <Link href={links.island()} className="inline-flex min-h-11 items-center gap-1.5 text-body font-bold text-brand-strong underline underline-offset-4">
            See all lessons <ArrowRightIcon size={18} />
          </Link>
        }
      >
        <Rows ordered>
          {upcoming.map(({ l, i }) => {
            const p = inTopic.lessons[l.id];
            const e = evidence.get(l.id)!;
            const isNext = (rec.kind === "lesson" && rec.lessonId === l.id) || (rec.kind === "practice" && !!rec.focusSkill && rec.focusSkill === e.skill && e.status === "needs-evidence");
            const status =
              e.status === "needs-evidence"
                ? "Finished · practise to complete it"
                : e.status === "needs-review"
                  ? "Let's revisit this"
                  : isNext
                    ? p
                      ? `Step ${Math.min(p.furthestStep + 1, l.steps.length)} of ${l.steps.length}`
                      : "Up next"
                    : `${l.minutes} min`;
            return (
              <Row
                key={l.id}
                href={isNext && e.status === "needs-evidence" && e.skill ? links.practice(e.skill) : subTopicHref(topic.id, l.id, e.skill)}
                mark={isNext ? { kind: "here", n: i + 1 } : { kind: "number", n: i + 1 }}
                current={isNext}
                label={`Lesson ${i + 1}: ${l.title}. ${status}`}
                title={l.title}
                line={status}
              />
            );
          })}
          <Row
            href={links.check()}
            mark={inTopic.assessment.last ? { kind: "done" } : { kind: "pic", node: <PaperIcon name="trophy" size={26} /> }}
            title="The big challenge"
            line={inTopic.assessment.last ? "Done · try again any time" : done < topic.lessons.length ? `Best after all ${topic.lessons.length} lessons` : `+${STARS.check} XP`}
          />
        </Rows>
      </Section>

      <footer>
        <p className="text-label text-muted">3D pictures: Microsoft Fluent Emoji, MIT licence.</p>
      </footer>
    </Column>
  );
}
