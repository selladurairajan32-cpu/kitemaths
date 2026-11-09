"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { FactGrid } from "@/components/facts/FactGrid";
import { FactSession, type SessionAnswer } from "@/components/facts/FactSession";
import { ScreenHero } from "@/components/kid/ScreenHero";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { diagnosticSample, FACT_MAX, FACT_MIN, factAnswer, factPrompt, factStates, MTC, mtcForm, mtcPractice, planSession, recommendedTable, TABLE_ORDER, tableSummary } from "@/engine/facts";
import { recordResult } from "@/engine/progress";
import type { FactRef } from "@/engine/types";
import { topicRoutes } from "@/lib/routes";
import { updateTopic, useHydrated, useLearner } from "@/lib/store";
import { FACTS_TOPIC, type FactMode } from "@/topics/times-tables/facts";

const links = topicRoutes(FACTS_TOPIC);
const clock = () => Date.now();

/** TT-004: the facts hub. What the child knows, table by table, and where to go next. */
export function FactsHubScreen() {
  const hydrated = useHydrated();
  const learner = useLearner();
  if (!hydrated) return <ScreenSkeleton />;
  const states = factStates(learner.results);
  const seen = states.some((s) => s.status !== "unseen");
  const known = states.filter((s) => s.status === "known").length;
  const next = recommendedTable(states);

  return (
    <div className="space-y-10">
      <ScreenHero
        pic="times"
        titleId="facts-title"
        title="Times-table facts"
        line={
          seen
            ? `${known} of ${states.length} facts known. A fact is known after three right answers in a row, first time and without a hint.`
            : `Every fact from 2 × 2 to 12 × 12: ${states.length} in all. Start by finding out which ones you know already.`
        }
      >
        {seen ? (
          <ButtonLink href={links.factsRun("practice")} size="xl">
            Practise my facts <ArrowRightIcon size={20} />
          </ButtonLink>
        ) : (
          <ButtonLink href={links.factsRun("diagnostic")} size="xl">
            Find out what I know <ArrowRightIcon size={20} />
          </ButtonLink>
        )}
        {seen && (
          <ButtonLink href={links.factsRun("diagnostic")} variant="secondary" size="xl">
            Check all my facts again
          </ButtonLink>
        )}
      </ScreenHero>

      <section aria-labelledby="tables-title" className="space-y-4">
        <div>
          <h2 id="tables-title" className="display text-heading-2">
            Table by table
          </h2>
          <p className="mt-1 text-body text-ink-2">
            Learn the tables in this order: 2s, 10s and 5s, then 3s, 4s and 8s, then the rest.{next ? ` Next up: the ${next}s.` : " You know every table!"}
          </p>
        </div>
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))] gap-3">
          {TABLE_ORDER.map((t) => {
            const sum = tableSummary(states, t);
            const isNext = t === next;
            return (
              <li key={t}>
                <Link
                  href={links.factsRun("practice", t)}
                  className={`block h-full rounded-[22px] border bg-surface p-4 shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-lift)] ${isNext ? "border-2 border-brand" : "border-line"}`}
                >
                  <span className="block text-title font-extrabold text-ink">The {t}s</span>
                  {isNext && <span className="text-label font-bold text-brand-strong">Next table to learn</span>}
                  <span className="mt-1 block text-label text-ink-2">
                    {sum.known} known · {sum.developing} growing · {sum["not-yet"]} not yet · {sum.unseen} new
                  </span>
                  <span className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-sunk" aria-hidden>
                    <span className="h-full bg-ok-bright" style={{ width: `${(sum.known / 11) * 100}%` }} />
                    <span className="h-full bg-sun" style={{ width: `${(sum.developing / 11) * 100}%` }} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="grid-title" className="card space-y-4 p-5 sm:p-7">
        <h2 id="grid-title" className="display text-heading-2">
          All your facts
        </h2>
        <p className="text-body text-ink-2">7 × 8 and 8 × 7 are one fact: know one, and you know the other, and both division facts too.</p>
        <FactGrid states={states} caption="Every times-table fact and how well you know it" />
      </section>

      <section aria-labelledby="ways-title" className="space-y-4">
        <h2 id="ways-title" className="display text-heading-2">
          Other ways to practise
        </h2>
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-3">
          <WayCard href={links.factsRun("untimed")} title="No timer, no rush" line="Take your time. Hints and as many tries as you need." />
          <WayCard href={links.factsRun("timed")} title="Timed practice" line={`${MTC.length} questions, ${MTC.answerMs / 1000} seconds each, like the Year 4 check. A practice, not the real check.`} />
          <WayCard href={links.factsExplore()} title="Explore the tables" line="Tap any fact to see it as an array, as jumps and as a fact family." />
        </ul>
      </section>
    </div>
  );
}

function WayCard({ href, title, line }: { href: string; title: string; line: string }) {
  return (
    <li>
      <Link href={href} className="flex h-full items-center gap-4 rounded-[22px] border border-line bg-surface p-4 shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-lift)]">
        <span className="min-w-0 flex-1">
          <span className="block text-title font-extrabold text-ink">{title}</span>
          <span className="block text-body text-ink-2">{line}</span>
        </span>
        <ArrowRightIcon size={20} className="shrink-0 text-ink-2" />
      </Link>
    </li>
  );
}

const INTRO: Record<FactMode, { title: string; line: string }> = {
  practice: {
    title: "Practise my facts",
    line: "Kip picks the facts you're still learning, and brings back known ones now and then so they stay known. Some come as division.",
  },
  untimed: {
    title: "No timer, no rush",
    line: "No clock at all. Ask for a hint whenever you like, and try as many times as you need.",
  },
  diagnostic: {
    title: "Find out what I know",
    line: "25 facts from every table, with no help. It shows where to start, not a score to keep: facts change as you practise.",
  },
  timed: {
    title: "Timed practice",
    line: `Like the Year 4 multiplication tables check: ${MTC.length} questions, ${MTC.answerMs / 1000} seconds each, then a short pause. Three warm-up questions first. This is a practice, not the official check.`,
  },
};

/** Reads the chosen table (TT-004) from `?table=`; only a real table 2–12 counts, anything else practises every table. */
export function FactRunFromUrl({ mode }: { mode: FactMode }) {
  const raw = useSearchParams().get("table");
  const n = Number(raw);
  const table = raw !== null && Number.isInteger(n) && n >= FACT_MIN && n <= FACT_MAX ? n : undefined;
  return <FactRunScreen key={`${mode}:${table ?? "all"}`} mode={mode} table={table} />;
}

/** TT-005, TT-006, TT-009, TT-010: one session in a chosen mode, from a start page to a summary. */
export function FactRunScreen({ mode, table }: { mode: FactMode; table?: number }) {
  const hydrated = useHydrated();
  const learner = useLearner();
  const [length, setLength] = useState(10);
  const [run, setRun] = useState<{ facts: FactRef[]; warmup: FactRef[]; session: string } | null>(null);
  const [done, setDone] = useState<SessionAnswer[] | null>(null);
  if (!hydrated) return <ScreenSkeleton />;
  const intro = INTRO[mode];
  const adjustable = mode === "practice" || mode === "untimed";

  const start = () => {
    const now = clock();
    const session = `${now}`;
    const facts =
      mode === "diagnostic" ? diagnosticSample(session) : mode === "timed" ? mtcForm(session) : planSession(learner.results, now, length, { table, seed: session });
    setDone(null);
    setRun({ facts, warmup: mode === "timed" ? mtcPractice(session) : [], session });
  };

  if (done) return <Summary mode={mode} answers={done} onAgain={start} />;

  if (run)
    return (
      <FactSession
        key={run.session}
        mode={mode}
        facts={run.facts}
        warmup={run.warmup}
        session={run.session}
        onResult={(r) => updateTopic(FACTS_TOPIC, (t) => recordResult(t, r))}
        onDone={(answers) => {
          setRun(null);
          setDone(answers);
        }}
      />
    );

  return (
    <section className="card mx-auto max-w-2xl space-y-5 p-6 sm:p-10">
      <h1 className="display text-heading-2 sm:text-heading-1">{table ? `${intro.title}: the ${table}s` : intro.title}</h1>
      <p className="text-body text-ink-2">{intro.line}</p>
      {adjustable && (
        <fieldset>
          <legend className="text-label font-bold text-ink">How many questions?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {[5, 10, 20].map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={length === n}
                onClick={() => setLength(n)}
                className={`min-h-11 rounded-full px-5 text-body font-bold ${length === n ? "bg-brand text-on-brand" : "bg-sunk text-ink hover:bg-line"}`}
              >
                {n}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      {mode === "timed" && (
        <p className="rounded-[18px] bg-notice-soft px-4 py-3 text-label text-notice-ink">
          Prefer no clock? <Link href={links.factsRun("untimed")} className="font-bold underline underline-offset-2">Practise without a timer</Link> instead.
        </p>
      )}
      <Button size="xl" onClick={start}>
        {mode === "timed" ? "Start the warm-up" : "Start"} <ArrowRightIcon size={20} />
      </Button>
    </section>
  );
}

function Summary({ mode, answers, onAgain }: { mode: FactMode; answers: SessionAnswer[]; onAgain: () => void }) {
  const learner = useLearner();
  const right = answers.filter((a) => a.correct);
  const missed = answers.filter((a) => !a.correct);
  const states = factStates(learner.results);
  const headline =
    mode === "timed"
      ? `${right.length} out of ${answers.length} in time`
      : mode === "diagnostic"
        ? `You knew ${right.length} of ${answers.length} straight away`
        : `${right.length} of ${answers.length} facts right`;
  return (
    <section className="card mx-auto max-w-2xl space-y-5 p-6 sm:p-10">
      <h1 className="display text-heading-2 sm:text-heading-1">{headline}</h1>
      {mode === "timed" && <p className="text-label text-muted">A practice simulation of the Year 4 multiplication tables check, not the official DfE check. It doesn&apos;t change which facts count as known.</p>}
      {mode === "diagnostic" && <p className="text-body text-ink-2">This shows where to start, not a label. Every fact can move to known with practice.</p>}
      {mode === "untimed" && <p className="text-body text-ink-2">No clock, so this is about knowing, not speed. Facts you needed help with will come back in practice.</p>}
      {missed.length > 0 && (
        <div>
          <h2 className="text-title font-extrabold">{mode === "timed" ? "Facts to revisit" : "Facts to keep practising"}</h2>
          <ul className="mt-2 grid grid-cols-[repeat(auto-fit,minmax(min(100%,9rem),1fr))] gap-2">
            {missed.map((a, i) => (
              <li key={i} className="rounded-[14px] bg-retry-soft px-3 py-2 text-body font-bold tabular-nums text-retry-ink">
                {factPrompt(a.fact).replace("?", String(factAnswer(a.fact)))}
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-label text-ink-2">
        Now: {states.filter((s) => s.status === "known").length} known · {states.filter((s) => s.status === "developing").length} growing ·{" "}
        {states.filter((s) => s.status === "not-yet").length} not yet.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={onAgain}>
          Go again
        </Button>
        <ButtonLink href={links.facts()} variant="secondary" size="lg">
          Back to my facts
        </ButtonLink>
      </div>
    </section>
  );
}
