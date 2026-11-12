"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { RichText } from "@/components/math/RichText";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { EXAM_PROFILES, KNOWN_FIELDS, type ExamProfile, type KnownField } from "@/engine/examProfile";
import { mockSessions } from "@/engine/overview";
import { analyseMock, configFor, DEFAULT_MOCK, NO_PREDICTION, NO_PREDICTION_CHILD, PRACTICE_LABEL, revisionPlan, type MistakeKind, type MockConfig, type ReviewRule } from "@/engine/mock";
import { recordResult } from "@/engine/progress";
import { hashString, prng } from "@/engine/random";
import type { ItemResult } from "@/engine/types";
import type { AnswerResponse } from "@/topics/types";
import { topicRoutes } from "@/lib/routes";
import { updateTopic, useHydrated, useLearner } from "@/lib/store";
import { topicById, topicOf } from "@/topics";
import { genId } from "@/topics/kit/define";
import type { KitQuestion, KitResponse } from "@/topics/kit/types";
import { TWO_PART_KEYS } from "@/topics/mock-exams";
import { asAnswerSheet, asMultipleChoice } from "@/topics/mock-exams/taxonomy";

const T = "mock-exams";
const clock = () => Date.now();

const KIND_LABEL: Record<MistakeKind, string> = {
  knowledge: "Knowledge gap",
  careless: "Careless error",
  timing: "Time pressure",
  format: "Question format",
  unclear: "Not clear yet",
};
const REVIEW_TEXT: Record<ReviewRule, string> = {
  anytime: "Move between questions and change answers at any time",
  end: "Answer in order, then review and change answers at the end",
  none: "Answer in order, with no going back",
};

const FIELD_LABEL: Record<KnownField, string> = { subjects: "Subjects", provider: "Provider", questionFormats: "Question format", mathsMinutes: "Maths timing", calculators: "Calculators" };
const FORMAT_LABEL: Record<MockConfig["format"], string> = { number: "Write the answer", "multiple-choice": "Multiple choice", mixed: "Mixed", "answer-sheet": "Answer sheet (A to E)", "two-part": "Two-part questions" };

/** A verified exam fact as a parent reads it. */
function factText(p: ExamProfile, f: KnownField): string {
  const k = p[f];
  if (k.status === "unknown") return "unknown";
  const v = k.value as unknown;
  if (Array.isArray(v)) return v.join(", ");
  if (f === "mathsMinutes") return `${v} minutes`;
  return v === "standard" ? "written answers" : String(v);
}

/** The first and one-past-last question of each timed section: questions shared out as evenly as possible. */
export function sectionBounds(total: number, sections: number): [number, number][] {
  return Array.from({ length: sections }, (_, s) => [Math.floor((s * total) / sections), Math.floor(((s + 1) * total) / sections)]);
}

/**
 * The questions for one mock: a spread of every mock area, at level 2 or 3, in the chosen format. An answer sheet asks
 * every written question as 5 lettered options; two-part questions come in linked pairs, (a) then (b), sharing a story.
 */
export function buildPaper(session: string, config: MockConfig): KitQuestion[] {
  const topic = topicById(T)!;
  const rand = prng(hashString(`mock:${session}`));
  const pairs = new Set<string>(TWO_PART_KEYS);
  const keys = [...new Set((topic.practiceQuestions as KitQuestion[]).map((q) => /^g:[^.]+\.([^:]+):/.exec(q.id)![1]))].filter((k) => !pairs.has(k));
  const out: KitQuestion[] = [];
  while (out.length < config.questionCount) {
    const i = out.length;
    const d = rand() < 0.5 ? 2 : 3;
    const seed = Math.floor(rand() * 1e9);
    if (config.format === "two-part" && i % 3 !== 2 && out.length + 2 <= config.questionCount) {
      // Two linked parts, then one single question, so a paper mixes both.
      out.push(...TWO_PART_KEYS.map((k) => topic.questionById(genId(T, k, d, seed)) as KitQuestion));
      continue;
    }
    const base = topic.questionById(genId(T, keys[i % keys.length], d, seed)) as KitQuestion;
    if (config.format === "answer-sheet") out.push(asAnswerSheet(base));
    else {
      const mc = config.format === "multiple-choice" || (config.format === "mixed" && i % 2 === 1);
      out.push(mc && base.kind === "number" ? asMultipleChoice(base) : base);
    }
  }
  return out;
}

