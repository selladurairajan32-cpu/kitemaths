"use client";

import { AnimatePresence, motion } from "motion/react";
import { PaperIcon } from "@/components/paper/PaperIcon";
import Link from "next/link";
import { Confetti, StarGlyph } from "@/components/kid/Celebrate";
import { Kip, KipSays } from "@/components/kid/Kip";
import { KID_STATUS } from "@/components/kid/kidText";
import { QuestionPlayer, type ResultDraft } from "@/components/questions/QuestionPlayer";
import { Button, buttonClass } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { PRACTICE_SESSION_LENGTH, selectNextQuestion } from "@/engine/adaptive";
import { skillMastery } from "@/engine/mastery";
import {
  completePracticeSession,
  dismissPracticeSummary,
  finishPracticeQuestion,
  recordResult,
  setPracticeQuestion,
  startPracticeSession,
  type TopicLearner,
} from "@/engine/progress";
import { starsForResult } from "@/engine/rewards";
import { playSound } from "@/lib/sound";
import { updateTopic, useHydrated } from "@/lib/store";
import { useTopicState } from "@/topics/context";
import type { TopicModule } from "@/topics/types";

function pickNext(topic: TopicModule, s: TopicLearner): TopicLearner {
  if (s.practice.sessionResults >= PRACTICE_SESSION_LENGTH) return completePracticeSession(s);
  const sel = selectNextQuestion({
    questions: topic.practicePool(s.practice.startedAt, s.results),
    skillOrder: topic.skills.map((k) => k.id),
    results: s.results,
    sessionAsked: s.practice.sessionAsked,
    focusSkill: s.practice.focusSkill,
  });
  if (!sel) return completePracticeSession(s);
  return setPracticeQuestion(s, sel.question.id, sel.reason);
}

const start = (topic: TopicModule, focus: string | null) => {
  playSound("tap");
  updateTopic(topic.id, (s) => pickNext(topic, startPracticeSession(completePracticeSession(s), focus, Date.now())));
};

const sessionResults = (learner: TopicLearner) => {
  const started = learner.practice.startedAt ?? 0;
  return learner.results.filter((r) => (r.context === "practice" || r.context === "followup") && r.at >= started);
};

