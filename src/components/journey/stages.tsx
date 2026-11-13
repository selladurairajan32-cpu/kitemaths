"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { AttemptRunner } from "@/components/questions/AttemptRunner";
import { QuestionPlayer } from "@/components/questions/QuestionPlayer";
import { independentResults } from "@/components/screens/AssessmentScreen";
import { recheckPlan } from "@/components/screens/RecheckScreen";
import { KipSays } from "@/components/kid/Kip";
import { Pic, type PicName } from "@/components/paper/Pic";
import { Button, buttonClass } from "@/components/ui/Button";
import { ArrowRightIcon, CheckIcon, RefreshIcon } from "@/components/ui/Icons";
import { ProgressRing, StatusBadge } from "@/components/ui/Progress";
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
const STRANDS: Record<Strand, { label: string; blurb: string; pic: PicName }> = {
  concept: { label: "Concept", blurb: "Do you know the idea?", pic: "bulb" },
  application: { label: "Application", blurb: "Can you use it in real life?", pic: "puzzle" },
  reasoning: { label: "Reasoning", blurb: "Can you explain why?", pic: "brain" },
};

/** D-046: beside the check, what it looks for (concept images). */
function HowWeCheck() {
  return (
    <section className="panel flex flex-col gap-3 self-start rounded-[24px] p-4" aria-labelledby="how-check-title">
      <h3 id="how-check-title" className="text-body font-extrabold text-ink">How we check your understanding</h3>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {(Object.keys(STRANDS) as Strand[]).map((k) => (
          <li key={k} className="flex items-center gap-3 rounded-[16px] bg-surface p-2.5">
            <Pic name={STRANDS[k].pic} size={34} />
            <span>
              <span className="block text-label font-extrabold text-ink">{STRANDS[k].label}</span>
              <span className="block text-label font-semibold text-ink-2">{STRANDS[k].blurb}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CheckPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="panel min-w-0 rounded-[28px] p-4 sm:p-6">{children}</div>
      <HowWeCheck />
    </div>
  );
}

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
  // D-046: the question on panel, with numbered progress and a side panel for Method and Why (concept images).
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="panel flex flex-col gap-3 rounded-[24px] p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {kind === "practise" ? (
              <ol className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label="Practice levels">
                {(Object.keys(LEVELS) as PractiseLevel[]).map((l) => (
                  <li key={l} aria-current={item.level === l ? "step" : undefined} className={`rounded-full px-4 py-2 text-label font-bold ${item.level === l ? "bg-brand text-on-brand shadow-[0_6px_16px_rgb(37_99_235/0.3)]" : "bg-surface text-ink-2"}`}>
                    {LEVELS[l]}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="flex items-center gap-2 text-body font-bold text-ink"><Pic name="puzzle" size={26} /> Real-life problems</p>
            )}
            <p className="text-label font-bold text-ink-2">
              Question {done + 1} of {list.length}
            </p>
          </div>
          <ol className="m-0 flex list-none items-center gap-1 p-0" aria-hidden>
            {list.map((_, i) => (
              <li key={i} className="flex flex-1 items-center gap-1 last:flex-none">
                <span className={`grid size-8 shrink-0 place-items-center rounded-full text-label font-extrabold ${i < done ? "bg-ok-bright text-white" : i === done ? "bg-brand text-on-brand ring-4 ring-brand-soft" : "bg-surface text-ink-2 ring-1 ring-line"}`}>
                  {i < done ? <CheckIcon size={15} strokeWidth={3.5} /> : i + 1}
                </span>
                {i < list.length - 1 && <span className={`h-1 flex-1 rounded-full ${i < done ? "bg-ok-bright" : "bg-line"}`} />}
              </li>
            ))}
          </ol>
        </div>
        <section aria-label={`Question ${done + 1}`}>
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
      <section className="panel flex flex-col gap-3 self-start rounded-[24px] p-4" aria-label="Help">
        <div className="flex flex-wrap items-center gap-2">
          {strand && <span className="rounded-full bg-sky-soft px-3 py-1 text-label font-bold text-ink">{STRANDS[strand].label}</span>}
          <span className="text-label font-semibold text-ink-2">{strand ? STRANDS[strand].blurb : ""}</span>
        </div>
        <div className="flex gap-2">
          {(["method", "why"] as const).map((h) => (
            <button key={h} type="button" aria-expanded={help === h} onClick={() => setHelp(help === h ? null : h)} className={`inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-full px-3 text-label font-bold shadow-[var(--shadow-card)] ${help === h ? "bg-brand text-on-brand" : "bg-surface text-ink hover:bg-brand-soft"}`}>
              <Pic name={h === "method" ? "book" : "sparkles"} size={20} />
              {h === "method" ? "Method" : "Why?"}
            </button>
          ))}
        </div>
        {help === "method" && (
          <ol className="m-0 flex list-decimal flex-col gap-1.5 rounded-[18px] bg-sun-soft p-4 pl-9 text-body font-semibold text-ink">
            {def.method.map((m) => <li key={m}>{m}</li>)}
          </ol>
        )}
        {help === "why" && <p className="rounded-[18px] bg-sun-soft p-4 text-body font-semibold text-ink">{def.why}</p>}
        {!help && (
          <div className="flex items-end gap-2">
            <Pic name="guide-point" size={64} className="shrink-0" />
            <p className="rounded-[18px] rounded-bl-[6px] bg-surface px-3 py-2 text-label font-bold text-ink">Stuck? Open the Method, or ask Why it works.</p>
          </div>
        )}
      </section>
    </div>
  );
}

/** Whether this journey's understanding check has been done. */
export function checkDone(def: JourneyDef, progress: JourneyProgress, rechecks: Record<string, { completedAt?: number | null } | undefined>) {
  return (rechecks[def.skill]?.completedAt ?? 0) >= progress.startedAt;
}

/** D-060: on the lesson canvas the check stands alone (`bare`): no side panel, and the canvas gives the introduction. */
const Bare = ({ children }: { children: React.ReactNode }) => <div className="min-w-0">{children}</div>;

export function CheckStage({ def, progress, bare = false }: { def: JourneyDef; progress: JourneyProgress; bare?: boolean }) {
  const { topic, learner, update } = useTopicState();
  const CheckLayout = bare ? Bare : CheckPanel;
  const r = learner.recheck;
  const m = skillMastery(def.skill, learner.results);
  if (r && r.skill === def.skill) {
    return (
      <CheckLayout>
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
      </CheckLayout>
    );
  }
  if (checkDone(def, progress, learner.rechecks) && m.assessed) {
    const all = m.assessed.correct === m.assessed.total;
    return (
      <CheckLayout>
        <KipSays mood={all ? "cheer" : "think"} tone={all ? "sky" : "sun"}>
          <p className="text-lg font-bold">
            You got {m.assessed.correct} of {m.assessed.total} right.
          </p>
          <p className="text-body">{all ? "That shows you really understand it." : "Nearly there. Have a look at your result, then we'll practise the tricky bit."}</p>
        </KipSays>
      </CheckLayout>
    );
  }
  return (
    <CheckLayout>
      <div className="flex flex-col items-start gap-4">
        {!bare && (
          <div className="flex items-end gap-3">
            <Pic name="guide-wave" size={96} className="shrink-0" />
            <div className="rounded-[22px] rounded-bl-[6px] bg-surface p-4 shadow-[var(--shadow-card)]">
              <p className="text-lg font-bold">Show what you know!</p>
              <p className="text-body">New questions on your own: no hints, and you find out how you did at the end.</p>
            </div>
          </div>
        )}
        {r && r.skill !== def.skill && <p className="text-body text-ink-2">Starting this check replaces an unfinished check on another skill.</p>}
        <Button
          variant="cta"
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
    </CheckLayout>
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
      <div className="relative">
        <Pic name="sparkles" size={44} className="absolute -left-12 top-2" />
        <Pic name="party" size={44} className="absolute -right-12 top-6" />
        <motion.div initial={reduce ? false : { scale: 0.6, rotate: -8, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 16 }}>
          <Pic name="trophy" size={128} />
        </motion.div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <h2 className="display text-heading-1">{review ? "Good effort!" : "Topic complete!"}</h2>
        <p className="text-lg font-bold text-ink-2">{def.title}</p>
      </div>
      <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
        <section aria-labelledby="level-title" className="panel flex flex-col items-center gap-3 rounded-[24px] p-5">
          <h3 id="level-title" className="text-title font-extrabold text-ink">Your level</h3>
          <ProgressRing value={m.score} size={120} label="Recent practice score">
            <span className="display text-heading-2 leading-none text-ink">{Math.round(m.score * 100)}%</span>
          </ProgressRing>
          <StatusBadge status={m.status} />
          {m.assessed && <p className="text-body text-ink-2">Check: {m.assessed.correct} of {m.assessed.total} right</p>}
          <p className="text-body text-ink-2">Recent practice score: {Math.round(m.score * 100)}%</p>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-sun-soft px-3 py-1 text-body font-bold text-ink">
            <Pic name="star" size={22} /> {stars} XP earned
          </p>
        </section>
        <section aria-labelledby="strand-title" className="panel flex flex-col gap-3 rounded-[24px] p-5 text-left">
          <h3 id="strand-title" className="text-title font-extrabold text-ink">How well you understand it</h3>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {(Object.keys(STRANDS) as Strand[]).filter((k) => strands[k]).map((k) => {
              const s = strands[k]!;
              const good = s.right * 2 >= s.total;
              return (
                <li key={k} className="flex flex-col gap-1.5 rounded-[16px] bg-surface p-2.5">
                  <span className="flex items-center gap-3">
                    <span className={`grid size-8 shrink-0 place-items-center rounded-full ${good ? "bg-ok-soft text-ok" : "bg-warn-soft text-warn"}`}>{good ? <CheckIcon size={16} strokeWidth={3} /> : <RefreshIcon size={16} />}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-body font-bold text-ink">{STRANDS[k].label}</span>
                      <span className="block text-label text-ink-2">{STRANDS[k].blurb}</span>
                    </span>
                    <span className="text-body font-bold tabular-nums text-ink">{s.right} of {s.total}</span>
                  </span>
                  <span className="block h-2 overflow-hidden rounded-full bg-sunk" aria-hidden>
                    <span className={`block h-full rounded-full ${good ? "bg-ok-bright" : "bg-warn"}`} style={{ width: `${s.total ? Math.round((s.right / s.total) * 100) : 0}%` }} />
                  </span>
                </li>
              );
            })}
          </ul>
          {(Object.keys(STRANDS) as Strand[]).every((k) => !strands[k]) && <p className="text-body text-ink-2">Answer the practice questions to see this.</p>}
          <p className="text-label text-ink-2">Right first time, without a hint, in this topic.</p>
        </section>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {review ? (
          <Button variant="cta" size="lg" onClick={onPractise}>Practise the tricky bit <ArrowRightIcon size={18} /></Button>
        ) : (
          <Link href={links.island()} className={buttonClass("cta", "lg")}>Next topic <ArrowRightIcon size={18} /></Link>
        )}
        <Button variant="secondary" size="lg" onClick={onReview}><RefreshIcon size={18} /> Review learning</Button>
      </div>
    </div>
  );
}
