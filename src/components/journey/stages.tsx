"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { AttemptRunner } from "@/components/questions/AttemptRunner";
import { QuestionPlayer } from "@/components/questions/QuestionPlayer";
import { independentResults } from "@/components/screens/AssessmentScreen";
import { recheckPlan } from "@/components/screens/RecheckScreen";
import { KipSays } from "@/components/kid/Kip";
import { Pic } from "@/components/paper/Pic";
import { Button, buttonClass } from "@/components/ui/Button";
import { ArrowRightIcon, CheckIcon, RefreshIcon } from "@/components/ui/Icons";
import { StatusBadge } from "@/components/ui/Progress";
import { skillMastery } from "@/engine/mastery";
import { answerRecheck, finishRecheck, recordResult, setRecheckIndex, startRecheck } from "@/engine/progress";
import { starsForResult } from "@/engine/rewards";
import { strandSummary, type JourneyProgress, type Strand } from "@/engine/topicJourney";
import { useTopicState } from "@/topics/context";
import { genId } from "@/topics/kit/define";
import type { JourneyDef, JourneyQuestion, PractiseLevel } from "@/topics/kit/journeys";

/**
 * D-043 stages 2 to 5 of the topic journey: Practise and Apply (one question at a time, from the island's own question
 * makers, marked and hinted as in practice, with Method and Why to hand), Check understanding (the MAST-001 recheck:
 * new questions, no hints, feedback at the end) and Complete (the island's mastery level and this journey's strands).
 */

const LEVELS: Record<PractiseLevel, string> = { guided: "Guided", build: "Build skill", challenge: "Challenge" };
const STRANDS: Record<Strand, { label: string; blurb: string }> = {
  concept: { label: "Concept", blurb: "Do you know the idea?" },
  application: { label: "Application", blurb: "Can you use it in real life?" },
  reasoning: { label: "Reasoning", blurb: "Can you explain why?" },
};

/** The question for place `i` in a list, the same every time for this journey. */
export const journeyQuestionId = (def: JourneyDef, list: JourneyQuestion[], i: number, startedAt: number, salt: number) =>
  genId(def.topicId, list[i]!.key, list[i]!.difficulty, (startedAt % 99991) + salt + i * 7 + 1);

