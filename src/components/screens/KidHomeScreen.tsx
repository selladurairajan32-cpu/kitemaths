"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { useState } from "react";
import { kidNext } from "@/components/kid/kidText";
import { RichText } from "@/components/math/RichText";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ArrowRightIcon, RefreshIcon } from "@/components/ui/Icons";
import { recommendationVerb } from "@/components/ui/RecommendationLink";
import { ProgressRing, StatusBadge } from "@/components/ui/Progress";
import { PhasePath, ScreenSkeleton, StorageNotice } from "@/components/ui/Screen";
import { activityProgress, learningStats, lessonsEvidenced, masteredSkills, recommendNext, reviewSkills, strongSkills, topicResults } from "@/engine/journey";
import { misconceptionReports, skillMastery } from "@/engine/mastery";
import { CANVAS_LABEL, CANVAS_PHASES, canvasReached, JOURNEY_STAGES, STAGE_LABEL } from "@/engine/topicJourney";
import { routes, topicRoutes } from "@/lib/routes";
import { resetLearner, useHydrated, useLearner } from "@/lib/store";
import { topicById, TOPICS } from "@/topics";
import { ActiveTopicProvider } from "@/topics/ActiveTopic";
import { useTopicState } from "@/topics/context";
import { continueJourney, subTopicHref } from "@/topics/overview";
import { PaperIcon } from "@/components/paper/PaperIcon";

