"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Kip } from "@/components/kid/Kip";
import { ScreenHero } from "@/components/kid/ScreenHero";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/Icons";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { recordResult } from "@/engine/progress";
import { hashString, prng, seededShuffle } from "@/engine/random";
import { compareWithLast, recentUntimedAccuracy, TIMED_UNLOCK, timedRuns, timedUnlocked, type RunMessage } from "@/engine/strategyStats";
import type { ItemResult, StrategyChoice } from "@/engine/types";
import { topicRoutes } from "@/lib/routes";
import { updateTopic, useHydrated, useLearner } from "@/lib/store";
import { fittingStrategies, flawedSteps, fmt, problemText, solve, standardSteps, STRATEGIES, type Problem, type Step, type Strategy } from "@/maths/strategies";
import { fitFor, MM_SKILLS, skillOfStrategy } from "@/topics/mental-maths";

const TOPIC = "mental-maths";
const links = topicRoutes(TOPIC);
const clock = () => Date.now();
/** MM-011: one timed challenge lasts a minute. */
export const TIMED_RUN_MS = 60_000;
const ROUNDS = 5;

const record = (r: ItemResult) => updateTopic(TOPIC, (t) => recordResult(t, r));

/** A problem chosen to suit one catalogue strategy, from a seeded generator. */
function problemFor(pool: Strategy[], rand: () => number): { s: Strategy; p: Problem } {
  const s = pool[Math.floor(rand() * pool.length)];
  return { s, p: { op: s.op, nums: fitFor(s, rand, 2) } };
}

function choiceResult(session: string, index: number, s: Strategy, choice: StrategyChoice, correct: boolean, durationMs: number): ItemResult {
  return {
    id: `${choice.kind}-mm:${session}:${index}`,
    questionId: `${TOPIC}.${choice.kind}:${s.id}`,
    skill: MM_SKILLS.choose,
    context: "practice",
    correct,
    firstTry: correct,
    attempts: 1,
    hintsUsed: 0,
    misconceptions: [],
    durationMs,
    strategy: choice,
    form: choice.kind,
    at: clock(),
  };
}

