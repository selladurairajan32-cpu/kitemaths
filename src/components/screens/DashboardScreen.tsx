"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, CheckIcon, RefreshIcon } from "@/components/ui/Icons";
import { ProgressRing, StatusBadge } from "@/components/ui/Progress";
import { RecommendationLink, recommendationVerb } from "@/components/ui/RecommendationLink";
import { lessonsCompleted, masteredSkills, recommendNext, reviewSkills, strongSkills } from "@/engine/journey";
import { misconceptionReports, skillMastery } from "@/engine/mastery";
import { routes } from "@/lib/routes";
import { resetLearner, useHydrated, useLearner, useStorageStatus } from "@/lib/store";
import { FRACTIONS_TOPIC } from "@/topics/fractions";
import { learningStats, phaseStatuses, topicProgress } from "@/topics/fractions/journey";
import { misconceptionById } from "@/topics/fractions/misconceptions";

export function PhasePath() {
  const learner = useLearner();
  const phases = phaseStatuses(learner);
  return (
    <ol className="flex flex-wrap items-center gap-x-1 gap-y-2" aria-label="Learning phases">
      {phases.map(({ phase, status }, i) => (
        <li key={phase} className="flex shrink-0 items-center gap-1">
          <span
            className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold ${
              status === "done" ? "bg-ok-soft text-ok" : status === "current" ? "bg-ink text-white" : "bg-sunk text-muted"
            }`}
            aria-current={status === "current" ? "step" : undefined}
          >
            {status === "done" && <CheckIcon size={13} />}
            {phase}
            <span className="sr-only">{status === "done" ? " (done)" : status === "current" ? " (current)" : ""}</span>
          </span>
          {i < phases.length - 1 && <span className="h-px w-3 bg-line-strong" aria-hidden />}
        </li>
      ))}
    </ol>
  );
}

export function ScreenSkeleton() {
  return (
    <div className="grid animate-pulse gap-5 lg:grid-cols-3" aria-hidden>
      <div className="h-72 rounded-[var(--radius-card)] bg-sunk lg:col-span-2" />
      <div className="h-72 rounded-[var(--radius-card)] bg-sunk" />
      <div className="h-64 rounded-[var(--radius-card)] bg-sunk lg:col-span-2" />
      <div className="h-64 rounded-[var(--radius-card)] bg-sunk" />
    </div>
  );
}

export function StorageNotice() {
  const status = useStorageStatus();
  if (status === "ok") return null;
  return (
    <p role="status" className="rounded-2xl border border-warn/30 bg-warn-soft px-4 py-3 text-sm text-ink-2">
      {status === "unavailable"
        ? "This browser isn't letting us save progress (for example in private browsing). You can keep learning, but progress will be lost when this tab closes."
        : "We found saved progress we couldn't read, so we kept a backup copy in this browser and started fresh."}
    </p>
  );
}

export function DashboardScreen() {
  const hydrated = useHydrated();
  const learner = useLearner();
  const [confirmReset, setConfirmReset] = useState(false);

  if (!hydrated) return <ScreenSkeleton />;

  const rec = recommendNext(FRACTIONS_TOPIC, learner);
  const activity = topicProgress(learner);
  const lessonsDone = lessonsCompleted(FRACTIONS_TOPIC, learner);
  const secure = strongSkills(FRACTIONS_TOPIC, learner).length;
  const mastered = masteredSkills(FRACTIONS_TOPIC, learner).length;
  const review = reviewSkills(FRACTIONS_TOPIC, learner).length;
  const stats = learningStats(learner);
  const last = learner.assessment.last;
  const lastScore = last ? Object.values(last.evaluations).filter((e) => e.correct).length : 0;
  const working = misconceptionReports(learner.results, FRACTIONS_TOPIC.misconceptions).filter((r) => r.state !== "resolved");
  const total = FRACTIONS_TOPIC.skills.length;
  const fresh = learner.results.length === 0 && lessonsDone === 0;

  return (
    <div className="space-y-6">
      <motion.header initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-muted">{fresh ? "Welcome!" : "Welcome back!"}</p>
        <h1 className="display text-3xl font-semibold sm:text-4xl">Your maths dashboard</h1>
      </motion.header>

      <StorageNotice />

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="card min-w-0 overflow-hidden lg:col-span-2" aria-labelledby="topic-title">
          <div className="space-y-5 p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Current module</p>
                <h2 id="topic-title" className="display mt-1 text-3xl font-semibold sm:text-4xl">
                  {FRACTIONS_TOPIC.title}
                </h2>
                <p className="mt-1 text-ink-2">{FRACTIONS_TOPIC.subtitle}</p>
              </div>
              <TopicMark />
            </div>
            <PhasePath />
          </div>
          <div className="border-t border-line bg-paper p-5 sm:p-7">
            <p className="eyebrow text-den!">Recommended next</p>
            <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold">{rec.title}</h3>
                <p className="mt-1 max-w-md text-ink-2">{rec.reason}</p>
              </div>
              <RecommendationLink rec={rec} className="shrink-0">
                {recommendationVerb(rec)} <ArrowRightIcon size={18} />
              </RecommendationLink>
            </div>
          </div>
        </section>

        <section className="card flex flex-col gap-5 p-5 sm:p-7" aria-labelledby="progress-title">
          <h2 id="progress-title" className="font-semibold">
            Progress
          </h2>
          <div className="flex items-center gap-5">
            <ProgressRing value={activity} size={104} label="Activities completed">
              <span className="text-center leading-tight">
                <span className="block text-2xl font-semibold tabular-nums">{Math.round(activity * 100)}%</span>
                <span className="block text-[0.65rem] text-muted">activities</span>
              </span>
            </ProgressRing>
            <dl className="grid flex-1 gap-2 text-sm">
              <Stat label="Lessons done" value={`${lessonsDone} / ${FRACTIONS_TOPIC.lessons.length}`} />
              <Stat label="Secure in practice" value={`${secure} / ${total}`} />
              <Stat label="Mastered" value={`${mastered} / ${total}`} />
              {review > 0 && <Stat label="Needs review" value={`${review}`} tone="num" />}
            </dl>
          </div>
          <p className="text-xs text-muted">
            The ring shows activities completed (lessons, practice milestone, mastery check) — not how much is mastered.
          </p>
          <div className="grid grid-cols-2 gap-3 border-t border-line pt-4">
            <div>
              <p className="text-2xl font-semibold tabular-nums">{stats.learningAnswered}</p>
              <p className="text-xs text-muted">lesson & practice answers</p>
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums">{stats.firstTryRate === null ? "—" : `${Math.round(stats.firstTryRate * 100)}%`}</p>
              <p className="text-xs text-muted">of those right first time</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm">
                <span className="text-muted">Mastery check: </span>
                <strong>{last ? `${lastScore} / ${last.order.length}` : learner.assessment.status === "in-progress" ? "in progress" : "not taken yet"}</strong>
              </p>
            </div>
          </div>
        </section>

        <section className="card p-5 sm:p-7 lg:col-span-2" aria-labelledby="skills-title">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="skills-title" className="font-semibold">
              Skills in this module
            </h2>
            <Link href={routes.results()} className="rounded text-sm font-medium text-den hover:underline">
              Full report
            </Link>
          </div>
          <ul className="grid gap-x-8 sm:grid-cols-2">
            {FRACTIONS_TOPIC.skills.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 border-b border-line py-2.5">
                <span className="text-sm">{s.title}</span>
                <StatusBadge status={skillMastery(s.id, learner.results).status} />
              </li>
            ))}
          </ul>
        </section>

        <section className="card flex flex-col gap-4 p-5 sm:p-7" aria-labelledby="focus-title">
          <h2 id="focus-title" className="font-semibold">
            Ideas we&apos;re working on
          </h2>
          {working.length === 0 ? (
            <p className="text-sm text-ink-2">
              {stats.learningAnswered === 0
                ? "As you answer questions, we'll notice any tricky ideas and help you with them here."
                : "Nothing to work on right now — great thinking!"}
            </p>
          ) : (
            <ul className="space-y-2.5">
              {working.slice(0, 3).map((r) => (
                <li key={r.id} className="rounded-xl bg-paper p-3">
                  <p className="text-sm font-medium">{misconceptionById(r.id)?.name}</p>
                  <p className="text-xs text-muted">
                    {r.confidence === "likely" ? `Seen ${r.timesSeen} times` : "Seen once — just keeping an eye on it"}
                    {r.state === "improving" ? " · improving" : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-auto space-y-3 border-t border-line pt-4">
            <p className="text-xs text-muted">
              Progress is saved in this browser on this device only. Clearing browser data, private browsing or another device will start fresh. There
              are no accounts in this prototype.
            </p>
            {confirmReset ? (
              <div className="space-y-2">
                <p className="text-sm text-ink-2">Clear all progress saved in this browser?</p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      resetLearner();
                      setConfirmReset(false);
                    }}
                  >
                    Yes, reset
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirmReset(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmReset(true)} className="inline-flex h-11 items-center gap-1.5 rounded text-sm text-muted hover:text-ink">
                <RefreshIcon size={15} /> Reset progress
              </button>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-[var(--radius-card)] border border-dashed border-line-strong p-5 sm:p-7" aria-labelledby="roadmap-title">
        <h2 id="roadmap-title" className="font-semibold">
          About this module
        </h2>
        <p className="mt-1 max-w-3xl text-sm text-ink-2">
          This prototype covers <strong>fractions foundations</strong> only: fractions of one whole, comparing, equivalence, number lines from 0 to 1 and
          fractions of amounts. It is not complete 11+ preparation. Planned next modules (not built yet): simplifying fractions, improper fractions and
          mixed numbers, adding and subtracting fractions, multiplying and dividing fractions, and fractions–decimals–percentages.
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

function TopicMark() {
  return (
    <svg viewBox="0 0 80 80" className="hidden size-20 shrink-0 sm:block" aria-hidden>
      <circle cx="40" cy="40" r="34" fill="#fff" stroke="#1b2130" strokeWidth="2.5" />
      <path d="M40 40 L40 6 A34 34 0 0 1 74 40 Z" fill="#ef8a6b" stroke="#1b2130" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M40 40 L74 40 A34 34 0 0 1 40 74 Z" fill="#ef8a6b" stroke="#1b2130" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M40 40 L40 74 M40 40 L6 40" stroke="#1b2130" strokeWidth="2.5" />
    </svg>
  );
}