function SkillPicker({ focusSkill }: { focusSkill: string | null }) {
  const { topic, learner, links } = useTopicState();
  return (
    <nav aria-label="Choose what to practise" className="card p-5 sm:p-6">
      <h2 className="display text-xl">Pick a power-up</h2>
      <p className="text-sm text-muted">Practise one skill, or mix them all.</p>
      <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
        <li className="sm:col-span-2">
          <Link
            href={links.practice()}
            aria-current={focusSkill === null ? "page" : undefined}
            className={`flex items-center gap-3 rounded-2xl border-2 p-3 transition-colors ${
              focusSkill === null ? "border-brand bg-brand-soft" : "border-line bg-surface hover:bg-sunk"
            }`}
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand to-sky text-xl" aria-hidden>
              <PaperIcon name="dice" size={28} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">Mixed challenge</span>
              <span className="block text-xs text-muted">Kip picks what helps you most</span>
            </span>
          </Link>
        </li>
        {topic.skills.map((s) => {
          const active = focusSkill === s.id;
          const st = KID_STATUS[skillMastery(s.id, learner.results).status];
          const look = topic.lessonLook(s.lessonId);
          return (
            <li key={s.id}>
              <Link
                href={links.practice(s.id)}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-2xl border-2 p-3 transition-colors ${active ? "border-brand bg-brand-soft" : "border-line bg-surface hover:bg-sunk"}`}
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl text-xl" style={{ background: look.soft }} aria-hidden>
                  <PaperIcon name={look.icon} size={32} />
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold leading-tight">{s.title}</span>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[0.7rem] font-bold ${st.cls}`}>{st.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Intro({ focusSkill }: { focusSkill: string | null }) {
  const { topic, learner, links } = useTopicState();
  const skill = focusSkill ? topic.skillById(focusSkill) : null;
  const m = focusSkill ? skillMastery(focusSkill, learner.results) : null;
  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-ok-bright via-[#2bc49a] to-mint p-5 text-white shadow-[0_6px_0_#139656] sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Kip mood="cheer" size={88} />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold uppercase tracking-wide text-white/85">Practice arena</p>
            <h1 className="display text-3xl leading-tight sm:text-4xl">{skill ? skill.title : "Mixed challenge"}</h1>
            <p className="mt-1 max-w-xl text-white/90">
              {PRACTICE_SESSION_LENGTH} questions. They get trickier as you get stronger — and if you get stuck, Kip helps. Win up to{" "}
              <strong>{PRACTICE_SESSION_LENGTH * 3} stars</strong>!
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button variant="sun" size="xl" onClick={() => start(topic, focusSkill)}>
                Play! <ArrowRightIcon size={20} />
              </Button>
              {skill && (
                <Link href={links.lesson(skill.lessonId)} className="inline-flex h-15 items-center rounded-[1.25rem] px-5 font-semibold text-white/95 hover:bg-white/15">
                  Watch the lesson again
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {m?.status === "needs-review" && (
        <KipSays mood="think" tone="sun" speak="Practise until this feels strong, then try a quick recheck.">
          Practise until this feels strong, then try a quick{" "}
          <Link href={links.recheck(focusSkill!)} className="font-semibold text-brand underline">
            recheck
          </Link>
          .
        </KipSays>
      )}

      <SkillPicker focusSkill={focusSkill} />
    </div>
  );
}

function SwitchSession({ focusSkill }: { focusSkill: string }) {
  const { topic, learner, links } = useTopicState();
  const current = learner.practice.focusSkill ? topic.skillById(learner.practice.focusSkill).title : "mixed";
  return (
    <section className="card mx-auto max-w-2xl p-5 sm:p-8">
      <KipSays mood="think">
        You&apos;re part-way through a <strong>{current}</strong> game ({learner.practice.sessionResults} of {PRACTICE_SESSION_LENGTH}). Your answers are
        saved either way.
      </KipSays>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Button size="xl" onClick={() => start(topic, focusSkill)}>
          Play {topic.skillById(focusSkill).title.toLowerCase()} <ArrowRightIcon size={20} />
        </Button>
        <Link href={links.practice(learner.practice.focusSkill)} className={buttonClass("secondary", "xl")}>
          Finish my {current} game
        </Link>
      </div>
    </section>
  );
}

function Summary() {
  const { topic, learner, update } = useTopicState();
  const results = sessionResults(learner);
  const session = results.filter((r) => r.context === "practice");
  const stars = results.reduce((n, r) => n + starsForResult(r), 0);
  const first = session.filter((r) => r.firstTry).length;
  const supported = session.filter((r) => r.correct && !r.firstTry).length;
  const notYet = session.filter((r) => !r.correct).length;
  const great = session.length > 0 && first / session.length >= 0.7;
  return (
    <motion.section initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="card relative mx-auto max-w-2xl p-6 text-center sm:p-10">
      <Confetti burstKey={`practice-${learner.practice.startedAt}`} pieces={60} />
      <div className="flex justify-center">
        <Kip mood="cheer" size={104} />
      </div>
      <h1 className="display mt-2 text-3xl sm:text-4xl" tabIndex={-1} ref={(el) => el?.focus()}>
        {great ? "Superstar session!" : "Great effort!"}
      </h1>
      <p className="mt-1 text-ink-2">
        You answered {session.length} question{session.length === 1 ? "" : "s"}.
      </p>
      <motion.p
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.25, type: "spring", stiffness: 300, damping: 13 }}
        className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-sun px-5 py-2.5 text-2xl font-bold text-ink shadow-[0_4px_0_var(--color-sun-strong)]"
      >
        +{stars} <StarGlyph size={28} />
      </motion.p>
      <dl className="mt-6 grid grid-cols-3 gap-3 text-left">
        <div className="rounded-3xl bg-ok-soft p-4">
          <dt className="text-xs font-semibold text-ok">First try</dt>
          <dd className="display text-3xl tabular-nums">{first}</dd>
        </div>
        <div className="rounded-3xl bg-sky-soft p-4">
          <dt className="text-xs font-semibold text-den-strong">With a little help</dt>
          <dd className="display text-3xl tabular-nums">{supported}</dd>
        </div>
        <div className="rounded-3xl bg-sun-soft p-4">
          <dt className="text-xs font-semibold text-warn">Still growing</dt>
          <dd className="display text-3xl tabular-nums">{notYet}</dd>
        </div>
      </dl>
      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <Button variant="go" size="xl" onClick={() => start(topic, learner.practice.focusSkill)}>
          Play again <ArrowRightIcon size={20} />
        </Button>
        <Button variant="secondary" size="xl" onClick={() => update(dismissPracticeSummary)}>
          Pick a different game
        </Button>
      </div>
    </motion.section>
  );
}

export function PracticeScreen({ focusSkill = null }: { focusSkill?: string | null }) {
  const hydrated = useHydrated();
  const { topic, learner, update } = useTopicState();
  if (!hydrated) return <ScreenSkeleton />;

  const { practice } = learner;
  const current = practice.current ? topic.questionById(practice.current) : null;
  const usedFollowUps = learner.results.filter((r) => r.context === "followup").map((r) => r.questionId);
  const active = practice.active && !!current;
  const sameFocus = (practice.focusSkill ?? null) === (focusSkill ?? null);
  const showSummary = !focusSkill && !practice.active && practice.startedAt !== null && practice.sessionResults > 0;

  const onComplete = (r: ResultDraft) => {
    update((s) => (s.practice.current === r.questionId ? pickNext(topic, finishPracticeQuestion(s, { ...r, at: Date.now() })) : s));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (active && (!focusSkill || sameFocus)) {
    const sessionStars = sessionResults(learner).reduce((n, r) => n + starsForResult(r), 0);
    const done = practice.sessionResults;
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl text-xl" style={{ background: topic.lessonLook(topic.skillById(current!.skill).lessonId).soft }} aria-hidden>
            <PaperIcon name={topic.lessonLook(topic.skillById(current!.skill).lessonId).icon} size={32} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 id="practice-heading" className="flex items-center justify-between gap-2 text-sm font-semibold text-muted">
              <span className="truncate">
                <span className="text-ink">{topic.skillById(current!.skill).title}</span>
                <span className="sr-only">
                  {" "}
                  · Question {Math.min(done + 1, PRACTICE_SESSION_LENGTH)} of {PRACTICE_SESSION_LENGTH}
                </span>
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sun-soft px-2.5 py-0.5 font-bold text-ink">
                {sessionStars} <StarGlyph size={15} />
              </span>
            </h1>
            <ol className="mt-1.5 flex gap-1" aria-hidden>
              {Array.from({ length: PRACTICE_SESSION_LENGTH }, (_, i) => (
                <li key={i} className={`h-2.5 flex-1 rounded-full transition-colors ${i < done ? "bg-ok-bright" : i === done ? "bg-brand" : "bg-line"}`} />
              ))}
            </ol>
          </div>
        </div>
        <section className="card p-5 sm:p-8" aria-labelledby="practice-heading">
          <AnimatePresence mode="wait">
            <motion.div key={current!.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.22 }}>
              <QuestionPlayer
                question={current!}
                context="practice"
                index={done}
                usedFollowUps={usedFollowUps}
                orderKey={`practice:${practice.startedAt}`}
                autoFocus={done > 0}
                onComplete={onComplete}
                onFollowUpResult={(r) => update((s) => recordResult(s, { ...r, at: Date.now() }))}
                continueLabel={done + 1 >= PRACTICE_SESSION_LENGTH ? "Finish!" : "Next"}
              />
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    );
  }
  if (active && focusSkill) return <SwitchSession focusSkill={focusSkill} />;
  if (showSummary) return <Summary />;
  return <Intro focusSkill={focusSkill} />;
}