/** R3: the strategy area. Compare methods, choose a method and say why, and an accuracy-first timed challenge. */
export function StrategyHubScreen() {
  const hydrated = useHydrated();
  const learner = useLearner();
  if (!hydrated) return <ScreenSkeleton />;
  const { answered, accuracy } = recentUntimedAccuracy(learner.results, TOPIC);
  const unlocked = timedUnlocked(learner.results, TOPIC);
  return (
    <div className="space-y-8">
      <ScreenHero pic="bulb" titleId="strategies-title" title="Mental maths methods" line="Find the quickest way. Then say why it works." />
      <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-4">
        <Activity href={links.strategiesRun("compare")} title="Compare the methods" line="See different ways to work it out. Spot the one that goes wrong." />
        <Activity href={links.strategiesRun("choose")} title="Choose and say why" line="Pick the best method for the numbers, then say why." />
        {unlocked ? (
          <Activity href={links.strategiesRun("timed")} title="One-minute challenge" line="As many as you can in a minute. Beat your own best." />
        ) : (
          <li className="rounded-[22px] border-2 border-dashed border-line-strong bg-surface p-5">
            <span className="block text-title font-extrabold text-ink-2">One-minute challenge</span>
            <span className="mt-1 block text-body text-ink-2">
              Opens when you&apos;ve answered {TIMED_UNLOCK.answers} mental-maths questions without a timer, with at least {Math.round(TIMED_UNLOCK.accuracy * 100)}% right. So far:{" "}
              {answered === 0 ? "none yet" : `${Math.round((accuracy ?? 0) * 100)}% right of your last ${answered}`}.
            </span>
            <Link href={links.practice()} className="mt-2 inline-flex min-h-11 items-center font-bold text-brand-strong underline underline-offset-4">
              Practise without a timer
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}

function Activity({ href, title, line }: { href: string; title: string; line: string }) {
  return (
    <li>
      <Link href={href} className="flex h-full items-center gap-4 rounded-[22px] border border-line bg-surface p-5 shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-lift)]">
        <span className="min-w-0 flex-1">
          <span className="block text-title font-extrabold text-ink">{title}</span>
          <span className="mt-1 block text-body text-ink-2">{line}</span>
        </span>
        <ArrowRightIcon size={20} className="shrink-0 text-ink-2" />
      </Link>
    </li>
  );
}

interface Method {
  id: string;
  name: string;
  steps: Step[];
  valid: boolean;
  /** For a flawed method, the step that goes wrong. */
  broken?: number;
}

/** MM-009: compare a standard method with efficient alternatives; any method that works is accepted. */
export function CompareScreen() {
  const hydrated = useHydrated();
  const [session] = useState(() => String(clock()));
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const shownAt = useRef(clock());
  if (!hydrated) return <ScreenSkeleton />;

  const rand = prng(hashString(`${session}:${round}`));
  const pool = STRATEGIES.filter((s) => standardSteps({ op: s.op, nums: s.examples[0] }) && s.op !== "÷");
  const { s, p } = problemFor(pool, rand);
  const flaw = rand() < 0.6 ? flawedSteps(s.steps(p.nums)) : null;
  const methods: Method[] = seededShuffle(
    [
      { id: "standard", name: "Written method", steps: standardSteps(p)!, valid: true },
      { id: s.id, name: s.name, steps: s.steps(p.nums), valid: true },
      ...(flaw ? [{ id: "flawed", name: "Another way", steps: flaw.steps, valid: false, broken: flaw.broken }] : []),
    ],
    `${session}:${round}:order`,
  );
  const fewest = Math.min(...methods.filter((m) => m.valid).map((m) => m.steps.length));

  if (round >= ROUNDS) return <ActivitySummary title={`${score} of ${ROUNDS} methods that work`} line="Any method that works is a good choice. Next time, look for the one with fewer steps." again={() => location.reload()} />;

  const choose = (m: Method) => {
    if (picked) return;
    setPicked(m.id);
    if (m.valid) setScore((x) => x + 1);
    record(choiceResult(session, round, s, { kind: "compare", chosen: m.id === "flawed" ? `flawed:${s.id}` : m.id, valid: m.valid }, m.valid, clock() - shownAt.current));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <p className="text-label font-semibold text-muted">Problem {round + 1} of {ROUNDS}</p>
      <h1 className="display text-heading-2 sm:text-heading-1">Work out {problemText(p)}</h1>
      <p className="text-body text-ink-2">Here are {methods.length} ways. Check each step, then pick a method that works. {flaw ? "One of them goes wrong somewhere." : ""}</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {methods.map((m, i) => {
          const reveal = picked !== null;
          return (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => choose(m)}
                disabled={reveal}
                aria-pressed={picked === m.id}
                className={`h-full w-full rounded-[22px] border-2 bg-surface p-4 text-left ${picked === m.id ? "border-brand" : "border-line"} ${reveal && !m.valid ? "border-dashed" : ""}`}
              >
                <span className="block text-label font-bold text-muted">Method {String.fromCharCode(65 + i)}</span>
                <span className="block text-title font-extrabold text-ink">{m.name}</span>
                <ol className="mt-2 space-y-1 text-body tabular-nums">
                  {m.steps.map((st, k) => (
                    <li key={k} className={reveal && m.broken === k ? "rounded-[10px] bg-retry-soft px-2 text-retry-ink" : ""}>
                      {st.text}
                      {reveal && m.broken === k && <span className="block text-label font-bold">This step {st.op === "+" ? "adds" : "takes away"}, but it should {st.op === "+" ? "take away" : "add"}.</span>}
                    </li>
                  ))}
                </ol>
                {reveal && (
                  <span className={`mt-2 inline-flex items-center gap-1.5 text-label font-bold ${m.valid ? "text-success-ink" : "text-retry-ink"}`}>
                    {m.valid ? <CheckIcon size={16} strokeWidth={3} /> : null}
                    {m.valid ? `Works: ${m.steps.length} step${m.steps.length === 1 ? "" : "s"}${m.steps.length === fewest ? ", the fewest" : ""}` : "Goes wrong"}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {picked && (
        <Feedback ok={methods.find((m) => m.id === picked)!.valid} title={methods.find((m) => m.id === picked)!.valid ? "That method works" : "Not that one"}>
          {problemText(p)} = <strong>{fmt(solve(p))}</strong>. {s.name} suits these numbers because: {s.why}
          <NextButton onClick={() => { setPicked(null); setRound((x) => x + 1); shownAt.current = clock(); }} />
        </Feedback>
      )}
    </div>
  );
}

/** MM-010: choose the method that suits the numbers, then the reason. Scored on validity and reasoning, never speed. */
export function ChooseScreen() {
  const hydrated = useHydrated();
  const [session] = useState(() => String(clock()));
  const [round, setRound] = useState(0);
  const [method, setMethod] = useState<string | null>(null);
  const [reason, setReason] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const shownAt = useRef(clock());
  if (!hydrated) return <ScreenSkeleton />;
  if (round >= ROUNDS) return <ActivitySummary title={`${score} of ${ROUNDS} with the right method and reason`} line="Choosing well comes from looking at the numbers first: near a ten, a 5 or 9, or easy factors." again={() => location.reload()} />;

  const rand = prng(hashString(`${session}:${round}`));
  // A problem with at least one method that does not suit it, so the choice is real.
  let pick = problemFor(STRATEGIES, rand);
  let wrong: Strategy[] = [];
  for (let i = 0; i < 30; i++) {
    pick = problemFor(STRATEGIES, rand);
    const fit = new Set(fittingStrategies(pick.p).map((x) => x.id));
    wrong = STRATEGIES.filter((o) => o.op === pick.s.op && !fit.has(o.id)).slice(0, 3);
    if (wrong.length) break;
  }
  const { s, p } = pick;
  const options = seededShuffle([s, ...wrong], `${session}:${round}:m`);
  const reasons = seededShuffle([s.why, ...STRATEGIES.filter((o) => o.id !== s.id && o.family !== s.family).slice(round, round + 2).map((o) => o.why)], `${session}:${round}:r`);
  const chosen = options.find((o) => o.id === method);

  const finish = (validMethod: boolean, reasonRight: boolean) => {
    const ok = validMethod && reasonRight;
    if (ok) setScore((x) => x + 1);
    record(choiceResult(session, round, s, { kind: "choose", chosen: method!, valid: validMethod, reasonRight }, ok, clock() - shownAt.current));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <p className="text-label font-semibold text-muted">Problem {round + 1} of {ROUNDS}</p>
      <h1 className="display text-heading-2 sm:text-heading-1">Which method suits {problemText(p)}?</h1>
      <fieldset className="space-y-2" disabled={method !== null}>
        <legend className="text-label font-bold text-ink">1. Pick a method</legend>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={method === o.id}
            onClick={() => {
              setMethod(o.id);
              if (o.id !== s.id) finish(false, false);
            }}
            className={`block w-full rounded-[18px] border-2 bg-surface px-4 py-3 text-left text-body ${method === o.id ? "border-brand" : "border-line"}`}
          >
            <strong>{o.name}</strong>: {o.when}
          </button>
        ))}
      </fieldset>
      {chosen && chosen.id !== s.id && (
        <Feedback ok={false} title="Not for these numbers">
          {chosen.unsuitable} <strong>{s.name}</strong> suits {problemText(p)}: {s.why}
          <NextButton onClick={() => { setMethod(null); setReason(null); setRound((x) => x + 1); shownAt.current = clock(); }} />
        </Feedback>
      )}
      {chosen && chosen.id === s.id && (
        <fieldset className="space-y-2" disabled={reason !== null}>
          <legend className="text-label font-bold text-ink">2. Why does it work?</legend>
          {reasons.map((why, i) => (
            <button
              key={i}
              type="button"
              aria-pressed={reason === i}
              onClick={() => {
                setReason(i);
                finish(true, why === s.why);
              }}
              className={`block w-full rounded-[18px] border-2 bg-surface px-4 py-3 text-left text-body ${reason === i ? "border-brand" : "border-line"}`}
            >
              {why}
            </button>
          ))}
        </fieldset>
      )}
      {chosen && chosen.id === s.id && reason !== null && (
        <Feedback ok={reasons[reason] === s.why} title={reasons[reason] === s.why ? "Right method, right reason" : "Good method! But not that reason"}>
          {reasons[reason] === s.why ? "" : `The reason is: ${s.why} `}
          {s.steps(p.nums).map((x) => x.text).join(". ")}.
          <NextButton onClick={() => { setMethod(null); setReason(null); setRound((x) => x + 1); shownAt.current = clock(); }} />
        </Feedback>
      )}
    </div>
  );
}

const RUN_TEXT: Record<RunMessage, string> = {
  first: "Your first one-minute challenge. Next time you'll be compared with this.",
  better: "Same accuracy as last time, and more right answers. Well done.",
  same: "Just like last time. Steady!",
  "more-accurate": "A bigger share right than last time. Accuracy first is the way to go.",
  "less-accurate": "A smaller share right than last time. Slow down a little: right answers matter more than many answers.",
  "more-but-less-accurate": "You answered more, but a smaller share were right. Slow down a little: right answers matter more than many answers.",
};

/** MM-011: an accuracy-first timed challenge, open only after untimed accuracy, compared only with the child's own runs. */
export function TimedStrategyScreen() {
  const hydrated = useHydrated();
  const learner = useLearner();
  const [session, setSession] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [left, setLeft] = useState(TIMED_RUN_MS);
  const [done, setDone] = useState(false);
  const [last, setLast] = useState<null | boolean>(null);
  const shownAt = useRef(0);
  const startedAt = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!session || done) return;
    const id = setInterval(() => {
      const l = TIMED_RUN_MS - (clock() - startedAt.current);
      setLeft(l);
      if (l <= 0) {
        clearInterval(id);
        setDone(true);
      }
    }, 250);
    return () => clearInterval(id);
  }, [session, done]);

  useEffect(() => {
    if (session && !done) inputRef.current?.focus();
  }, [session, index, done]);

  if (!hydrated) return <ScreenSkeleton />;
  if (!timedUnlocked(learner.results, TOPIC))
    return <ActivitySummary title="Not open yet" line={`Answer ${TIMED_UNLOCK.answers} questions without a timer first, getting most right.`} />;

  if (done && session) {
    const cmp = compareWithLast(timedRuns(learner.results, TOPIC));
    const run = cmp?.last;
    return (
      <section className="card mx-auto max-w-2xl space-y-4 p-6 sm:p-10">
        <h1 className="display text-heading-2 sm:text-heading-1">{run ? `${run.correct} right out of ${run.answered}` : "No answers this time"}</h1>
        {run && <p className="text-title font-extrabold text-ink-2">{Math.round(run.accuracy * 100)}% right</p>}
        {cmp && <p className="text-body text-ink-2">{RUN_TEXT[cmp.message]}</p>}
        {cmp?.previous && (
          <p className="text-label text-muted">
            Last time: {cmp.previous.correct} right out of {cmp.previous.answered} ({Math.round(cmp.previous.accuracy * 100)}%).
          </p>
        )}
        <ButtonLink href={links.strategies()} variant="secondary" size="lg">
          Back to the methods lab
        </ButtonLink>
      </section>
    );
  }

  if (!session)
    return (
      <section className="card mx-auto max-w-2xl space-y-4 p-6 sm:p-10">
        <h1 className="display text-heading-2 sm:text-heading-1">One-minute challenge</h1>
        <p className="text-body text-ink-2">Answer as many as you can in one minute. Right answers count first, so take care. You&apos;ll only be compared with your own last try.</p>
        <Button size="xl" onClick={() => { const now = clock(); startedAt.current = now; shownAt.current = now; setSession(String(now)); }}>
          Start <ArrowRightIcon size={20} />
        </Button>
      </section>
    );

  const rand = prng(hashString(`${session}:${index}`));
  const { s, p } = problemFor(STRATEGIES, rand);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() === "") return;
    const given = Number(input);
    const ok = given === solve(p);
    record({
      id: `timed-mm:${session}:${index}`, questionId: `${TOPIC}.timed:${s.id}`, skill: skillOfStrategy(s.id), context: "timed", correct: ok, firstTry: ok, attempts: 1,
      hintsUsed: 0, misconceptions: [], response: { kind: "number", value: given }, durationMs: clock() - shownAt.current, timed: true, at: clock(),
    });
    setLast(ok);
    setInput("");
    setIndex((i) => i + 1);
    shownAt.current = clock();
  };
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="flex justify-between text-label font-semibold text-muted">
        <span>Question {index + 1}</span>
        <span role="timer" aria-label="Time left">{Math.max(0, Math.ceil(left / 1000))} s</span>
      </div>
      <form onSubmit={submit} className="card space-y-4 p-6 sm:p-8">
        <h1 className="text-center text-heading-1 font-extrabold tabular-nums">{problemText(p)}</h1>
        <label className="sr-only" htmlFor="mm-answer">Your answer</label>
        <input id="mm-answer" ref={inputRef} inputMode="numeric" autoComplete="off" value={input} onChange={(e) => setInput(e.target.value.replace(/[^\d]/g, "").slice(0, 7))} className="mx-auto block h-14 w-48 rounded-[16px] border-2 border-line-strong text-center text-heading-2 font-extrabold tabular-nums" />
        <Button type="submit" size="lg" className="mx-auto flex">Enter</Button>
        <p className="text-center text-label font-semibold text-muted" aria-live="polite">{last === null ? "" : last ? "Right!" : "Not that one. Next!"}</p>
      </form>
    </div>
  );
}

