"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useState } from "react";
import { CheckStage, checkDone, journeyQuestionId } from "@/components/journey/stages";
import { RichText } from "@/components/math/RichText";
import { QuestionPlayer } from "@/components/questions/QuestionPlayer";
import { Button, buttonClass } from "@/components/ui/Button";
import { ArrowRightIcon, BeakerIcon, CheckIcon, FlagIcon, RefreshIcon, StudioIcon } from "@/components/ui/Icons";
import { StatusBadge } from "@/components/ui/Progress";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { skillMastery } from "@/engine/mastery";
import { recordResult, setSettings } from "@/engine/progress";
import { canvasPhase, canvasReached, CANVAS_PHASES, cleanStreak, finishCanvasPhase, openCanvasPhase, paceAfterAnswer, startJourney, strandSummary, type JourneyProgress, type Strand } from "@/engine/topicJourney";
import { updateLearner, useHydrated, useLearner } from "@/lib/store";
import { useTopicState } from "@/topics/context";
import { canvasLessonFor } from "@/topics/kit/canvasLessons";
import { studyPlan } from "@/topics/kit/study";
import { subTopicHref } from "@/topics/overview";
import { journeyFor, type JourneyDef, type JourneyQuestion, type PractiseLevel } from "@/topics/kit/journeys";
import { CanvasShell, Dock, Phase, Say, Trail } from "./Canvas";
import type { CanvasLesson } from "./lesson";

/**
 * D-060: one concept on the lesson canvas, in six phases: Discover → Explore → Understand → Practise → Apply → Prove it,
 * then a summary. The first three are the concept's own (`CanvasLesson`). The questions, marking, hints, misconception
 * follow-ups, mastery and the check (the unchanged MAST-001 recheck) are the island's, exactly as in the topic journey,
 * and progress is saved in the same `LearnerState.journeys` entry, so a journey already started carries on here.
 */

const LEVEL: Record<PractiseLevel, string> = { guided: "With help", build: "On your own", challenge: "Harder ones" };

function Questions({ def, lesson, list, done, startedAt, kind, onAnswered, onNext }: { def: JourneyDef; lesson: CanvasLesson; list: JourneyQuestion[]; done: number; startedAt: number; kind: "practise" | "apply"; onAnswered: (done: number) => void; onNext: () => void }) {
  const { topic, learner, update } = useTopicState();
  const [note, setNote] = useState<string | null>(null);
  // Whether the last answer needed help: if so, the hands-on model opens again for the next question.
  const [struggled, setStruggled] = useState(false);
  const name = kind === "practise" ? "Practise" : "Apply";
  if (done >= list.length) {
    return (
      <Phase id={`${kind}-done`}>
        <Say eyebrow={name} title={kind === "practise" ? "You've practised it." : "You used it in real life."} text={kind === "practise" ? "Next: the same idea inside real-life problems." : "Last step: show what you know, on your own."} />
        <Dock action={<Button variant="cta" size="xl" onClick={onNext}>{kind === "practise" ? "Real-life problems" : "Prove it"} <ArrowRightIcon size={20} /></Button>} />
      </Phase>
    );
  }
  const item = list[done]!;
  const q = topic.questionById(journeyQuestionId(def, list, done, startedAt, kind === "apply" ? 500 : 0));
  const usedFollowUps = learner.results.filter((r) => r.context === "followup").map((r) => r.questionId);
  const guided = item.level === "guided";
  return (
    <Phase id={`${kind}-${done}`}>
      <div className="flex flex-col gap-3">
        <p id="phase-title" className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-label font-medium text-muted">
            <FlagIcon size={15} />
            {name}
            {item.level ? ` · ${LEVEL[item.level]}` : ""}
          </span>
          <span className="text-label font-medium text-ink">
            Question {done + 1} of {list.length}
          </span>
        </p>
        <div className="flex gap-1.5" aria-hidden>
          {list.map((_, i) => (
            <span key={i} className={`h-3 flex-1 rounded-full ${i < done ? "bg-ok-bright" : i === done ? "bg-ink" : "bg-sunk"}`} />
          ))}
        </div>
        {note && (
          <p role="status" className="rounded-[var(--radius-control)] bg-ok-soft px-4 py-3 text-body font-bold text-ink">
            {note}
          </p>
        )}
      </div>
      <QuestionPlayer
        key={q.id}
        aid={lesson.Aid && <lesson.Aid templateKey={item.key} prompt={q.prompt} open={guided || struggled} labelled={guided} />}
        question={q}
        context="practice"
        index={done}
        usedFollowUps={usedFollowUps}
        autoHint={guided}
        orderKey={`journey:${startedAt}`}
        autoFocus={done > 0}
        onComplete={(r) => {
          const clean = r.correct && r.firstTry && r.hintsUsed === 0;
          update((s) => recordResult(s, { ...r, at: Date.now() }));
          setStruggled(!clean);
          if (kind === "apply") return onAnswered(done + 1);
          // Evidence for pace: clean answers in a row, counted within this level only.
          const inLevel = done - list.findIndex((x) => x.level === item.level) + 1;
          const streak = clean ? Math.min(cleanStreak(learner.results, def.skill, startedAt) + 1, inLevel) : 0;
          const next = paceAfterAnswer(list, def.strands, done, streak);
          setNote(next > done + 1 && next < list.length ? "Two in a row with no help. You're ready for the next level." : null);
          onAnswered(next);
        }}
        onFollowUpResult={(r) => update((s) => recordResult(s, { ...r, at: Date.now() }))}
        continueLabel={done + 1 >= list.length ? "Finish" : "Next question"}
      />
    </Phase>
  );
}

