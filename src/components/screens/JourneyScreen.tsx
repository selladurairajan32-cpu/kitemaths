"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { RichText } from "@/components/math/RichText";
import { buttonClass } from "@/components/ui/Button";
import { CheckIcon, FlagIcon, PracticeIcon } from "@/components/ui/Icons";
import { ProgressBar } from "@/components/ui/Progress";
import { allLessonEvidence, unmetPrerequisites, type LessonEvidence } from "@/engine/evidence";
import { isPracticeMilestoneMet, phaseStatuses, practiceResultsCount, PRACTICE_READY_RESULTS, recommendNext, strongSkills } from "@/engine/journey";
import { skillMastery } from "@/engine/mastery";
import { routes as appRoutes } from "@/lib/routes";
import { useHydrated } from "@/lib/store";
import { useTopicState } from "@/topics/context";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { topicOf } from "@/topics";

type NodeStatus = "done" | "active" | "next" | "upcoming";

function Node({ status, index }: { status: NodeStatus; index: number }) {
  const cls = {
    done: "bg-ok text-white",
    active: "bg-ink text-white ring-4 ring-ink/10",
    next: "bg-surface text-ink ring-2 ring-ink",
    upcoming: "bg-surface text-muted ring-1 ring-line-strong",
  }[status];
  return (
    <span className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-full text-label font-semibold ${cls}`}>
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
  const { topic, learner, links } = useTopicState();
  const LESSONS = topic.lessons;
  const { skillById, phaseDescriptions: PHASE_DESCRIPTIONS } = topic;
  const firstForm = Object.values(topic.assessment.forms)[0] ?? [];
  const routes = { ...links, assessment: links.check, review: appRoutes.review };
  if (!hydrated) return <ScreenSkeleton />;

  const rec = recommendNext(topic, learner);
  const practiceMet = isPracticeMilestoneMet(topic, learner);
  const strong = strongSkills(topic, learner).length;
  const practiced = practiceResultsCount(topic, learner);
  const needStrong = Math.ceil(topic.skills.length / 2);

  // FR-011 AC3: a lesson is completed by independent evidence (CUR-002 §4), not by reaching its end.
  const evidence = new Map(allLessonEvidence(topic, learner).map((e) => [e.lessonId, e]));
  const lessonStatus = (id: string): NodeStatus => {
    const e = evidence.get(id)!;
    if (e.status === "evidenced") return "done";
    const isNext = (rec.kind === "lesson" && rec.lessonId === id) || (rec.kind === "practice" && !!rec.focusSkill && rec.focusSkill === e.skill);
    if (isNext) return e.status === "in-progress" ? "active" : "next";
    if (e.status === "in-progress" || e.status === "needs-evidence") return "active";
    return "upcoming";
  };
  const EVIDENCE_TEXT: Record<LessonEvidence["status"], string> = {
    evidenced: "Completed with independent evidence",
    "needs-evidence": "Finished; independent evidence still needed",
    "in-progress": "In progress",
    "not-started": "Not started",
    "needs-review": "Needs review (from the latest check)",
  };
  const VIA_TEXT: Record<NonNullable<LessonEvidence["via"]>, string> = {
    "lesson-check": "its final questions, answered first time without hints",
    practice: "a new practice question, answered first time without hints",
    "skill-status": "the skill being secure in practice or the check",
    placement: "the warm-up",
  };
  const skillName = (id: string) => topic.skills.find((s) => s.id === id)?.title ?? topicOf(id)?.skills.find((s) => s.id === id)?.title ?? id;
  const practiceStatus: NodeStatus = practiceMet ? "done" : rec.kind === "practice" && !rec.focusSkill ? "next" : practiced > 0 ? "active" : "upcoming";
  const a = learner.assessment;
  const review = topic.skills.map((sk) => skillMastery(sk.id, learner.results)).filter((m) => m.status === "needs-review");
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
          <p className="text-label font-bold text-muted">{topic.title}</p>
          <h1 className="display text-heading-2 sm:text-heading-1">Learning journey</h1>
          <p className="mt-2 max-w-xl text-ink-2">
            Lesson by lesson: what each one teaches, what it builds on, and what evidence marked it complete. {LESSONS.length} lessons, then practice
            until skills are secure, then an independent mastery check.
          </p>
        </header>

        <ol className="relative space-y-3">
          <span className="absolute bottom-6 left-[1.2rem] top-6 w-0.5 bg-line" aria-hidden />
          {LESSONS.map((l, i) => {
            const status = lessonStatus(l.id);
            const p = learner.lessons[l.id];
            const stepsDone = p?.completed ? l.steps.length : p?.furthestStep ?? 0;
            const e = evidence.get(l.id)!;
            const prereqs = e.skill ? [...(topic.skillPrerequisites?.[e.skill] ?? [])] : [];
            const unmet = unmetPrerequisites(topic, learner, l.id);
            return (
              <motion.li
                key={l.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="relative flex gap-4"
              >
                <Node status={status} index={i + 1} />
                <div className={`card min-w-0 flex-1 p-4 sm:p-5 ${status === "next" || status === "active" ? "ring-1 ring-ink/15" : ""}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-label">
                        <span className="rounded-full bg-sunk px-2 py-0.5 font-semibold text-ink-2">{l.phase}</span>
                        <span className="text-muted">
                          {l.minutes} min · {l.steps.length} steps
                        </span>
                        <span className={status === "done" ? "font-medium text-ok" : status === "next" ? "font-medium text-den" : "text-muted"}>
                          {STATUS_TEXT[status]}
                        </span>
                      </p>
                      <h2 className="mt-1.5 text-title font-extrabold">{l.title}</h2>
                      <p className="text-label text-ink-2">
                        <RichText text={l.summary} />
                      </p>
                      {e.skill && (
                        <p className="mt-1 text-label text-ink-2">
                          <span className="font-semibold">Skill outcome:</span> {skillById(e.skill).title}
                        </p>
                      )}
                      <p className="mt-1 text-label text-ink-2">
                        <span className="font-semibold">Status:</span> {EVIDENCE_TEXT[e.status]}
                        {e.via && <>, from {VIA_TEXT[e.via]}</>}.
                      </p>
                      {prereqs.length > 0 && (
                        <p className="mt-1 text-label text-ink-2">
                          <span className="font-semibold">Builds on:</span>{" "}
                          {prereqs.map((p, j) => (
                            <span key={p}>
                              {j > 0 && ", "}
                              {skillName(p)}
                              {unmet.includes(p) ? " (not secure yet)" : " ✓"}
                            </span>
                          ))}
                        </p>
                      )}
                      {unmet.length > 0 && e.status === "not-started" && (
                        <p className="mt-2 rounded-[14px] bg-sun-soft px-3 py-1.5 text-label text-ink">
                          Best after {unmet.map(skillName).join(" and ")}: this lesson uses {unmet.length > 1 ? "those skills" : "that skill"}. It is not locked;
                          the child can start it now.
                        </p>
                      )}
                    </div>
                    {e.status === "needs-evidence" && e.skill ? (
                      <Link href={routes.practice(e.skill)} className={buttonClass(status === "next" ? "primary" : "secondary", "md", "shrink-0")}>
                        Practise<span className="sr-only"> {skillById(e.skill).title}</span>
                      </Link>
                    ) : (
                      <Link
                        href={status === "done" ? routes.lesson(l.id, 0) : routes.lesson(l.id)}
                        className={buttonClass(status === "next" || status === "active" ? "primary" : "secondary", "md", "shrink-0")}
                      >
                        {status === "done" ? "Review" : e.status === "in-progress" ? "Continue" : "Start"}
                        <span className="sr-only"> {l.title}</span>
                      </Link>
                    )}
                  </div>
                  {status === "active" && <ProgressBar value={stepsDone / l.steps.length} label={`${l.title} progress`} className="mt-3" />}
                </div>
              </motion.li>
            );
          })}

          <li className="relative flex gap-4">
            <Node status={practiceStatus} index={LESSONS.length + 1} />
            <div className={`card min-w-0 flex-1 p-4 sm:p-5 ${practiceStatus === "next" ? "ring-1 ring-ink/15" : ""}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="flex items-center gap-2 text-label">
                    <span className="rounded-full bg-sunk px-2 py-0.5 font-semibold text-ink-2">Practise</span>
                    <span className={practiceStatus === "done" ? "font-medium text-ok" : practiceStatus === "next" ? "font-medium text-den" : "text-muted"}>
                      {STATUS_TEXT[practiceStatus]}
                    </span>
                  </p>
                  <h2 className="mt-1.5 flex items-center gap-2 text-title font-extrabold">
                    <PracticeIcon size={18} /> Practice milestone
                  </h2>
                  <p className="text-label text-ink-2">
                    Answer at least {PRACTICE_READY_RESULTS} practice questions and make {needStrong} skills secure.
                  </p>
                </div>
                <Link href={routes.practice()} className={buttonClass(practiceStatus === "next" ? "primary" : "secondary", "md", "shrink-0")}>
                  Practise<span className="sr-only"> (practice milestone)</span>
                </Link>
              </div>
              <div className="mt-3 grid gap-2 text-label text-muted sm:grid-cols-2">
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
            <div className={`card min-w-0 flex-1 p-4 sm:p-5 ${assessStatus === "next" || assessStatus === "active" ? "ring-1 ring-ink/15" : ""}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="flex items-center gap-2 text-label">
                    <span className="rounded-full bg-sunk px-2 py-0.5 font-semibold text-ink-2">Master</span>
                    <span className={assessStatus === "done" ? "font-medium text-ok" : assessStatus === "next" ? "font-medium text-den" : "text-muted"}>
                      {STATUS_TEXT[assessStatus]}
                    </span>
                  </p>
                  <h2 className="mt-1.5 flex items-center gap-2 text-title font-extrabold">
                    <FlagIcon size={18} /> Mastery check
                  </h2>
                  <p className="text-label text-ink-2">
                    {firstForm.length} questions answered independently, with no hints: two for every skill.
                    {a.last && ` Last result: ${lastScore} / ${a.last.order.length}.`}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {a.status === "in-progress" ? (
                    <Link href={routes.assessment()} className={buttonClass("primary", "md", "max-w-full text-center")}>
                      Resume check
                    </Link>
                  ) : a.last ? (
                    <>
                      <Link href={routes.review()} className={buttonClass("secondary", "md", "max-w-full text-center")}>
                        Review answers
                      </Link>
                      <Link href={routes.assessment()} className={buttonClass("secondary", "md", "max-w-full text-center")}>
                        Retake check
                      </Link>
                    </>
                  ) : (
                    <Link href={routes.assessment()} className={buttonClass(assessStatus === "next" ? "primary" : "secondary", "md", "max-w-full text-center")}>
                      Open check
                    </Link>
                  )}
                </div>
              </div>
              {review.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-line pt-4">
                  <p className="text-label font-medium text-num-strong">Needs review before this is complete</p>
                  <ul className="space-y-2">
                    {review.map((m) => {
                      const sk = skillById(m.skill);
                      return (
                        <li key={m.skill} className="flex flex-col gap-2 rounded-[16px] bg-paper p-3 sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-label">{sk.title}</span>
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
          <h2 className="text-title font-extrabold">What the lesson tags mean</h2>
          <p className="mt-1 text-label text-ink-2">
            Each lesson is tagged with its main purpose. Lessons move broadly from understanding to mastery, but a purpose can come up more than once, so
            the tags are not strict steps in order.
          </p>
          <ol className="mt-4 space-y-3">
            {phaseStatuses(topic, learner).map(({ phase, status }, i) => (
              <li key={phase} className="flex gap-3">
                <span
                  className={`grid size-6 shrink-0 place-items-center rounded-full text-label font-semibold ${
                    status === "done" ? "bg-ok text-white" : status === "current" ? "bg-ink text-white" : "bg-sunk text-muted"
                  }`}
                >
                  {status === "done" ? <CheckIcon size={12} /> : i + 1}
                </span>
                <div>
                  <p className="text-label font-medium">{phase}</p>
                  <p className="text-label text-muted">{PHASE_DESCRIPTIONS[phase]}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  );
}