/**
 * Home, as the first prototype's dashboard (D-066): "Your maths dashboard". The child's current topic in a large card
 * with its learning phases and the one recommended next step; their progress beside it (a ring of activities done,
 * lessons, skills secure and mastered); the topic's skills; the ideas being worked on; and a note about the other topics.
 */

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
  const { skillById } = topic;

  // DEF-003: any lesson progress means the child has started, even before answering a question.
  // D-062: a lesson begun on the canvas also counts, so Home offers to continue it.
  const brandNew = inTopic.placement.status === "not-started" && learner.results.length === 0 && Object.keys(inTopic.lessons).length === 0 && !continueJourney(learner);
  // DEF-011: every island's warm-up is offered from home until it is done or skipped.
  const warmUpOpen = !brandNew && inTopic.placement.status === "not-started" && !!topic.placement;
  const rec = recommendNext(topic, inTopic);
  const next = kidNext(rec, topic);
  const review = reviewSkills(topic, inTopic);
  const name = learner.profile.name.trim();
  // FR-011 AC3: a lesson is done when it has independent evidence, not when its last page was reached.
  const nextIndex = rec.kind === "lesson" ? topic.lessons.findIndex((l) => l.id === rec.lessonId) : -1;
  // R1 (content audit): Home shows the next three unfinished lessons; the island map lists them all.
  // D-043 step 3: Continue Learning picks up the topic journey worked in last; with none open, the next step on the island.
  const cont = brandNew ? null : continueJourney(learner);
  const contTopic = cont ? topicById(cont.def.topicId) : undefined;
  // A lesson on the canvas has six steps; a journey in the earlier layout has five.
  const steps = cont ? (cont.def.canvas ? { count: CANVAS_PHASES.length, at: canvasReached(cont.progress), label: CANVAS_LABEL[CANVAS_PHASES[Math.min(canvasReached(cont.progress), CANVAS_PHASES.length - 1)]!] } : { count: JOURNEY_STAGES.length, at: cont.progress.reached, label: STAGE_LABEL[JOURNEY_STAGES[cont.progress.reached]!] }) : null;

  const nextLesson = rec.kind === "lesson" ? topic.lessons[nextIndex] : undefined;
  const go = brandNew
    ? { href: links.start(), label: "Play the warm-up", title: "Find your starting point", line: `A short warm-up game finds the right ${topic.title} lesson for you.` }
    : cont && steps
      ? { href: topicRoutes(cont.def.topicId).learn(cont.def.concept), label: "Continue lesson", title: cont.def.title, line: `${contTopic?.title ?? cont.def.topicId} · Step ${steps.at + 1} of ${steps.count}: ${steps.label}. Carry on where you stopped.` }
      : { href: nextLesson ? subTopicHref(topic.id, nextLesson.id, topic.skills.find((k) => k.lessonId === nextLesson.id)?.id) : next.href, label: recommendationVerb(rec), title: rec.title, line: rec.reason };

  const activity = activityProgress(topic, inTopic);
  const lessonsDone = lessonsEvidenced(topic, inTopic);
  const secure = strongSkills(topic, inTopic).length;
  const mastered = masteredSkills(topic, inTopic).length;
  const stats = learningStats(topic, inTopic);
  const last = inTopic.assessment.last;
  const lastScore = last ? Object.values(last.evaluations).filter((e) => e.correct).length : 0;
  const working = misconceptionReports(topicResults(topic, learner.results), topic.misconceptions).filter((r) => r.state !== "resolved");
  const total = topic.skills.length;

  return (
    <div className="space-y-6">
      <motion.header initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-muted">{brandNew ? "Welcome!" : name ? `Welcome back, ${name}!` : "Welcome back!"}</p>
        <h1 id="hello-title" className="display text-heading-1 sm:text-display-2">
          Your maths dashboard
        </h1>
      </motion.header>

      <StorageNotice />

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="card min-w-0 overflow-hidden lg:col-span-2" aria-labelledby="topic-title">
          <div className="space-y-5 p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="eyebrow">Current topic</p>
                <h2 id="topic-title" className="display mt-1 text-heading-1 sm:text-display-2">
                  {topic.title}
                </h2>
                <p className="mt-1 text-body text-ink-2">{topic.subtitle}</p>
              </div>
              <span className="hidden size-20 shrink-0 place-items-center rounded-full border-2 border-ink bg-surface sm:grid" aria-hidden>
                <PaperIcon name={topic.look.icon} size={48} />
              </span>
            </div>
            <PhasePath />
          </div>
          <div className="border-t border-line bg-paper p-5 sm:p-7">
            <p className="eyebrow text-den!">{cont ? "Continue learning" : "Recommended next"}</p>
            <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <h3 id="next-title" className="text-title font-semibold">
                  {go.title}
                </h3>
                <p className="mt-1 max-w-md text-body text-ink-2">
                  <RichText text={go.line} />
                </p>
              </div>
              <ButtonLink href={go.href} size="lg" className="shrink-0">
                {go.label} <ArrowRightIcon size={18} />
              </ButtonLink>
            </div>
          </div>
        </section>

        <section className="card flex flex-col gap-5 p-5 sm:p-7" aria-labelledby="progress-title">
          <h2 id="progress-title" className="font-sans text-body font-semibold">
            Progress
          </h2>
          <div className="flex items-center gap-5">
            <ProgressRing value={activity} size={104} label="Activities completed">
              <span className="text-center leading-tight">
                <span className="block text-heading-2 font-semibold tabular-nums">{Math.round(activity * 100)}%</span>
                <span className="block text-label text-muted">activities</span>
              </span>
            </ProgressRing>
            <dl className="grid flex-1 gap-2 text-label">
              <Stat label="Lessons done" value={`${lessonsDone} / ${topic.lessons.length}`} />
              <Stat label="Secure in practice" value={`${secure} / ${total}`} />
              <Stat label="Mastered" value={`${mastered} / ${total}`} />
              {review.length > 0 && <Stat label="Needs review" value={`${review.length}`} tone="num" />}
            </dl>
          </div>
          <p className="text-label text-muted">The ring shows activities completed (lessons, practice milestone, mastery check), not how much is mastered.</p>
          <div className="grid grid-cols-2 gap-3 border-t border-line pt-4">
            <div>
              <p className="text-heading-2 font-semibold tabular-nums">{stats.learningAnswered}</p>
              <p className="text-label text-muted">lesson and practice answers</p>
            </div>
            <div>
              <p className="text-heading-2 font-semibold tabular-nums">{stats.firstTryRate === null ? "–" : `${Math.round(stats.firstTryRate * 100)}%`}</p>
              <p className="text-label text-muted">of those right first time</p>
            </div>
            <p className="col-span-2 text-label">
              <span className="text-muted">Mastery check: </span>
              <strong>{last ? `${lastScore} / ${last.order.length}` : inTopic.assessment.status === "in-progress" ? "in progress" : "not taken yet"}</strong>
            </p>
          </div>
        </section>

        <section className="card p-5 sm:p-7 lg:col-span-2" aria-labelledby="skills-title">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="skills-title" className="font-sans text-body font-semibold">
              Skills in this topic
            </h2>
            <Link href={routes.progress()} className="rounded text-label font-medium text-den hover:underline">
              Full report
            </Link>
          </div>
          <ul className="grid gap-x-8 sm:grid-cols-2">
            {topic.skills.map((sk) => (
              <li key={sk.id} className="border-b border-line">
                <Link href={links.practice(sk.id)} className="flex min-h-11 items-center justify-between gap-3 py-2.5 hover:text-den">
                  <span className="text-label">{sk.title}</span>
                  <StatusBadge status={skillMastery(sk.id, learner.results).status} />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <IdeasCard working={working.slice(0, 3).map((r) => ({ id: r.id, name: topic.misconceptionById(r.id)?.name ?? r.id, line: `${r.confidence === "likely" ? `Seen ${r.timesSeen} times` : "Seen once, just keeping an eye on it"}${r.state === "improving" ? " · improving" : ""}` }))} answered={stats.learningAnswered} />
      </div>

      {(review.length > 0 || warmUpOpen) && (
        <p className="rounded-2xl border border-warn/30 bg-warn-soft px-4 py-3 text-body text-ink-2">
          {review.length > 0 ? (
            <>
              <strong className="text-ink">{skillById(review[0]).title}</strong> needs another look.{" "}
              <Link href={links.practice(review[0])} className="font-medium text-den underline underline-offset-4">
                Practise it
              </Link>
            </>
          ) : (
            <>
              New to {topic.title}? A short warm-up finds where to start.{" "}
              <Link href={links.start()} className="font-medium text-den underline underline-offset-4">
                Play the warm-up
              </Link>
            </>
          )}
        </p>
      )}

      <section className="rounded-[var(--radius-card)] border border-dashed border-line-strong p-5 sm:p-7" aria-labelledby="about-title">
        <h2 id="about-title" className="font-sans text-body font-semibold">
          About your topics
        </h2>
        <p className="mt-1 max-w-3xl text-label text-ink-2">
          Your dashboard follows <strong>{topic.title}</strong>, the topic you are working on now. Kite Maths has {TOPICS.length} topics for Years 3 to 6
          and the 11+, from place value to ratio and algebra.{" "}
          <Link href={routes.topics()} className="font-medium text-den hover:underline">
            See all the topics
          </Link>
        </p>
      </section>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "num" }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-muted">{label}</dt>
      <dd className={`whitespace-nowrap font-semibold tabular-nums ${tone === "num" ? "text-num-strong" : ""}`}>{value}</dd>
    </div>
  );
}

function IdeasCard({ working, answered }: { working: { id: string; name: string; line: string }[]; answered: number }) {
  const [confirmReset, setConfirmReset] = useState(false);
  return (
    <section className="card flex flex-col gap-4 p-5 sm:p-7" aria-labelledby="focus-title">
      <h2 id="focus-title" className="font-sans text-body font-semibold">
        Ideas we&apos;re working on
      </h2>
      {working.length === 0 ? (
        <p className="text-label text-ink-2">{answered === 0 ? "As you answer questions, we'll notice any tricky ideas and help you with them here." : "Nothing to work on right now. Great thinking!"}</p>
      ) : (
        <ul className="space-y-2.5">
          {working.map((r) => (
            <li key={r.id} className="rounded-xl bg-paper p-3">
              <p className="text-label font-medium">{r.name}</p>
              <p className="text-label text-muted">{r.line}</p>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto space-y-3 border-t border-line pt-4">
        <p className="text-label text-muted">Progress is saved in this browser on this device only. Clearing browser data, private browsing or another device will start fresh.</p>
        {confirmReset ? (
          <div className="space-y-2">
            <p className="text-label text-ink-2">Clear all progress saved in this browser?</p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => { resetLearner(); setConfirmReset(false); }}>
                Yes, reset
              </Button>
              <Button variant="ghost" onClick={() => setConfirmReset(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmReset(true)} className="inline-flex min-h-11 items-center gap-1.5 rounded text-label text-muted hover:text-ink">
            <RefreshIcon size={15} /> Reset progress
          </button>
        )}
      </div>
    </section>
  );
}