const STRANDS: Record<Strand, { label: string; yes: string; no: string }> = {
  concept: { label: "The idea", yes: "You can make the pieces match and add them.", no: "Making the pieces match needs more practice." },
  application: { label: "Real life", yes: "You can spot it inside a problem and use it.", no: "Using it inside a problem needs more practice." },
  reasoning: { label: "Explaining", yes: "You can say why the method works.", no: "Saying why it works needs another look." },
};

function Summary({ def, lesson, progress, onReview, onPractise }: { def: JourneyDef; lesson: CanvasLesson; progress: JourneyProgress; onReview: () => void; onPractise: () => void }) {
  const { learner, links } = useTopicState();
  const m = skillMastery(def.skill, learner.results);
  const strands = strandSummary(learner.results, def.skill, def.strands, progress.startedAt);
  const review = m.status === "needs-review";
  const lookBack = lesson.lookBack?.(progress.guess);
  const reduce = useReducedMotion();
  return (
    <Phase id="summary">
      <div className="flex flex-col items-center gap-2 py-2 text-center">
        <motion.span initial={reduce ? false : { scale: 0.6, rotate: -12 }} animate={{ scale: 1, rotate: 0 }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 14 }} className={`mb-3 grid size-16 place-items-center rounded-full text-white ${review ? "bg-warn" : "bg-ok"}`} aria-hidden>
          {review ? <RefreshIcon size={28} /> : <CheckIcon size={30} />}
        </motion.span>
        <p className="eyebrow">Lesson complete</p>
        <h2 id="phase-title" tabIndex={-1} className="display text-heading-1 text-ink outline-none sm:text-display-2">
          {review ? "Good work. A bit more practice will make it stick." : "You can do this now."}
        </h2>
        <p className="text-body text-ink-2">{def.title}</p>
      </div>
      {lookBack && (
        <p className="rounded-xl border border-warn/30 bg-warn-soft px-4 py-3 text-body text-ink">
          <RichText text={lookBack} />
        </p>
      )}
      <section aria-labelledby="evidence-title" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id="evidence-title" className="font-sans text-body font-semibold text-ink">What your answers show</h3>
          <StatusBadge status={m.status} />
        </div>
        <ul className="m-0 flex list-none flex-col p-0">
          {(Object.keys(STRANDS) as Strand[]).filter((k) => strands[k]).map((k) => {
            const s = strands[k]!;
            const good = s.right * 2 >= s.total;
            return (
              <li key={k} className="flex items-center gap-4 border-t border-line py-4">
                <span className={`grid size-10 shrink-0 place-items-center rounded-full ${good ? "bg-ok-soft text-ok" : "bg-warn-soft text-warn"}`}>{good ? <CheckIcon size={18} strokeWidth={3} /> : <RefreshIcon size={18} />}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-body font-medium text-ink">{STRANDS[k].label}</span>
                  <span className="block text-body text-ink-2">{good ? STRANDS[k].yes : STRANDS[k].no}</span>
                </span>
                <span className="shrink-0 text-body font-bold tabular-nums text-ink-2">
                  {s.right} of {s.total}
                </span>
              </li>
            );
          })}
          {m.assessed && (
            <li className="flex items-center gap-4 border-t border-line py-4">
              <span className={`grid size-10 shrink-0 place-items-center rounded-full ${m.assessed.correct === m.assessed.total ? "bg-ok-soft text-ok" : "bg-warn-soft text-warn"}`}>{m.assessed.correct === m.assessed.total ? <CheckIcon size={18} strokeWidth={3} /> : <RefreshIcon size={18} />}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-body font-medium text-ink">On your own</span>
                <span className="block text-body text-ink-2">New questions with no hints.</span>
              </span>
              <span className="shrink-0 text-body font-bold tabular-nums text-ink-2">
                {m.assessed.correct} of {m.assessed.total}
              </span>
            </li>
          )}
        </ul>
        {(Object.keys(STRANDS) as Strand[]).every((k) => !strands[k]) && !m.assessed && <p className="border-t border-line py-4 text-body text-ink-2">Answer the practice questions to see this.</p>}
        <p className="text-label text-muted">Counted as right when it was right first time, without a hint.</p>
      </section>
      <Dock
        action={
          <>
            <Button variant="ghost" size="lg" onClick={onReview}>
              <RefreshIcon size={18} /> See it again
            </Button>
            {review ? (
              <Button size="lg" onClick={onPractise}>
                Practise the tricky part <ArrowRightIcon size={18} />
              </Button>
            ) : (
              <Link href={links.island()} className={buttonClass("primary", "lg")}>
                Back to the topic <ArrowRightIcon size={18} />
              </Link>
            )}
          </>
        }
      >
        {review ? "Have another go at the questions, with the bars to help." : "Come back to it another day. A quick go later helps it stay."}
      </Dock>
    </Phase>
  );
}

