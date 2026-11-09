/**
 * Mental-strategy evidence (R3: MM-011, MM-012). Pure: works on stored answers only.
 *
 * Measures are kept apart on purpose (MM-012 AC1): accuracy, method choice, independence, hint use and time are never
 * folded into one score, and a faster run never hides a drop in accuracy (AC2).
 */
import type { ItemResult } from "./types";

/** MM-011: timed challenges open only after this much untimed accuracy. A proposal for Product Owner review (MM-008 §4). */
export const TIMED_UNLOCK = { answers: 10, accuracy: 0.8 } as const;

const untimed = (r: ItemResult) => r.context === "practice" || r.context === "lesson";
const inTopic = (prefix: string) => (r: ItemResult) => r.skill.startsWith(`${prefix}.`);

/** The share right among the last `TIMED_UNLOCK.answers` untimed answers in a topic, or null with too few answers. */
export function recentUntimedAccuracy(results: ItemResult[], topic: string): { answered: number; accuracy: number | null } {
  const rs = results.filter((r) => untimed(r) && inTopic(topic)(r)).sort((a, b) => a.at - b.at).slice(-TIMED_UNLOCK.answers);
  return { answered: rs.length, accuracy: rs.length ? rs.filter((r) => r.correct).length / rs.length : null };
}

export function timedUnlocked(results: ItemResult[], topic: string): boolean {
  const { answered, accuracy } = recentUntimedAccuracy(results, topic);
  return answered >= TIMED_UNLOCK.answers && (accuracy ?? 0) >= TIMED_UNLOCK.accuracy;
}

export interface TimedRun {
  session: string;
  at: number;
  answered: number;
  correct: number;
  accuracy: number;
}

/** Timed runs in time order, one per session (result ids `timed-mm:<session>:<n>`). */
export function timedRuns(results: ItemResult[], topic: string): TimedRun[] {
  const by = new Map<string, ItemResult[]>();
  for (const r of results.filter((x) => x.context === "timed" && inTopic(topic)(x) && x.id?.startsWith("timed-mm:"))) {
    const session = r.id!.split(":")[1];
    if (!by.has(session)) by.set(session, []);
    by.get(session)!.push(r);
  }
  return [...by.entries()]
    .map(([session, rs]) => ({ session, at: Math.min(...rs.map((r) => r.at)), answered: rs.length, correct: rs.filter((r) => r.correct).length, accuracy: rs.filter((r) => r.correct).length / rs.length }))
    .sort((a, b) => a.at - b.at);
}

export type RunMessage = "first" | "better" | "same" | "more-but-less-accurate" | "less-accurate" | "more-accurate";

/**
 * MM-011 AC2: compare a run only with the child's own previous run. Accuracy is judged first: answering more while
 * getting a smaller share right is never called an improvement (MM-012 AC2).
 */
export function compareWithLast(runs: TimedRun[]): { last: TimedRun; previous: TimedRun | null; message: RunMessage } | null {
  if (!runs.length) return null;
  const last = runs[runs.length - 1];
  const previous = runs.length > 1 ? runs[runs.length - 2] : null;
  if (!previous) return { last, previous, message: "first" };
  const acc = last.accuracy - previous.accuracy;
  if (acc < 0 && last.answered > previous.answered) return { last, previous, message: "more-but-less-accurate" };
  if (acc < 0) return { last, previous, message: "less-accurate" };
  if (acc > 0) return { last, previous, message: "more-accurate" };
  if (last.correct > previous.correct) return { last, previous, message: "better" };
  return { last, previous, message: "same" };
}

export interface SkillMeasures {
  skill: string;
  /** Untimed answers and the share right. */
  answered: number;
  accuracy: number | null;
  /** Method-choice answers (compare or choose) and the share where a valid method was chosen. */
  choices: number;
  methodChoice: number | null;
  /** Share of untimed answers right first time with no hint. */
  independence: number | null;
  hintsUsed: number;
  /** Median time per untimed answer and per timed answer, in milliseconds; null without data. */
  medianMs: number | null;
  timedMedianMs: number | null;
}

const median = (xs: number[]) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};

/** MM-012: the separate measures for each skill of a topic. */
export function strategyMeasures(results: ItemResult[], skills: string[]): SkillMeasures[] {
  return skills.map((skill) => {
    const mine = results.filter((r) => r.skill === skill);
    const u = mine.filter(untimed);
    const choices = mine.filter((r) => r.strategy);
    const dur = (rs: ItemResult[]) => rs.flatMap((r) => (typeof r.durationMs === "number" ? [r.durationMs] : []));
    return {
      skill,
      answered: u.length,
      accuracy: u.length ? u.filter((r) => r.correct).length / u.length : null,
      choices: choices.length,
      methodChoice: choices.length ? choices.filter((r) => r.strategy!.valid).length / choices.length : null,
      independence: u.length ? u.filter((r) => r.correct && r.firstTry && r.hintsUsed === 0).length / u.length : null,
      hintsUsed: u.reduce((n, r) => n + r.hintsUsed, 0),
      medianMs: median(dur(u)),
      timedMedianMs: median(dur(mine.filter((r) => r.context === "timed"))),
    };
  });
}

/**
 * MM-012 AC3: weaknesses drive recommendations. Skills with answers, weakest first: lowest of accuracy and method
 * choice, then fewest answers. Skills never tried come after, in the order given.
 */
export function recommendStrategySkills(measures: SkillMeasures[], n = 3): string[] {
  const score = (m: SkillMeasures) => Math.min(m.accuracy ?? 1, m.methodChoice ?? 1);
  const tried = measures.filter((m) => m.answered + m.choices > 0).sort((a, b) => score(a) - score(b) || a.answered - b.answered);
  const fresh = measures.filter((m) => m.answered + m.choices === 0);
  return [...tried.filter((m) => score(m) < 1), ...fresh, ...tried.filter((m) => score(m) >= 1)].slice(0, n).map((m) => m.skill);
}
