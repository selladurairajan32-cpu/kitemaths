"use client";

import Link from "next/link";
import { Kip, KipSays } from "@/components/kid/Kip";
import { kidNext } from "@/components/kid/kidText";
import { RichText } from "@/components/math/RichText";
import { PaperIcon } from "@/components/paper/PaperIcon";
import { isPicName, Pic } from "@/components/paper/Pic";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRightIcon, CheckIcon, LockIcon } from "@/components/ui/Icons";
import { ScreenSkeleton, StorageNotice } from "@/components/ui/Screen";
import { allLessonEvidence } from "@/engine/evidence";
import { lessonsEvidenced, recommendNext, reviewSkills } from "@/engine/journey";
import { answeredToday, DAILY_GOAL, levelFor, STARS, streakFor, totalStars } from "@/engine/rewards";
import { JOURNEY_STAGES, STAGE_LABEL } from "@/engine/topicJourney";
import { STAGE_PIC } from "@/components/journey/JourneyChrome";
import { CYCLE } from "@/components/kid/fields";
import { ProgressBar, ProgressRing } from "@/components/ui/Progress";
import { DEFAULT_PLAN } from "@/engine/progress";
import { routes, topicRoutes } from "@/lib/routes";
import { useHydrated, useLearner, useNow } from "@/lib/store";
import { topicById } from "@/topics";
import { continueJourney, journeyCards } from "@/topics/overview";
import { PLAN_KIND_LABEL, weeklyPlan } from "@/topics/plan";
import { useTopicState } from "@/topics/context";
import { ActiveTopicProvider } from "@/topics/ActiveTopic";