export function QuestionStage({ def, list, done, startedAt, kind, onAnswered }: { def: JourneyDef; list: JourneyQuestion[]; done: number; startedAt: number; kind: "practise" | "apply"; onAnswered: () => void }) {
  const { topic, learner, update } = useTopicState();
  const [help, setHelp] = useState<"method" | "why" | null>(null);
  if (done >= list.length) {
    return (
      <KipSays mood="cheer" tone="sky">
        <p className="text-lg font-bold">{kind === "practise" ? `Great practice! You answered all ${list.length} questions.` : "You used it in real life. Brilliant!"}</p>
        <p className="text-body">{kind === "practise" ? "Next, use it to solve real-life problems." : "Next, show what you know in the understanding check."}</p>
      </KipSays>
    );
  }
  const item = list[done]!;
  const q = topic.questionById(journeyQuestionId(def, list, done, startedAt, kind === "apply" ? 500 : 0));
  const strand = def.strands[item.key];
  const usedFollowUps = learner.results.filter((r) => r.context === "followup").map((r) => r.questionId);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {kind === "practise" ? (
          <ol className="m-0 flex list-none gap-2 p-0" aria-label="Practice levels">
            {(Object.keys(LEVELS) as PractiseLevel[]).map((l) => (
              <li key={l} aria-current={item.level === l ? "step" : undefined} className={`rounded-full px-4 py-2 text-label font-bold ${item.level === l ? "bg-brand text-on-brand" : "bg-sunk text-ink-2"}`}>
                {LEVELS[l]}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-label font-bold text-ink-2">Real-life problems</p>
        )}
        <p className="text-label font-bold text-ink-2">
          Question {done + 1} of {list.length}
        </p>
      </div>
      <ol className="m-0 flex list-none gap-1 p-0" aria-hidden>
        {list.map((_, i) => (
          <li key={i} className={`h-2.5 flex-1 rounded-full ${i < done ? "bg-ok-bright" : i === done ? "bg-brand" : "bg-line"}`} />
        ))}
      </ol>
      <div className="flex flex-wrap items-center gap-2">
        {strand && <span className="rounded-full bg-sky-soft px-3 py-1 text-label font-bold text-ink">{STRANDS[strand].label}</span>}
        <span className="flex-1" />
        {(["method", "why"] as const).map((h) => (
          <button key={h} type="button" aria-expanded={help === h} onClick={() => setHelp(help === h ? null : h)} className={`min-h-11 rounded-full border-2 px-4 text-label font-bold ${help === h ? "border-brand bg-brand-soft text-brand-strong" : "border-line bg-surface text-ink hover:border-brand"}`}>
            {h === "method" ? "Method" : "Why?"}
          </button>
        ))}
      </div>
      {help === "method" && (
        <ol className="m-0 flex list-decimal flex-col gap-1.5 rounded-[18px] bg-sky-soft p-4 pl-9 text-body font-semibold text-ink">
          {def.method.map((m) => <li key={m}>{m}</li>)}
        </ol>
      )}
      {help === "why" && <p className="rounded-[18px] bg-sun-soft p-4 text-body font-semibold text-ink">{def.why}</p>}
      <section className="rounded-[24px] border border-line bg-surface p-4 sm:p-6" aria-label={`Question ${done + 1}`}>
        <QuestionPlayer
          key={q.id}
          question={q}
          context="practice"
          index={done}
          usedFollowUps={usedFollowUps}
          autoHint={item.level === "guided"}
          orderKey={`journey:${startedAt}`}
          autoFocus={done > 0}
          onComplete={(r) => { update((s) => recordResult(s, { ...r, at: Date.now() })); onAnswered(); }}
          onFollowUpResult={(r) => update((s) => recordResult(s, { ...r, at: Date.now() }))}
          continueLabel={done + 1 >= list.length ? "Finish" : "Next question"}
        />
      </section>
    </div>
  );
}

/** Whether this journey's understanding check has been done. */
export function checkDone(def: JourneyDef, progress: JourneyProgress, rechecks: Record<string, { completedAt?: number | null } | undefined>) {
  return (rechecks[def.skill]?.completedAt ?? 0) >= progress.startedAt;
}

export function CheckStage({ def, progress }: { def: JourneyDef; progress: JourneyProgress }) {
  const { topic, learner, update } = useTopicState();
  const r = learner.recheck;
  const m = skillMastery(def.skill, learner.results);
  if (r && r.skill === def.skill) {
    return (
      <AttemptRunner
        title={`Check: ${def.title}`}
        order={r.order}
        index={r.index}
        responses={r.responses}
        orderKey={`recheck:${r.seed}`}
        onSave={(id, resp, e) => update((s) => answerRecheck(s, id, resp, e))}
        onIndex={(i) => update((s) => setRecheckIndex(s, i))}
        onFinish={() => {
          const at = Date.now();
          update((s) => (s.recheck ? finishRecheck(s, independentResults(topic, s.recheck.order, s.recheck.evaluations, "recheck", at, `recheck:${s.recheck.seed}`, s.recheck.responses), at) : s));
        }}
      />
    );
  }
  if (checkDone(def, progress, learner.rechecks) && m.assessed) {
    const all = m.assessed.correct === m.assessed.total;
    return (
      <KipSays mood={all ? "cheer" : "think"} tone={all ? "sky" : "sun"}>
        <p className="text-lg font-bold">
          You got {m.assessed.correct} of {m.assessed.total} right.
        </p>
        <p className="text-body">{all ? "That shows you really understand it." : "Nearly there. Have a look at your result, then we'll practise the tricky bit."}</p>
      </KipSays>
    );
  }
  return (
    <div className="flex flex-col items-start gap-4">
      <KipSays mood="happy" tone="sky">
        <p className="text-lg font-bold">Show what you know!</p>
        <p className="text-body">New questions on your own: no hints, and you find out how you did at the end.</p>
      </KipSays>
      {r && r.skill !== def.skill && <p className="text-body text-ink-2">Starting this check replaces an unfinished check on another skill.</p>}
      <Button
        variant="go"
        size="xl"
        onClick={() => {
          const seed = Date.now();
          update((s) => {
            const plan = recheckPlan(topic, def.skill, s);
            return startRecheck(s, def.skill, plan.order, plan.form, seed, seed);
          });
        }}
      >
        Start the check <ArrowRightIcon size={18} />
      </Button>
    </div>
  );
}

export function CompleteStage({ def, progress, onReview, onPractise }: { def: JourneyDef; progress: JourneyProgress; onReview: () => void; onPractise: () => void }) {
  const { learner, links } = useTopicState();
  const reduce = useReducedMotion();
  const m = skillMastery(def.skill, learner.results);
  const mine = learner.results.filter((r) => r.at >= progress.startedAt && r.skill === def.skill);
  const stars = mine.reduce((n, r) => n + starsForResult(r), 0);
  const strands = strandSummary(learner.results, def.skill, def.strands, progress.startedAt);
  const review = m.status === "needs-review";
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <motion.div initial={reduce ? false : { scale: 0.6, rotate: -8, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 16 }}>
        <Pic name="trophy" size={120} />
      </motion.div>
      <div className="flex flex-col items-center gap-2">
        <h2 className="display text-heading-1">{review ? "Good effort!" : "Topic complete!"}</h2>
        <p className="text-lg font-bold text-ink-2">{def.title}</p>
      </div>
      <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
        <section aria-labelledby="level-title" className="flex flex-col items-center gap-3 rounded-[24px] border border-line bg-surface p-5">
          <h3 id="level-title" className="text-title font-extrabold text-ink">Your level</h3>
          <StatusBadge status={m.status} />
          {m.assessed && <p className="text-body text-ink-2">Check: {m.assessed.correct} of {m.assessed.total} right</p>}
          <p className="text-body text-ink-2">Recent practice score: {Math.round(m.score * 100)}%</p>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-sun-soft px-3 py-1 text-body font-bold text-ink">
            {stars} <Pic name="star" size={22} /> stars earned
          </p>
        </section>
        <section aria-labelledby="strand-title" className="flex flex-col gap-3 rounded-[24px] border border-line bg-surface p-5 text-left">
          <h3 id="strand-title" className="text-title font-extrabold text-ink">How well you understand it</h3>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {(Object.keys(STRANDS) as Strand[]).filter((k) => strands[k]).map((k) => {
              const s = strands[k]!;
              const good = s.right * 2 >= s.total;
              return (
                <li key={k} className="flex items-center gap-3">
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full ${good ? "bg-ok-soft text-ok" : "bg-warn-soft text-warn"}`}>{good ? <CheckIcon size={16} strokeWidth={3} /> : <RefreshIcon size={16} />}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-body font-bold text-ink">{STRANDS[k].label}</span>
                    <span className="block text-label text-ink-2">{STRANDS[k].blurb}</span>
                  </span>
                  <span className="text-body font-bold tabular-nums text-ink">{s.right} of {s.total}</span>
                </li>
              );
            })}
          </ul>
          <p className="text-label text-ink-2">Right first time, without a hint, in this topic.</p>
        </section>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {review ? (
          <Button variant="go" size="lg" onClick={onPractise}>Practise the tricky bit <ArrowRightIcon size={18} /></Button>
        ) : (
          <Link href={links.island()} className={buttonClass("go", "lg")}>Next topic <ArrowRightIcon size={18} /></Link>
        )}
        <Button variant="secondary" size="lg" onClick={onReview}><RefreshIcon size={18} /> Review learning</Button>
      </div>
    </div>
  );
}