/** The prototype's Lesson Studio header: the page title, a lesson chooser, and the switch between lessons and the free lab. */
function StudioHeader({ title, lessons, current, labHref }: { title: string; lessons: { label: string; href: string }[]; current: number; labHref: string }) {
  const router = useRouter();
  const selectId = useId();
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="eyebrow">Lesson Studio</p>
        <h1 className="display text-heading-1 sm:text-display-2">{title}</h1>
      </div>
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex min-w-0 flex-col gap-1 sm:w-72">
          <label htmlFor={selectId} className="text-label text-muted">
            Choose a lesson
          </label>
          <select id={selectId} value={current >= 0 ? lessons[current]!.href : ""} onChange={(e) => router.push(e.target.value)} className="h-11 w-full min-w-0 max-w-full rounded-xl border border-line-strong bg-surface px-3 text-label font-medium">
            {current < 0 && <option value="">Choose a lesson</option>}
            {lessons.map((l) => (
              <option key={l.href + l.label} value={l.href}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <nav aria-label="Studio view" className="inline-flex self-start rounded-xl bg-sunk p-1 sm:self-auto">
          <span aria-current="page" className="inline-flex h-11 items-center gap-1.5 rounded-lg bg-surface px-4 text-label font-medium text-ink shadow-[var(--shadow-card)]">
            <StudioIcon size={16} /> Lessons
          </span>
          <Link href={labHref} className="inline-flex h-11 items-center gap-1.5 rounded-lg px-4 text-label font-medium text-muted hover:text-ink">
            <BeakerIcon size={16} /> Free lab
          </Link>
        </nav>
      </div>
    </header>
  );
}

function CalmToggle() {
  const learner = useLearner();
  const on = !!learner.settings.reducedMotion;
  return (
    <button type="button" aria-pressed={on} onClick={() => updateLearner((s) => setSettings(s, { reducedMotion: !s.settings.reducedMotion }))} className="hidden min-h-11 items-center gap-2 rounded-xl px-3 text-label font-medium text-muted hover:bg-sunk hover:text-ink lg:inline-flex">
      <span className={`grid size-4 place-items-center rounded border ${on ? "border-ink bg-ink text-white" : "border-line-strong bg-surface"}`} aria-hidden>
        {on && <CheckIcon size={11} />}
      </span>
      Less motion
    </button>
  );
}

export function LessonCanvas({ concept }: { concept: string }) {
  const hydrated = useHydrated();
  const { topic, learner: topicLearner, links } = useTopicState();
  const learner = useLearner();
  const def = journeyFor(topic.id, concept);
  const lesson = canvasLessonFor(topic.id, concept);
  const key = `${topic.id}/${concept}`;
  const saved = learner.journeys?.[key];

  useEffect(() => {
    if (hydrated && def && !saved) updateLearner((s) => (s.journeys?.[key] ? s : { ...s, journeys: { ...s.journeys, [key]: startJourney(Date.now()) } }));
  }, [hydrated, def, saved, key]);

  if (!def || !lesson) return null;
  if (!hydrated || !saved) return <ScreenSkeleton />;
  const p: JourneyProgress = saved;
  const set = (fn: (p: JourneyProgress) => JourneyProgress) => {
    updateLearner((s) => ({ ...s, journeys: { ...s.journeys, [key]: fn(s.journeys?.[key] ?? startJourney(Date.now())) } }));
    window.scrollTo?.({ top: 0 });
  };
  const next = () => set(finishCanvasPhase);
  const phase = canvasPhase(p);
  const id = CANVAS_PHASES[phase];
  const proved = checkDone(def, p, topicLearner.rechecks);

  // The topic's lessons in teaching order (its study plan's, where it has one), as on the topic page.
  const planned = studyPlan(topic).flatMap((it) => (it.kind === "sub" ? [it.lesson] : []));
  const lessons = [...planned, ...topic.lessons.filter((l) => !planned.includes(l))];
  const skillOf = (lessonId: string) => topic.skills.find((k) => k.lessonId === lessonId)?.id;
  const here = lessons.findIndex((l) => skillOf(l.id) === def.skill);

  return (
    <CanvasShell
      studio={<StudioHeader title={topic.title} lessons={lessons.map((l, i) => ({ label: `${i + 1}. ${l.title}`, href: subTopicHref(topic.id, l.id, skillOf(l.id)) }))} current={here} labHref={links.lab()} />}
      lesson={
        <div>
          <p className="eyebrow">{here >= 0 ? `Lesson ${here + 1} of ${lessons.length} · Hands-on` : "Hands-on lesson"}</p>
          <p className="font-medium text-ink">{def.title}</p>
        </div>
      }
      trail={<Trail phase={phase} reached={canvasReached(p)} onOpen={(i) => set((x) => openCanvasPhase(x, i))} />}
      tools={<CalmToggle />}
    >
      {id === "discover" && <lesson.Discover guess={p.guess} onGuess={(guess) => set((x) => ({ ...x, guess }))} onDone={next} />}
      {id === "explore" && <lesson.Explore onDone={next} />}
      {id === "understand" && <lesson.Understand onDone={next} />}
      {id === "practise" && <Questions def={def} lesson={lesson} list={def.practise} done={p.practised} startedAt={p.startedAt} kind="practise" onAnswered={(n) => set((x) => ({ ...x, practised: n }))} onNext={next} />}
      {id === "apply" && <Questions def={def} lesson={lesson} list={def.apply} done={p.applied} startedAt={p.startedAt} kind="apply" onAnswered={(n) => set((x) => ({ ...x, applied: n }))} onNext={next} />}
      {id === "prove" && (
        <Phase id="prove">
          <Say eyebrow="Prove it · Step 6 of 6" title="Show what you know" text="New questions, on your own. No hints this time, and you find out how you did at the end." />
          <CheckStage def={def} progress={p} bare />
          {proved && (
            <Dock tone="ok" action={<Button size="lg" onClick={next}>See what you&apos;ve shown <ArrowRightIcon size={18} /></Button>}>
              That&apos;s the check done.
            </Dock>
          )}
        </Phase>
      )}
      {id === undefined && <Summary def={def} lesson={lesson} progress={p} onReview={() => set((x) => openCanvasPhase(x, 2))} onPractise={() => set((x) => ({ ...openCanvasPhase(x, 3), practised: 0 }))} />}
    </CanvasShell>
  );
}