/** Each lesson card gets its own pastel tile, in turn. */
const TILES = ["bg-tile-orange", "bg-tile-pink", "bg-tile-blue", "bg-tile-yellow", "bg-tile-green", "bg-tile-sky"];


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
  const { skillById, lessonLook } = topic;

  // DEF-003: any lesson progress means the child has started, even before answering a question.
  const brandNew = inTopic.placement.status === "not-started" && learner.results.length === 0 && Object.keys(inTopic.lessons).length === 0;
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
  const journeys = journeyCards(learner);
  const upcoming = topic.lessons.map((l, i) => ({ l, i })).filter(({ l }) => evidence.get(l.id)!.status !== "evidenced").slice(0, 3);

  return (
    <div className="space-y-10 sm:space-y-12">
      <StorageNotice />

      {/* D-046 phase 2: hello from the guide, with the streak, today's goal and the level ring (concept images). */}
      <section aria-labelledby="hello-title" className="grid items-center gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex items-end gap-4">
          <Pic name="guide-wave" size={128} priority className="hidden shrink-0 sm:block" />
          <div className="min-w-0">
            <h1 id="hello-title" className="display flex flex-wrap items-center gap-2 text-heading-2 sm:text-heading-1">
              Hi{name ? ` ${name}` : " there"}! <Pic name="waving" size={44} />
            </h1>
            <p className="mt-1 text-lg font-semibold text-ink-2">
              {greeting(now)}.{" "}
              {streak.current > 0 ? `You're on a ${streak.current}-day streak` : "Let's build your maths today"}
              {!brandNew && ` · ${today} of ${DAILY_GOAL} questions today`}
              {streak.current > 0 && <Pic name="flame" size={22} className="ml-1 align-text-bottom" />}
            </p>
          </div>
        </div>
        <Link href={routes.progress()} className="flex items-center gap-4 rounded-[28px] bg-field-yellow p-3 pr-6 text-ink transition hover:-translate-y-0.5" aria-label={`Level ${level.level}: ${stars} XP, ${level.needed - level.into} XP to level ${level.level + 1}. See your progress.`}>
          <ProgressRing value={level.into / level.needed} size={84} label={`Level ${level.level}`}>
            <span className="display text-title leading-none text-ink">{level.level}</span>
          </ProgressRing>
          <span>
            <span className="block text-title font-extrabold text-ink">Level {level.level}</span>
            <span className="block text-label font-bold text-ink-2">{level.title}</span>
            <span className="block text-label font-bold text-ink">{level.needed - level.into} XP to level {level.level + 1}</span>
          </span>
        </Link>
      </section>

      {/* Continue Learning: the one thing to do next, with one yellow button (D-037, D-043 step 3). */}
      <section className="relative overflow-hidden rounded-[32px] bg-field-blue px-5 py-6 text-white sm:px-8 sm:py-8" aria-labelledby="next-title">
        <div className="flex items-center gap-6">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-body font-extrabold">
              <Pic name="play" size={24} /> {brandNew ? "Let's begin" : "Continue learning"}
            </p>
            <h2 id="next-title" className="display mt-2 text-heading-2 sm:text-heading-1">
              {brandNew ? <>I&apos;m Kip. Let&apos;s find your start!</> : cont ? cont.def.title : next.title}
            </h2>
            {cont ? (
              <>
                <p className="mt-2 max-w-xl text-lg">
                  {contTopic?.title ?? cont.def.topicId} · Step {cont.progress.reached + 1} of {JOURNEY_STAGES.length}: {STAGE_LABEL[JOURNEY_STAGES[cont.progress.reached]]}
                </p>
                <ol className="mt-4 flex max-w-xl items-center gap-1 sm:gap-2" aria-label={`Your learning path: step ${cont.progress.reached + 1} of ${JOURNEY_STAGES.length}`}>
                  {JOURNEY_STAGES.map((st, i) => {
                    const doneStage = i < cont.progress.reached;
                    const here = i === cont.progress.reached;
                    return (
                      <li key={st} className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[16px] px-1 py-2 ${here ? "bg-surface text-field-blue" : ""}`}>
                        <span className="relative">
                          <span className="grid size-11 place-items-center rounded-full bg-surface"><Pic name={STAGE_PIC[st]} size={28} muted={!doneStage && !here} /></span>
                          {doneStage && (
                            <span className="absolute -bottom-1 -right-1 grid size-4 place-items-center rounded-full bg-ok-bright text-white ring-2 ring-white" aria-hidden>
                              <CheckIcon size={9} strokeWidth={4} />
                            </span>
                          )}
                        </span>
                        <span className={`whitespace-nowrap text-label leading-tight [overflow-wrap:normal] ${here ? "font-extrabold" : "font-semibold"}`}>{STAGE_LABEL[st]}</span>
                        <span className="sr-only">{doneStage ? ", done" : here ? ", up next" : ""}</span>
                      </li>
                    );
                  })}
                </ol>
                <div className="mt-3 flex max-w-xl items-center gap-3">
                  <ProgressBar value={cont.progress.reached / JOURNEY_STAGES.length} tone="ok" label="Journey progress" className="h-3" />
                  <span className="whitespace-nowrap text-label font-bold">{cont.progress.reached} of {JOURNEY_STAGES.length} steps</span>
                </div>
              </>
            ) : (
              <p className="mt-2 max-w-xl text-lg">
                {brandNew ? <>A short warm-up game finds the right {topic.title} lesson for you.</> : <RichText text={next.line} />}
              </p>
            )}
            <ButtonLink href={brandNew ? links.start() : cont ? topicRoutes(cont.def.topicId).learn(cont.def.concept) : next.href} variant="cta" size="xl" className="mt-6 w-full sm:w-auto">
              {brandNew ? "Play the warm-up" : cont ? "Continue" : next.cta} <ArrowRightIcon size={20} />
            </ButtonLink>
            {!brandNew && !cont && nextIndex >= 0 && (
              <p className="mt-4 text-body font-semibold">
                Lesson {nextIndex + 1} of {topic.lessons.length} · about {topic.lessons[nextIndex].minutes} minutes
              </p>
            )}
          </div>
          <div className="hidden shrink-0 sm:block" aria-hidden>
            {brandNew || !cont ? (
              <Kip mood={brandNew ? "cheer" : "happy"} size={150} />
            ) : (
              <span className="grid size-40 place-items-center rounded-full bg-surface">
                {isPicName(cont.def.pic) ? <Pic name={cont.def.pic} size={112} /> : <PaperIcon name={contTopic?.look.icon ?? "bulb"} size={104} />}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* One message from Kip at most: a skill to revisit, else the warm-up. */}
      {review.length > 0 ? (
        <KipSays mood="think" tone="sun" speak={`Let's revisit ${skillById(review[0]).title}.`}>
          Let&apos;s revisit <strong>{skillById(review[0]).title}</strong>.{" "}
          <Link href={links.practice(review[0])} className="inline-flex min-h-11 items-center font-bold text-brand-strong underline underline-offset-4">
            Practise it
          </Link>
        </KipSays>
      ) : warmUpOpen ? (
        <KipSays mood="happy" tone="sky">
          New to {topic.title}? A warm-up finds where to start.{" "}
          <Link href={links.start()} className="inline-flex min-h-11 items-center font-bold text-brand-strong underline underline-offset-4">
            Play the warm-up
          </Link>
        </KipSays>
      ) : null}

      {/* D-043 step 3: today's plan, from the weekly plan the grown-up sets. */}
      {plan && plan.items.length > 0 && (
        <section aria-labelledby="plan-title">
          <h2 id="plan-title" className="display text-heading-2">
            Today&apos;s plan
          </h2>
          <p className="mt-1 text-body text-ink-2">About {plan.minutes} minutes</p>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {plan.items.map((it, i) => (
              <li key={it.href + i} className="flex">
                <Link href={it.href} className="panel flex flex-1 items-center gap-3 rounded-[24px] p-4 transition hover:-translate-y-0.5">
                  <span className={`grid size-10 shrink-0 place-items-center rounded-full text-lg font-extrabold ${CYCLE[i % CYCLE.length]!.bg} ${CYCLE[i % CYCLE.length]!.text}`} aria-hidden>
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-label font-bold text-muted">
                      {PLAN_KIND_LABEL[it.kind]} · {it.minutes} min
                    </span>
                    <span className="block font-extrabold leading-snug text-ink">{it.title}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* D-043: the topic journeys (Learn, Practise, Apply, Check, Complete), with Emma's voice. */}
      {!brandNew && journeys.length > 0 && (
        <section aria-labelledby="learn-title">
          <h2 id="learn-title" className="display text-heading-2">
            Learn a new idea with Emma
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {journeys.map(({ def, progress }, ji) => {
              const finished = !!progress && progress.reached >= JOURNEY_STAGES.length - 1;
              const state = !progress ? `Year ${def.year} · watch, step through or try it` : finished ? "Done · watch again any time" : `Step ${progress.reached + 1} of ${JOURNEY_STAGES.length}: ${STAGE_LABEL[JOURNEY_STAGES[progress.reached]]}`;
              return (
                <li key={`${def.topicId}/${def.concept}`} className="flex">
                  <Link href={topicRoutes(def.topicId).learn(def.concept)} className={`flex flex-1 items-center gap-3 rounded-[24px] p-4 transition hover:-translate-y-0.5 ${CYCLE[ji % CYCLE.length]!.bg} ${CYCLE[ji % CYCLE.length]!.text}`}>
                    <span className="grid size-14 shrink-0 place-items-center rounded-full bg-surface" aria-hidden>
                      {isPicName(def.pic) ? <Pic name={def.pic} size={40} /> : <PaperIcon name={topicById(def.topicId)?.look.icon ?? "bulb"} size={38} />}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-extrabold leading-snug">{def.title}</span>
                      <span className="mt-0.5 flex items-center gap-1 text-label font-bold">
                        {finished && <CheckIcon size={15} strokeWidth={3} />}
                        {state}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Up next on the island: the next lessons, then the big challenge. */}
      <section aria-labelledby="island-title">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="island-title" className="display text-heading-2">
              Up next: {topic.title}
            </h2>
            <p className="mt-1 text-body text-ink-2">
              {done} of {topic.lessons.length} lessons done
            </p>
          </div>
          <Link href={links.island()} className="inline-flex min-h-11 items-center gap-1.5 text-lg font-bold text-brand-strong underline underline-offset-4">
            See all lessons <ArrowRightIcon size={18} />
          </Link>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {upcoming.map(({ l, i }) => {
            const p = inTopic.lessons[l.id];
            const e = evidence.get(l.id)!;
            const isDone = e.status === "evidenced";
            const isNext = (rec.kind === "lesson" && rec.lessonId === l.id) || (rec.kind === "practice" && !!rec.focusSkill && rec.focusSkill === e.skill && e.status === "needs-evidence");
            const status = isDone
              ? e.via === "placement"
                ? "You already knew this"
                : "Done · you showed you can do it"
              : e.status === "needs-evidence"
                ? "Finished · practise to complete it"
                : e.status === "needs-review"
                  ? "Let's revisit this"
                  : isNext
                    ? p
                      ? `Step ${Math.min(p.furthestStep + 1, l.steps.length)} of ${l.steps.length}`
                      : "Up next"
                    : `${l.minutes} min`;
            return (
              <li key={l.id} className="flex">
                <Link
                  href={isNext && e.status === "needs-evidence" && e.skill ? links.practice(e.skill) : links.lesson(l.id)}
                  className={`relative grid flex-1 grid-cols-[4.5rem_1fr] content-center items-center gap-x-4 rounded-[24px] border bg-surface p-4 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] sm:grid-cols-[5.25rem_1fr] sm:p-5 ${
                    isNext ? "border-2 border-brand shadow-[0_0_0_6px_var(--color-brand-soft),var(--shadow-lift)]" : "border-line"
                  }`}
                  aria-label={`Lesson ${i + 1}: ${l.title}. ${status}`}
                >
                  <span className={`grid size-[4.5rem] place-items-center rounded-[20px] sm:size-[5.25rem] ${TILES[i % TILES.length]}`}>
                    <PaperIcon name={lessonLook(l.id).icon} size={56} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-label font-bold text-muted">Lesson {i + 1}</span>
                    <span className="mt-0.5 block text-body font-extrabold leading-snug text-ink sm:text-title">{l.title}</span>
                    <span className={`mt-1.5 flex items-center gap-1.5 text-label font-bold ${isDone ? "text-ok" : isNext ? "text-brand-strong" : "font-semibold text-muted"}`}>
                      {isDone && <CheckIcon size={17} strokeWidth={3} />}
                      {status}
                    </span>
                  </span>
                  {isDone && (
                    <span className="absolute right-4 top-4 grid size-7 place-items-center rounded-full bg-ok-bright text-white" aria-hidden>
                      <CheckIcon size={16} strokeWidth={3} />
                    </span>
                  )}
                  {isNext && (
                    <span className="col-span-2 mt-4 flex h-12 items-center justify-center gap-2 rounded-full border-b-[3px] border-brand-strong bg-brand text-[1.0625rem] font-bold text-on-brand" aria-hidden>
                      Play <ArrowRightIcon size={18} />
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
          <li className="flex">
            <Link
              href={links.check()}
              className="relative grid flex-1 grid-cols-[4.5rem_1fr] content-center items-center gap-x-4 rounded-[24px] border border-line bg-surface p-4 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)] sm:grid-cols-[5.25rem_1fr] sm:p-5"
            >
              <span className="grid size-[4.5rem] place-items-center rounded-[20px] bg-tile-yellow sm:size-[5.25rem]">
                <Pic name="trophy" size={56} />
              </span>
              <span className="min-w-0">
                <span className="block text-lg font-extrabold leading-snug text-ink sm:text-xl">The big challenge</span>
                <span className="mt-1.5 flex items-center gap-1.5 text-label font-bold text-ink-2">
                  {inTopic.assessment.last ? (
                    <>
                      <CheckIcon size={17} strokeWidth={3} /> Done · try again any time
                    </>
                  ) : done < topic.lessons.length ? (
                    <>
                      <LockIcon size={16} /> Best after all {topic.lessons.length} lessons
                    </>
                  ) : (
                    `+${STARS.check} XP`
                  )}
                </span>
              </span>
            </Link>
          </li>
        </ol>
      </section>

      <footer className="pb-4">
        <p className="text-label text-muted">3D pictures: Microsoft Fluent Emoji, MIT licence.</p>
      </footer>
    </div>
  );
}
