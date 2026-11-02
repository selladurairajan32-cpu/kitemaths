"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { QuestionPlayer, type ResultDraft } from "@/components/questions/QuestionPlayer";
import { Button, buttonClass } from "@/components/ui/Button";
import { ArrowRightIcon, PracticeIcon } from "@/components/ui/Icons";
import { EvidenceMeter, ProgressBar, StatusBadge } from "@/components/ui/Progress";
import { PRACTICE_SESSION_LENGTH, selectNextQuestion } from "@/engine/adaptive";
import { SECURE_MIN_EVIDENCE, skillMastery } from "@/engine/mastery";
import {
  completePracticeSession,
  dismissPracticeSummary,
  finishPracticeQuestion,
  recordResult,
  setPracticeQuestion,
  startPracticeSession,
  type LearnerState,
} from "@/engine/progress";
import { routes } from "@/lib/routes";
import { updateLearner, useHydrated, useLearner } from "@/lib/store";
import { practicePool } from "@/topics/fractions";
import { questionById } from "@/topics/fractions/questions";
import { SKILL_ORDER, SKILLS, skillById } from "@/topics/fractions/skills";
import { ScreenSkeleton } from "./DashboardScreen";

const REASON_TEXT: Record<string, string> = {
  focus: "Chosen because this skill isn't secure yet.",
  review: "A quick review of a skill you're already secure in — mixing skills helps them stick.",
  "chosen-skill": "From the skill you chose to focus on.",
};

function pickNext(s: LearnerState): LearnerState {
  if (s.practice.sessionResults >= PRACTICE_SESSION_LENGTH) return completePracticeSession(s);
  const sel = selectNextQuestion({
    questions: practicePool(s.practice.startedAt, s.results),
    skillOrder: SKILL_ORDER,
    results: s.results,
    sessionAsked: s.practice.sessionAsked,
    focusSkill: s.practice.focusSkill,
  });
  if (!sel) return completePracticeSession(s);
  return setPracticeQuestion(s, sel.question.id, sel.reason);
}

const start = (focus: string | null) =>
  updateLearner((s) => pickNext(startPracticeSession(completePracticeSession(s), focus, Date.now())));

