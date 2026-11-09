"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, RefreshIcon } from "@/components/ui/Icons";
import { ProgressRing, StatusBadge } from "@/components/ui/Progress";
import { RecommendationLink, recommendationVerb } from "@/components/ui/RecommendationLink";
import { activityProgress, learningStats, lessonsEvidenced, masteredSkills, recommendNext, reviewSkills, strongSkills, topicResults } from "@/engine/journey";
import { misconceptionReports, skillMastery } from "@/engine/mastery";
import { routes } from "@/lib/routes";
import { resetLearner, useHydrated, useLearner, useNow } from "@/lib/store";
import { PhasePath, ScreenSkeleton, StorageNotice } from "@/components/ui/Screen";
import { useTopicState } from "@/topics/context";
import { ActiveTopicProvider } from "@/topics/ActiveTopic";
import { streakFor, totalStars } from "@/engine/rewards";
import { setProfile, setSettings } from "@/engine/progress";
import { updateLearner } from "@/lib/store";
import { topicById } from "@/topics";
import { WORLDS } from "@/topics/worlds";

/** The module built first to the full quality standard; every other island is an unaccepted preview (D-001). */
const REFERENCE_TOPIC = "fractions";

export function ParentScreen() {
  const hydrated = useHydrated();
  if (!hydrated) return <ScreenSkeleton />;
  return (
    <ActiveTopicProvider choosable>
      <ParentOverview />
    </ActiveTopicProvider>
  );
}