/** EXAM-005 and EXAM-006: set up a practice mock, sit it under its rules, then see the analysis and review. */
export function MockScreen() {
  const hydrated = useHydrated();
  const learner = useLearner();
  const [chosen, setChosen] = useState(DEFAULT_MOCK);
  const [profileId, setProfileId] = useState(EXAM_PROFILES[0].id);
  const [run, setRun] = useState<{ session: string; config: MockConfig; paper: KitQuestion[]; startedAt: number } | null>(null);
  const [finished, setFinished] = useState<string | null>(null);
  if (!hydrated) return <ScreenSkeleton />;
  const profile = EXAM_PROFILES.find((p) => p.id === profileId) ?? EXAM_PROFILES[0];
  const { config, notes } = configFor(profile, chosen);

  if (finished) return <MockResults session={finished} onAgain={() => setFinished(null)} />;
  if (run)
    return (
      <MockSitting
        key={run.session}
        {...run}
        onFinish={(results) => {
          for (const r of results) updateTopic(T, (t) => recordResult(t, r));
          setRun(null);
          setFinished(run.session);
        }}
      />
    );

  const past = mockSessions(learner.results);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="display text-heading-2 sm:text-heading-1">Practice mock</h1>
        <p className="mt-2 rounded-[18px] bg-notice-soft px-4 py-3 text-body font-semibold text-notice-ink">{PRACTICE_LABEL}</p>
      </header>

      <section className="card space-y-3 p-5 sm:p-7" aria-labelledby="profile-title">
        <h2 id="profile-title" className="text-title font-extrabold">Which test?</h2>
        <Choice label="Test" value={profile.id} options={EXAM_PROFILES.map((p) => p.id)} show={(id) => EXAM_PROFILES.find((p) => p.id === id)!.name} onChange={setProfileId} />
        <p className="text-body text-ink-2">
          Each fact below is quoted from the test provider&apos;s own public page, with the date it was read. Anything not stated there is <strong>unknown</strong>, and Kite Maths doesn&apos;t guess it: the mock uses your settings instead.
        </p>
        <ul className="grid gap-2 text-label text-ink-2 sm:grid-cols-2">
          {KNOWN_FIELDS.map((f) => {
            const k = profile[f];
            return (
              <li key={f}>
                <span className="font-semibold">{FIELD_LABEL[f]}:</span> {factText(profile, f)}
                {k.status === "verified" && (
                  <span className="block text-muted">
                    Source: <a href={k.source.url} className="font-semibold text-brand-strong underline underline-offset-4" rel="noreferrer" target="_blank">{k.source.publisher}</a>, read {k.source.retrieved}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card space-y-4 p-5 sm:p-7" aria-labelledby="settings-title">
        <h2 id="settings-title" className="text-title font-extrabold">Settings</h2>
        <Choice label="Questions" value={chosen.questionCount} options={[6, 12, 20]} show={(n) => `${n}`} onChange={(questionCount) => setChosen({ ...chosen, questionCount })} />
        <Choice label="Total time" value={chosen.sectionMinutes} options={[10, 15, 30]} show={(n) => `${n} min`} onChange={(sectionMinutes) => setChosen({ ...chosen, sectionMinutes })} />
        <Choice label="Answer format" value={chosen.format} options={["number", "multiple-choice", "mixed", "answer-sheet", "two-part"] as const} show={(f) => FORMAT_LABEL[f]} onChange={(format) => setChosen({ ...chosen, format })} />
        <Choice label="Timed sections" value={chosen.sections} options={[1, 2, 3]} show={(n) => (n === 1 ? "One section" : `${n} sections`)} onChange={(sections) => setChosen({ ...chosen, sections })} />
        <Choice label="Going back" value={chosen.review} options={["anytime", "end", "none"] as const} show={(r) => ({ anytime: "Any time", end: "At the end", none: "No going back" })[r]} onChange={(review) => setChosen({ ...chosen, review })} />
        <ul className="text-label text-muted">{notes.map((n) => <li key={n}>{n}</li>)}</ul>
        <Button size="xl" onClick={() => { const now = clock(); setRun({ session: String(now), config, paper: buildPaper(String(now), config), startedAt: now }); }}>
          Start the mock <ArrowRightIcon size={20} />
        </Button>
      </section>

      {past.length > 0 && (
        <section className="card p-5 sm:p-7" aria-labelledby="past-title">
          <h2 id="past-title" className="text-title font-extrabold">Your mocks</h2>
          <ul className="mt-2 space-y-1 text-body tabular-nums">
            {past.slice(-6).reverse().map((m) => (
              <li key={m.session}>
                <button type="button" onClick={() => setFinished(m.session)} className="min-h-11 font-semibold text-brand-strong underline underline-offset-4">
                  {new Date(m.at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}: {m.correct} of {m.total}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Choice<V extends string | number>({ label, value, options, show, onChange }: { label: string; value: V; options: readonly V[]; show: (v: V) => string; onChange: (v: V) => void }) {
  return (
    <fieldset>
      <legend className="text-label font-bold text-ink">{label}</legend>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={String(o)} type="button" aria-pressed={value === o} onClick={() => onChange(o)} className={`min-h-11 rounded-full px-4 text-body font-bold ${value === o ? "bg-brand text-on-brand" : "bg-sunk text-ink hover:bg-line"}`}>
            {show(o)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function MockSitting({ session, config, paper, startedAt, onFinish }: { session: string; config: MockConfig; paper: KitQuestion[]; startedAt: number; onFinish: (r: ItemResult[]) => void }) {
  const topic = topicById(T)!;
  const { Input } = topic.questions;
  const bounds = sectionBounds(paper.length, config.sections);
  const many = config.sections > 1;
  // Each section has an equal share of the time and its own clock (D-037); one section is the whole paper.
  const sectionMs = Math.round((config.sectionMinutes * 60_000) / config.sections);
  const [section, setSection] = useState(0);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(AnswerResponse | null)[]>(() => paper.map(() => null));
  // The section clock is set up once, so it reads the latest answers and section from refs, never a stale copy.
  const latest = useRef<(AnswerResponse | null)[]>(answers);
  const current = useRef({ section: 0, start: startedAt });
  const [reviewing, setReviewing] = useState(false);
  const [left, setLeft] = useState(sectionMs);
  const answeredAt = useRef<(number | null)[]>(paper.map(() => null));
  const changed = useRef<boolean[]>(paper.map(() => false));
  const endedAt = useRef<number[]>(bounds.map(() => sectionMs));
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    const at = clock();
    endedAt.current[current.current.section] = Math.min(sectionMs, at - current.current.start);
    const sectionOf = (i: number) => bounds.findIndex(([lo, hi]) => i >= lo && i < hi);
    onFinish(
      paper.map((q, i) => {
        const r = latest.current[i];
        const ev = r ? topic.questions.evaluate(q, r) : null;
        const s = sectionOf(i);
        return {
          id: `mock:${session}:${i}`, questionId: q.id, skill: q.skill, context: "mock" as const, correct: !!ev?.correct, firstTry: !!ev?.correct, attempts: r ? 1 : 0,
          hintsUsed: 0, misconceptions: ev?.misconceptions ?? [], response: r, at: at + i,
          mock: {
            session, index: i, total: paper.length, sectionMs, format: q.kind === "choose" ? "multiple-choice" : "number", answeredAtMs: answeredAt.current[i], changed: changed.current[i], endedAtMs: endedAt.current[s],
            ...(q.kind === "choose" ? { options: q.options.length } : {}),
            ...(config.format === "answer-sheet" ? { sheet: true } : {}),
            ...(many ? { section: s } : {}),
          },
        } satisfies ItemResult;
      }),
    );
  };

  /** End the current section (its time ran out, or the child moved on): the next section starts, with no going back. */
  const endSection = () => {
    const s = current.current.section;
    if (s >= bounds.length - 1) return finish();
    const now = clock();
    endedAt.current[s] = Math.min(sectionMs, now - current.current.start);
    current.current = { section: s + 1, start: now };
    setSection(s + 1);
    setIndex(bounds[s + 1][0]);
    setReviewing(false);
    setLeft(sectionMs);
  };

  useEffect(() => {
    const id = setInterval(() => {
      if (done.current) return clearInterval(id);
      const l = sectionMs - (clock() - current.current.start);
      setLeft(l);
      if (l <= 0) endSection();
    }, 500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one clock for the sitting; it reads the section from a ref
  }, []);

  const [lo, hi] = bounds[section];
  const q = paper[index];
  const canBack = config.review === "anytime" || (config.review === "end" && reviewing);
  const last = index === hi - 1;
  const lastSection = section === bounds.length - 1;
  const mins = Math.max(0, Math.floor(left / 60_000));
  const secs = Math.max(0, Math.floor((left % 60_000) / 1000));
  const sheet = config.format === "answer-sheet";

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-label font-semibold text-muted">
        <span>{many ? `Section ${section + 1} of ${bounds.length} · ` : ""}Question {index + 1} of {paper.length} · {REVIEW_TEXT[config.review]}</span>
        <span role="timer" aria-label={many ? "Time left in this section" : "Time left in the section"}>{mins}:{String(secs).padStart(2, "0")}</span>
      </div>
      {config.review === "anytime" || reviewing ? (
        <nav aria-label="Questions" className="flex flex-wrap gap-1.5">
          {paper.slice(lo, hi).map((_, k) => {
            const i = lo + k;
            return (
              <button key={i} type="button" onClick={() => setIndex(i)} aria-current={i === index ? "step" : undefined} className={`grid size-11 place-items-center rounded-full text-label font-bold ${i === index ? "bg-brand text-on-brand" : answers[i] ? "bg-ok-soft text-ok" : "bg-sunk text-ink-2"}`}>
                {i + 1}
              </button>
            );
          })}
        </nav>
      ) : null}
      <section className="card space-y-5 p-5 sm:p-8" aria-label={`Question ${index + 1}`}>
        <h1 className="text-prompt-sm font-extrabold text-ink sm:text-prompt">
          <RichText text={q.prompt} />
        </h1>
        {sheet && q.kind === "choose" && <p className="text-body font-semibold text-ink-2">Answer sheet: choose one letter, A to {"ABCDE"[q.options.length - 1]}.</p>}
        <Input
          question={q}
          response={answers[index]}
          onChange={(r) => {
            if (answers[index] !== null && r !== null) changed.current[index] = true;
            answeredAt.current[index] = r === null ? null : clock() - current.current.start;
            const next = latest.current.map((x, i) => (i === index ? r : x));
            latest.current = next;
            setAnswers(next);
          }}
          locked={false}
          orderKey={`mock:${session}:${index}`}
        />
      </section>
      <div className="flex flex-wrap gap-3">
        {canBack && index > lo && (
          <Button variant="secondary" onClick={() => setIndex((i) => i - 1)}>
            Back
          </Button>
        )}
        {!last && <Button onClick={() => setIndex((i) => i + 1)}>Next</Button>}
        {last && config.review === "end" && !reviewing && (
          <Button variant="secondary" onClick={() => { setReviewing(true); setIndex(lo); }}>
            Review my answers
          </Button>
        )}
        {(last || reviewing || config.review === "anytime") && (lastSection ? <Button onClick={finish}>Finish the mock</Button> : <Button onClick={endSection}>Start the next section</Button>)}
      </div>
      {many && !lastSection && <p className="text-label text-muted">When this section ends you can&apos;t come back to it.</p>}
      <p className="text-label text-muted">{PRACTICE_LABEL}</p>
    </div>
  );
}

function MockResults({ session, onAgain }: { session: string; onAgain: () => void }) {
  const learner = useLearner();
  const topic = topicById(T)!;
  const { Input, answerText } = topic.questions;
  const mine = learner.results.filter((r) => r.mock?.session === session).sort((a, b) => a.mock!.index - b.mock!.index);
  const history = learner.results.filter((r) => !(r.mock?.session === session) && r.at < (mine[0]?.at ?? Infinity));
  const analysis = analyseMock(mine, history);
  const plan = revisionPlan(analysis);
  const correct = mine.filter((r) => r.correct).length;
  const skillTitle = (id: string) => topicOf(id)?.skills.find((s) => s.id === id)?.title ?? id;
  const question = (r: ItemResult): KitQuestion => {
    const base = topic.questionById(r.questionId) as KitQuestion;
    if (r.mock!.sheet) return asAnswerSheet(base);
    return r.mock!.format === "multiple-choice" && base.kind === "number" ? asMultipleChoice(base) : base;
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="display text-heading-2 sm:text-heading-1">{correct} of {mine.length} right</h1>
        <p className="mt-1 text-label text-muted">{PRACTICE_LABEL}</p>
      </header>

      <section className="card space-y-3 p-5 sm:p-7" aria-labelledby="plan-title">
        <h2 id="plan-title" className="text-title font-extrabold">What to do next</h2>
        {plan.length === 0 ? (
          <p className="text-body text-ink-2">Everything right. Try a longer mock, or less time, next.</p>
        ) : (
          <ul className="space-y-3">
            {plan.map((p) => (
              <li key={p.kind} className="rounded-[18px] bg-paper p-4">
                <p className="font-extrabold">{KIND_LABEL[p.kind]}: {analysis.filter((a) => a.kind === p.kind).length} question{analysis.filter((a) => a.kind === p.kind).length === 1 ? "" : "s"}</p>
                <p className="text-body text-ink-2">{p.action}</p>
                {(p.kind === "knowledge" || p.kind === "unclear") && (
                  <p className="mt-1 flex flex-wrap gap-x-4 text-label">
                    {p.skills.map((s) => (
                      <Link key={s} href={topicRoutes(T).practice(s)} className="inline-flex min-h-11 items-center font-semibold text-brand-strong underline underline-offset-4">
                        Practise {skillTitle(s)}
                      </Link>
                    ))}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="text-body font-semibold text-ink-2">{NO_PREDICTION_CHILD}</p>
        <details className="text-label text-ink-2">
          <summary className="inline-flex min-h-11 cursor-pointer items-center font-bold">For grown-ups</summary>
          <p>{NO_PREDICTION}</p>
        </details>
      </section>

      <section className="card p-5 sm:p-7" aria-labelledby="review-title">
        <h2 id="review-title" className="text-title font-extrabold">Question by question</h2>
        <ol className="mt-3 divide-y divide-line">
          {mine.map((r, i) => {
            const q = question(r);
            const a = analysis[i];
            return (
              <li key={r.id}>
                <details className="py-2">
                  <summary className="flex min-h-11 cursor-pointer list-none flex-wrap items-center gap-2 text-body">
                    <span aria-hidden>{r.correct ? "✓" : "✗"}</span>
                    <span className="font-semibold">Q{i + 1}</span>
                    <span className="min-w-0 flex-1"><RichText text={q.prompt} /></span>
                    {a.kind && <span className="rounded-full bg-retry-soft px-2 py-0.5 text-label font-bold text-retry-ink">{KIND_LABEL[a.kind]}</span>}
                  </summary>
                  <div className="mt-2 space-y-3 rounded-[16px] bg-paper p-4 text-body">
                    <div className="pointer-events-none">
                      <Input question={q} response={(r.response as KitResponse | null) ?? null} onChange={() => {}} locked reveal orderKey={`mock:${session}:${i}`} />
                    </div>
                    {!r.correct && <p><span className="text-muted">Correct answer: </span><RichText text={answerText(q)} /></p>}
                    <p className="text-ink-2"><RichText text={q.explanation} /></p>
                    {a.kind && <p className="text-label text-muted">Why this label: {a.because}</p>}
                  </div>
                </details>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button size="lg" onClick={onAgain}>Set up another mock</Button>
      </div>
    </div>
  );
}