function Feedback({ ok, title, children }: { ok: boolean; title: string; children: React.ReactNode }) {
  return (
    <div className={`flex items-start gap-3 rounded-[20px] border-2 px-4 py-3 ${ok ? "border-success-edge bg-success-soft text-success-ink" : "border-retry-edge bg-retry-soft text-retry-ink"}`} aria-live="polite">
      <Kip mood={ok ? "cheer" : "think"} size={44} float={false} />
      <div className="min-w-0 space-y-1 text-body">
        <p className="text-title font-extrabold">{title}</p>
        <div>{children}</div>
      </div>
    </div>
  );
}

const NextButton = ({ onClick }: { onClick: () => void }) => (
  <div className="mt-3">
    <Button onClick={onClick}>
      Next <ArrowRightIcon size={18} />
    </Button>
  </div>
);

function ActivitySummary({ title, line, again }: { title: string; line: string; again?: () => void }) {
  return (
    <section className="card mx-auto max-w-2xl space-y-4 p-6 sm:p-10">
      <h1 className="display text-heading-2 sm:text-heading-1">{title}</h1>
      <p className="text-body text-ink-2">{line}</p>
      <div className="flex flex-wrap gap-3">
        {again && <Button size="lg" onClick={again}>Go again</Button>}
        <ButtonLink href={links.strategies()} variant="secondary" size="lg">Back to the methods lab</ButtonLink>
      </div>
    </section>
  );
}