function ParentOverview() {
  const learner = useLearner();
  const { topic, learner: t } = useTopicState();
  const [confirmReset, setConfirmReset] = useState(false);
  const now = useNow();
  const { misconceptionById } = topic;

  const rec = recommendNext(topic, t);
  const activity = activityProgress(topic, t);
  const lessonsDone = lessonsEvidenced(topic, t);
  const secure = strongSkills(topic, t).length;
  const mastered = masteredSkills(topic, t).length;
  const review = reviewSkills(topic, t).length;
  const stats = learningStats(topic, t);
  const last = t.assessment.last;
  const lastScore = last ? Object.values(last.evaluations).filter((e) => e.correct).length : 0;
  const working = misconceptionReports(topicResults(topic, t.results), topic.misconceptions).filter((r) => r.state !== "resolved");
  const total = topic.skills.length;
  const name = learner.profile.name.trim();
  const stars = totalStars(learner);
  const streak = streakFor(learner, now);
  const placement = t.placement;
  const world = WORLDS.find((w) => w.islands.some((i) => i.topicId === topic.id));
  const nextIslands = world ? world.islands.slice(world.islands.findIndex((i) => i.topicId === topic.id) + 1).map((i) => i.title) : [];

  return (
    <div className="space-y-6">
      <motion.header initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-muted">Grown-ups&apos; overview</p>
        <h1 className="display text-3xl sm:text-4xl">{name ? `How ${name} is doing` : "How your child is doing"}</h1>
        <p className="mt-1 max-w-2xl text-ink-2">
          {stars} stars earned · {streak.current}-day streak (best {streak.best})
          {placement.status === "complete" &&
            ` · Warm-up placed them past ${placement.placedOut.length} of ${topic.lessons.length} lessons`}
          {placement.status === "skipped" && " · Started from the beginning"}
        </p>
      </motion.header>

      <StorageNotice />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <section className="card min-w-0 overflow-hidden lg:col-span-2" aria-labelledby="topic-title">
          <div className="space-y-5 p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[0.9375rem] font-bold text-muted">Current module</p>
                <h2 id="topic-title" className="display mt-1 text-3xl font-semibold sm:text-4xl">
                  {topic.title}
                </h2>
                <p className="mt-1 text-ink-2">{topic.subtitle}</p>
              </div>
              <TopicMark />
            </div>
            <PhasePath />
          </div>
          <div className="border-t border-line bg-paper p-5 sm:p-7">
            <p className="text-[0.9375rem] font-bold text-den-strong">Recommended next</p>
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
                <span className="block text-[0.9375rem] text-muted">activities</span>
              </span>
            </ProgressRing>
            <dl className="grid flex-1 gap-2 text-[0.9375rem]">
              <Stat label="Lessons done" value={`${lessonsDone} / ${topic.lessons.length}`} />
              <Stat label="Secure in practice" value={`${secure} / ${total}`} />
              <Stat label="Mastered" value={`${mastered} / ${total}`} />
              {review > 0 && <Stat label="Needs review" value={`${review}`} tone="num" />}
            </dl>
          </div>
          <p className="text-[0.9375rem] text-muted">
            The ring shows activities completed (lessons, practice milestone, mastery check) — not how much is mastered.
          </p>
          <div className="grid grid-cols-2 gap-3 border-t border-line pt-4">
            <div>
              <p className="text-2xl font-semibold tabular-nums">{stats.learningAnswered}</p>
              <p className="text-[0.9375rem] text-muted">lesson & practice answers</p>
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums">{stats.firstTryRate === null ? "—" : `${Math.round(stats.firstTryRate * 100)}%`}</p>
              <p className="text-[0.9375rem] text-muted">of those right first time</p>
            </div>
            <div className="col-span-2">
              <p className="text-[0.9375rem]">
                <span className="text-muted">Mastery check: </span>
                <strong>{last ? `${lastScore} / ${last.order.length}` : t.assessment.status === "in-progress" ? "in progress" : "not taken yet"}</strong>
              </p>
            </div>
          </div>
        </section>

        <section className="card p-5 sm:p-7 lg:col-span-2" aria-labelledby="skills-title">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="skills-title" className="font-semibold">
              Skills in this module
            </h2>
            <Link href={routes.results()} className="inline-flex min-h-11 items-center rounded text-[0.9375rem] font-medium text-den hover:underline">
              Full report
            </Link>
          </div>
          <ul className="grid gap-x-8 sm:grid-cols-2">
            {topic.skills.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 border-b border-line py-2.5">
                <span className="text-[0.9375rem]">{s.title}</span>
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
            <p className="text-[0.9375rem] text-ink-2">
              {stats.learningAnswered === 0
                ? "As you answer questions, we'll notice any tricky ideas and help you with them here."
                : "Nothing to work on right now — great thinking!"}
            </p>
          ) : (
            <ul className="space-y-2.5">
              {working.slice(0, 3).map((r) => (
                <li key={r.id} className="rounded-[16px] bg-paper p-3">
                  <p className="text-[0.9375rem] font-medium">{misconceptionById(r.id)?.name}</p>
                  <p className="text-[0.9375rem] text-muted">
                    {r.confidence === "likely" ? `Seen ${r.timesSeen} times` : "Seen once — just keeping an eye on it"}
                    {r.state === "improving" ? " · improving" : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-auto space-y-3 border-t border-line pt-4">
            <p className="text-[0.9375rem] text-muted">
              Progress is saved in this browser on this device only. Clearing browser data, private browsing or another device will start fresh. There
              are no accounts yet.
            </p>
            {confirmReset ? (
              <div className="space-y-2">
                <p className="text-[0.9375rem] text-ink-2">Clear all progress saved in this browser?</p>
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
              <button type="button" onClick={() => setConfirmReset(true)} className="inline-flex h-11 items-center gap-1.5 rounded text-[0.9375rem] text-muted hover:text-ink">
                <RefreshIcon size={15} /> Reset progress
              </button>
            )}
          </div>
        </section>
      </div>

      <section className="card p-5 sm:p-7" aria-labelledby="settings-title">
        <h2 id="settings-title" className="font-semibold">
          Settings
        </h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <label className="block text-[0.9375rem]">
            <span className="font-medium">Child&apos;s first name</span>
            <input
              value={learner.profile.name}
              maxLength={24}
              onChange={(e) => updateLearner((s) => setProfile(s, { name: e.target.value }))}
              className="mt-1 h-11 w-full rounded-[16px] border-2 border-line-strong bg-surface px-3"
            />
          </label>
          <label className="block text-[0.9375rem]">
            <span className="font-medium">School year</span>
            <select
              value={learner.profile.year ?? ""}
              onChange={(e) => updateLearner((s) => setProfile(s, { year: e.target.value ? Number(e.target.value) : null }))}
              className="mt-1 h-11 w-full rounded-[16px] border-2 border-line-strong bg-surface px-3"
            >
              <option value="">Not set</option>
              {[3, 4, 5, 6].map((y) => (
                <option key={y} value={y}>
                  Year {y}
                </option>
              ))}
            </select>
          </label>
          <Toggle
            label="Sound effects"
            hint="Chimes for right answers, stars and level-ups."
            on={learner.settings.sound}
            onChange={(v) => updateLearner((s) => setSettings(s, { sound: v }))}
          />
          <Toggle
            label="Read questions aloud automatically"
            hint="Helpful for younger or developing readers. Every question also has a speaker button."
            on={learner.settings.autoRead}
            onChange={(v) => updateLearner((s) => setSettings(s, { autoRead: v }))}
          />
        </div>
      </section>

      <section className="rounded-[var(--radius-card)] border-2 border-dashed border-line-strong p-5 sm:p-7" aria-labelledby="roadmap-title">
        <h2 id="roadmap-title" className="font-semibold">
          About this module
        </h2>
        <div className="mt-1 max-w-3xl space-y-2 text-[0.9375rem] text-ink-2">
          <p>
            <strong>{topic.title}</strong>: {topic.subtitle}.
          </p>
          <p>
            {topic.id === REFERENCE_TOPIC
              ? "This is the module being built first to the full standard: lessons, practice and an independent mastery check. The other islands are early previews: they work, but have not yet been through the same checks."
              : `This island is an early preview. It works, but it has not yet been through the checks that ${topicById(REFERENCE_TOPIC)?.title ?? "the first module"} is going through.`}{" "}
            Kite Maths is not yet complete 11+ preparation.
          </p>
          {nextIslands.length > 0 && (
            <p>
              Next in {world!.title}: {nextIslands.join(", ")}.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function Toggle({ label, hint, on, onChange }: { label: string; hint: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-[20px] bg-paper p-3">
      <div className="text-[0.9375rem]">
        <p className="font-medium">{label}</p>
        <p className="text-muted">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => onChange(!on)}
        className="relative h-11 w-14 shrink-0"
      >
        {/* A 44px-tall target around the 32px track (UX-007 AC2). */}
        <span className={`absolute inset-x-0 top-1.5 h-8 rounded-full transition-colors ${on ? "bg-ok-bright" : "bg-line-strong"}`} />
        <span className={`absolute top-2.5 size-6 rounded-full bg-white shadow transition-all ${on ? "left-7" : "left-1"}`} />
      </button>
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