function SkillSidebar({ learner }: { learner: LearnerState }) {
  return (
    <div className="card p-5">
      <h2 className="font-semibold">Your skills</h2>
      <ul className="mt-3 space-y-3.5">
        {SKILLS.map((s) => {
          const m = skillMastery(s.id, learner.results);
          return (
            <li key={s.id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm">{s.title}</span>
                <StatusBadge status={m.status} />
              </div>
              <EvidenceMeter count={m.recentCount} needed={SECURE_MIN_EVIDENCE} score={m.score} label={s.title} />
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        “Secure in practice” needs at least {SECURE_MIN_EVIDENCE} recent answers averaging 75% or more (right first time counts fully, right with help counts half).
        Mastery also needs the independent mastery check.
      </p>
    </div>
  );
}

function Intro({ learner, focusSkill }: { learner: LearnerState; focusSkill: string | null }) {
  const skill = focusSkill ? skillById(focusSkill) : null;
  const m = focusSkill ? skillMastery(focusSkill, learner.results) : null;
  return (
    <section className="card p-5 sm:p-8">
      <p className="eyebrow">Practice Centre</p>
      <h1 className="display mt-1 text-3xl font-semibold">{skill ? `Practise: ${skill.title}` : "Adaptive practice"}</h1>
      <p className="mt-2 max-w-xl text-ink-2">
        {skill
          ? `${skill.description} Up to ${PRACTICE_SESSION_LENGTH} questions on this skill, getting harder as you succeed.`
          : `Each session has up to ${PRACTICE_SESSION_LENGTH} questions. Questions get harder when you're flying and easier when something's tricky — and if you get stuck, you'll get help that fits your answer.`}
      </p>
      {m?.status === "needs-review" && (
        <p className="mt-3 max-w-xl rounded-xl bg-num-soft px-4 py-3 text-sm text-ink-2">
          Your mastery check showed this skill needs another look. Practise until it feels strong, then take a short{" "}
          <Link href={routes.recheck(focusSkill!)} className="font-medium text-den underline">
            recheck
          </Link>{" "}
          to update it.
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button size="lg" onClick={() => start(focusSkill)}>
          <PracticeIcon size={18} /> {skill ? `Start practising ${skill.title.toLowerCase()}` : "Start mixed practice"}
        </Button>
        {skill && (
          <Link href={routes.lesson(skill.lessonId)} className={buttonClass("secondary", "lg")}>
            Revisit the lesson
          </Link>
        )}
      </div>

      <nav aria-label="Choose what to practise" className="mt-8">
        <p className="mb-2 text-sm font-medium">{skill ? "Practise something else" : "Or focus on one skill"}</p>
        <ul className="flex flex-wrap gap-2">
          {[{ id: null as string | null, title: "Mixed (recommended)" }, ...SKILLS].map((s) => {
            const active = focusSkill === s.id;
            return (
              <li key={s.id ?? "mixed"}>
                <Link
                  href={routes.practice(s.id)}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex h-11 items-center rounded-full border px-4 text-sm font-medium transition-colors ${
                    active ? "border-ink bg-ink text-white" : "border-line-strong bg-surface hover:bg-sunk"
                  }`}
                >
                  {s.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {learner.practice.sessionsCompleted > 0 && (
        <p className="mt-4 text-sm text-muted">
          {learner.practice.sessionsCompleted} session{learner.practice.sessionsCompleted === 1 ? "" : "s"} completed so far.
        </p>
      )}
    </section>
  );
}

function SwitchSession({ learner, focusSkill }: { learner: LearnerState; focusSkill: string }) {
  const current = learner.practice.focusSkill ? skillById(learner.practice.focusSkill).title : "mixed";
  return (
    <section className="card p-5 sm:p-8">
      <p className="eyebrow">Practice Centre</p>
      <h1 className="display mt-1 text-3xl font-semibold">Practise: {skillById(focusSkill).title}</h1>
      <p className="mt-3 max-w-xl text-ink-2">
        You have an unfinished {current} practice session ({learner.practice.sessionResults} of {PRACTICE_SESSION_LENGTH} questions answered). The answers
        you&apos;ve already given are saved either way.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button size="lg" onClick={() => start(focusSkill)}>
          Start {skillById(focusSkill).title.toLowerCase()} instead <ArrowRightIcon size={18} />
        </Button>
        <Link href={routes.practice(learner.practice.focusSkill)} className={buttonClass("secondary", "lg")}>
          Continue my {current} session
        </Link>
      </div>
    </section>
  );
}

function Summary({ learner }: { learner: LearnerState }) {
  const started = learner.practice.startedAt ?? 0;
  const session = learner.results.filter((r) => r.context === "practice" && r.at >= started);
  const first = session.filter((r) => r.firstTry).length;
  const supported = session.filter((r) => r.correct && !r.firstTry).length;
  const notYet = session.filter((r) => !r.correct).length;
  const skills = [...new Set(session.map((r) => r.skill))];
  return (
    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card p-5 sm:p-8">
      <p className="eyebrow">Session complete</p>
      <h1 className="display mt-1 text-3xl font-semibold" tabIndex={-1} ref={(el) => el?.focus()}>
        Nice work!
      </h1>
      <p className="mt-1 text-sm text-muted">
        {session.length} question{session.length === 1 ? "" : "s"} in this session.
      </p>
      <dl className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-ok-soft p-4">
          <dt className="text-xs text-ok">Right first time</dt>
          <dd className="text-3xl font-semibold tabular-nums">{first}</dd>
        </div>
        <div className="rounded-2xl bg-den-soft p-4">
          <dt className="text-xs text-den-strong">Right with help</dt>
          <dd className="text-3xl font-semibold tabular-nums">{supported}</dd>
        </div>
        <div className="rounded-2xl bg-sunk p-4">
          <dt className="text-xs text-muted">Still learning</dt>
          <dd className="text-3xl font-semibold tabular-nums">{notYet}</dd>
        </div>
      </dl>
      {skills.length > 0 && (
        <>
          <h2 className="mt-6 text-sm font-medium">Skills you practised</h2>
          <ul className="mt-2 divide-y divide-line">
            {skills.map((id) => (
              <li key={id} className="flex items-center justify-between py-2.5 text-sm">
                {skillById(id).title}
                <StatusBadge status={skillMastery(id, learner.results).status} />
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        <Button size="lg" onClick={() => start(learner.practice.focusSkill)}>
          Another session <ArrowRightIcon size={18} />
        </Button>
        <Button variant="secondary" size="lg" onClick={() => updateLearner(dismissPracticeSummary)}>
          Choose a different focus
        </Button>
        <Link href={routes.results()} className={buttonClass("ghost", "lg")}>
          See my results
        </Link>
      </div>
    </motion.section>
  );
}

export function PracticeScreen({ focusSkill = null }: { focusSkill?: string | null }) {
  const hydrated = useHydrated();
  const learner = useLearner();
  if (!hydrated) return <ScreenSkeleton />;

  const { practice } = learner;
  const current = practice.current ? questionById(practice.current) : null;
  const usedFollowUps = learner.results.filter((r) => r.context === "followup").map((r) => r.questionId);
  const active = practice.active && !!current;
  const sameFocus = (practice.focusSkill ?? null) === (focusSkill ?? null);
  const showSummary = !focusSkill && !practice.active && practice.startedAt !== null && practice.sessionResults > 0;

  const onComplete = (r: ResultDraft) => {
    updateLearner((s) => (s.practice.current === r.questionId ? pickNext(finishPracticeQuestion(s, { ...r, at: Date.now() })) : s));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  let main: React.ReactNode;
  if (active && (!focusSkill || sameFocus)) {
    main = (
      <section className="card p-5 sm:p-8" aria-labelledby="practice-heading">
        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 id="practice-heading" className="text-sm font-medium text-muted">
              Practice · Question {Math.min(practice.sessionResults + 1, PRACTICE_SESSION_LENGTH)} of {PRACTICE_SESSION_LENGTH}
              <span className="mx-2 text-line-strong">·</span>
              <span className="text-ink">{skillById(current!.skill).title}</span>
            </h1>
            <button
              type="button"
              onClick={() => updateLearner(completePracticeSession)}
              className="h-11 rounded-lg px-3 text-sm text-muted hover:bg-sunk hover:text-ink"
            >
              End session
            </button>
          </div>
          <ProgressBar value={practice.sessionResults / PRACTICE_SESSION_LENGTH} label="Session progress" />
          {practice.currentReason && <p className="text-xs text-muted">{REASON_TEXT[practice.currentReason]}</p>}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={current!.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
            <QuestionPlayer
              question={current!}
              context="practice"
              index={practice.sessionResults}
              usedFollowUps={usedFollowUps}
              orderKey={`practice:${practice.startedAt}`}
              autoFocus={practice.sessionResults > 0}
              onComplete={onComplete}
              onFollowUpResult={(r) => updateLearner((s) => recordResult(s, { ...r, at: Date.now() }))}
              continueLabel={practice.sessionResults + 1 >= PRACTICE_SESSION_LENGTH ? "Finish session" : "Next question"}
            />
          </motion.div>
        </AnimatePresence>
      </section>
    );
  } else if (active && focusSkill) {
    main = <SwitchSession learner={learner} focusSkill={focusSkill} />;
  } else if (showSummary) {
    main = <Summary learner={learner} />;
  } else {
    main = <Intro learner={learner} focusSkill={focusSkill} />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">{main}</div>
      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <SkillSidebar learner={learner} />
      </aside>
    </div>
  );
}
