"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import { CheckIcon, FlagIcon, PracticeIcon } from "@/components/ui/Icons";
import { ProgressBar } from "@/components/ui/Progress";
import { isPracticeMilestoneMet, practiceResultsCount, PRACTICE_READY_RESULTS, recommendNext, strongSkills } from "@/engine/journey";
import { skillMastery } from "@/engine/mastery";
import { routes } from "@/lib/routes";
import { useHydrated, useLearner } from "@/lib/store";
import { ASSESSMENT_FORMS } from "@/topics/fractions/questions";
import { skillById } from "@/topics/fractions/skills";
import { FRACTIONS_TOPIC } from "@/topics/fractions";
import { PHASE_DESCRIPTIONS, phaseStatuses } from "@/topics/fractions/journey";
import { LESSONS } from "@/topics/fractions/lessons";
import { ScreenSkeleton } from "./DashboardScreen";

type NodeStatus = "done" | "active" | "next" | "upcoming";

function Node({ status, index }: { status: NodeStatus; index: number }) {
  const cls = {
    done: "bg-ok text-white",
    active: "bg-ink text-white ring-4 ring-ink/10",
    next: "bg-surface text-ink ring-2 ring-ink",
    upcoming: "bg-surface text-muted ring-1 ring-line-strong",
  }[status];
  return (
    <span className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold ${cls}`}>
      {status === "done" ? <CheckIcon size={18} /> : index}
    </span>
  );
}

const STATUS_TEXT: Record<NodeStatus, string> = {
  done: "Completed",
  active: "In progress",
  next: "Recommended next",
  upcoming: "Coming up",
};

export function JourneyScreen() {
  const hydrated = useHydrated();
  const learner = useLearner();
  if (!hydrated) return <ScreenSkeleton />;

  const rec = recommendNext(FRACTIONS_TOPIC, learner);
  const practiceMet = isPracticeMilestoneMet(FRACTIONS_TOPIC, learner);
  const strong = strongSkills(FRACTIONS_TOPIC, learner).length;
  const practiced = practiceResultsCount(learner);
  const needStrong = Math.ceil(FRACTIONS_TOPIC.skills.length / 2);

  const lessonStatus = (id: string): NodeStatus => {
    const p = learner.lessons[id];
    if (p?.completed) return "done";
    if (rec.kind === "lesson" && rec.lessonId === id) return p && p.furthestStep > 0 ? "active" : "next";
    if (p && p.furthestStep > 0) return "active";
    return "upcoming";
  };
  const practiceStatus: NodeStatus = practiceMet ? "done" : rec.kind === "practice" ? "next" : practiced > 0 ? "active" : "upcoming";
  const a = learner.assessment;
  const review = FRACTIONS_TOPIC.skills.map((sk) => skillMastery(sk.id, learner.results)).filter((m) => m.status === "needs-review");
  const assessStatus: NodeStatus =
    a.status === "in-progress"
      ? "active"
      : a.last && review.length === 0
        ? "done"
        : a.last || rec.kind === "assessment" || rec.kind === "recheck"
          ? "next"
          : "upcoming";
  const lastScore = a.last ? Object.values(a.last.evaluations).filter((e) => e.correct).length : 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div>
        <header className="mb-6">
          <p className="eyebrow">Fractions</p>
          <h1 className="display text-3xl font-semibold sm:text-4xl">Your learning journey</h1>
          <p className="mt-2 max-w-xl text-ink-2">
            {LESSONS.length} short lessons take you from “what is a whole?” to solving fraction problems and explaining your thinking. Then practise until
            you&apos;re secure, and show your mastery. This is the fractions foundations module — later modules will extend it.
          </p>
        </header>

        <ol className="relative space-y-3">
          <span className="absolute bottom-6 left-[1.2rem] top-6 w-0.5 bg-line" aria-hidden />
          {LESSONS.map((l, i) => {
            const status = lessonStatus(l.id);
            const p = learner.lessons[l.id];
            const stepsDone = p?.completed ? l.steps.length : p?.furthestStep ?? 0;
            return (
              <motion.li
                key={l.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="relative flex gap-4"
              >
                <Node status={status} index={i + 1} />
                <div className={`card flex-1 p-4 sm:p-5 ${status === "next" || status === "active" ? "ring-1 ring-ink/15" : ""}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full bg-sunk px-2 py-0.5 font-semibold text-ink-2">{l.phase}</span>
                        <span className="text-muted">
                          {l.minutes} min · {l.steps.length} steps
                        </span>
                        <span className={status === "done" ? "font-medium text-ok" : status === "next" ? "font-medium text-den" : "text-muted"}>
                          {STATUS_TEXT[status]}
                        </span>
                      </p>
                      <h2 className="mt-1.5 text-lg font-semibold">{l.title}</h2>
                      <p className="text-sm text-ink-2">{l.summary}</p>
                    </div>
                    <Link
                      href={status === "done" ? routes.lesson(l.id, 0) : routes.lesson(l.id)}
                      className={buttonClass(status === "next" || status === "active" ? "primary" : "secondary", "md", "shrink-0")}
                    >
                      {status === "done" ? "Review" : status === "active" ? "Continue" : "Start"}
                      <span className="sr-only"> {l.title}</span>
                    </Link>
                  </div>
                  {status === "active" && <ProgressBar value={stepsDone / l.steps.length} label={`${l.title} progress`} className="mt-3" />}
                </div>
              </motion.li>
            );
          })}

          <li className="relative flex gap-4">
            <Node status={practiceStatus} index={LESSONS.length + 1} />
            <div className={`card flex-1 p-4 sm:p-5 ${practiceStatus === "next" ? "ring-1 ring-ink/15" : ""}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="flex items-center gap-2 text-xs">
                    <span className="rounded-full bg-sunk px-2 py-0.5 font-semibold text-ink-2">Practise</span>
                    <span className={practiceStatus === "done" ? "font-medium text-ok" : practiceStatus === "next" ? "font-medium text-den" : "text-muted"}>
                      {STATUS_TEXT[practiceStatus]}
                    </span>
                  </p>
                  <h2 className="mt-1.5 flex items-center gap-2 text-lg font-semibold">
                    <PracticeIcon size={18} /> Practice milestone
                  </h2>
                  <p className="text-sm text-ink-2">
                    Answer at least {PRACTICE_READY_RESULTS} practice questions and make {needStrong} skills secure.
                  </p>
                </div>
                <Link href={routes.practice()} className={buttonClass(practiceStatus === "next" ? "primary" : "secondary", "md", "shrink-0")}>
                  Practise<span className="sr-only"> (practice milestone)</span>
                </Link>
              </div>
              <div className="mt-3 grid gap-2 text-xs text-muted sm:grid-cols-2">
                <div>
                  <ProgressBar value={Math.min(1, practiced / PRACTICE_READY_RESULTS)} label="Practice questions answered" tone="den" />
                  <p className="mt-1">
                    {Math.min(practiced, PRACTICE_READY_RESULTS)} / {PRACTICE_READY_RESULTS} questions
                  </p>
                </div>
                <div>
                  <ProgressBar value={Math.min(1, strong / needStrong)} label="Skills secure" tone="ok" />
                  <p className="mt-1">
                    {Math.min(strong, needStrong)} / {needStrong} skills secure
                  </p>
                </div>
              </div>
            </div>
          </li>

          <li className="relative flex gap-4">
            <Node status={assessStatus} index={LESSONS.length + 2} />
            <div className={`card flex-1 p-4 sm:p-5 ${assessStatus === "next" || assessStatus === "active" ? "ring-1 ring-ink/15" : ""}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="flex items-center gap-2 text-xs">
                    <span className="rounded-full bg-sunk px-2 py-0.5 font-semibold text-ink-2">Master</span>
                    <span className={assessStatus === "done" ? "font-medium text-ok" : assessStatus === "next" ? "font-medium text-den" : "text-muted"}>
                      {STATUS_TEXT[assessStatus]}
                    </span>
                  </p>
                  <h2 className="mt-1.5 flex items-center gap-2 text-lg font-semibold">
                    <FlagIcon size={18} /> Mastery check
                  </h2>
                  <p className="text-sm text-ink-2">
                    {ASSESSMENT_FORMS.A.length} questions on your own — no hints — two for every skill.
                    {a.last && ` Last result: ${lastScore} / ${a.last.order.length}.`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {a.status === "in-progress" ? (
                    <Link href={routes.assessment()} className={buttonClass("primary", "md", "shrink-0")}>
                      Resume check
                    </Link>
                  ) : a.last ? (
                    <>
                      <Link href={routes.review()} className={buttonClass("secondary", "md", "shrink-0")}>
                        Review answers
                      </Link>
                      <Link href={routes.assessment()} className={buttonClass("secondary", "md", "shrink-0")}>
                        Retake check
                      </Link>
                    </>
                  ) : (
                    <Link href={routes.assessment()} className={buttonClass(assessStatus === "next" ? "primary" : "secondary", "md", "shrink-0")}>
                      Open check
                    </Link>
                  )}
                </div>
              </div>
              {review.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-line pt-4">
                  <p className="text-sm font-medium text-num-strong">Needs review before this is complete</p>
                  <ul className="space-y-2">
                    {review.map((m) => {
                      const sk = skillById(m.skill);
                      return (
                        <li key={m.skill} className="flex flex-col gap-2 rounded-xl bg-paper p-3 sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-sm">{sk.title}</span>
                          <span className="flex flex-wrap gap-2">
                            <Link href={routes.lesson(sk.lessonId)} className={buttonClass("ghost", "md")}>
                              Lesson<span className="sr-only">: {sk.title}</span>
                            </Link>
                            <Link href={routes.practice(m.skill)} className={buttonClass("secondary", "md")}>
                              Practise<span className="sr-only"> {sk.title}</span>
                            </Link>
                            <Link href={routes.recheck(m.skill)} className={buttonClass("secondary", "md")}>
                              Recheck<span className="sr-only"> {sk.title}</span>
                            </Link>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </li>
        </ol>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="card p-5">
          <h2 className="font-semibold">How you&apos;ll learn</h2>
          <p className="mt-1 text-sm text-ink-2">Every topic follows the same path, so understanding comes before testing.</p>
          <ol className="mt-4 space-y-3">
            {phaseStatuses(learner).map(({ phase, status }, i) => (
              <li key={phase} className="flex gap-3">
                <span
                  className={`grid size-6 shrink-0 place-items-center rounded-full text-[0.7rem] font-semibold ${
                    status === "done" ? "bg-ok text-white" : status === "current" ? "bg-ink text-white" : "bg-sunk text-muted"
                  }`}
                >
                  {status === "done" ? <CheckIcon size={12} /> : i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">{phase}</p>
                  <p className="text-xs text-muted">{PHASE_DESCRIPTIONS[phase]}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  );
}
