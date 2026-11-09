import { classifyAnswer, factAnswer, factKey } from "@/engine/facts";
import type { FactRef, ItemResult } from "@/engine/types";
import { TT_MISCONCEPTIONS as M, TT_SKILLS as S } from "./index";

/** The island whose facts the fact screens practise (R2). */
export const FACTS_TOPIC = "times-tables";

/**
 * The island skill a fact's answer counts towards: division forms count for division facts; a multiplication counts
 * for the family of its harder number (11–12, then 6, 7, 9, then 3, 4, 8, then 2, 5, 10).
 */
export function skillForFact(f: FactRef): string {
  if (f.form.startsWith("div")) return S.division;
  const has = (ns: number[]) => ns.includes(f.a) || ns.includes(f.b);
  if (has([11, 12])) return S.big;
  if (has([6, 7, 9])) return S.tricky;
  if (has([3, 4, 8])) return S.doubling;
  return S.easy;
}

const difficultyOf = (f: FactRef): 1 | 2 | 3 => {
  const s = skillForFact(f);
  return s === S.easy ? 1 : s === S.doubling ? 2 : 3;
};

export type FactMode = "practice" | "untimed" | "diagnostic" | "timed";

/** Turns one answered fact into a stored result. A wrong answer that looks like a typing slip is flagged, not judged. */
export function factResult(opts: {
  mode: FactMode;
  session: string;
  index: number;
  fact: FactRef;
  given: number | null;
  attempts: number;
  hintsUsed: number;
  durationMs: number;
  at: number;
  /** Timed mode: answered within the window. */
  inTime?: boolean;
}): ItemResult {
  const { fact, given } = opts;
  const kind = classifyAnswer(fact, given);
  const timed = opts.mode === "timed";
  const correct = given === factAnswer(fact) && (!timed || opts.inTime !== false);
  return {
    id: `${opts.mode}:${opts.session}:${opts.index}`,
    questionId: `${FACTS_TOPIC}.fact:${factKey(fact.a, fact.b)}:${fact.form}:${fact.a}`,
    skill: skillForFact(fact),
    context: timed ? "timed" : "practice",
    difficulty: difficultyOf(fact),
    correct,
    firstTry: correct && opts.attempts === 1,
    attempts: opts.attempts,
    hintsUsed: opts.hintsUsed,
    misconceptions: kind === "neighbour" ? [M.step] : kind === "added" ? [M.added] : [],
    response: { kind: "number", value: given },
    durationMs: opts.durationMs,
    fact,
    ...(kind === "slip" && !correct ? { slip: true } : {}),
    ...(timed ? { timed: true } : {}),
    at: opts.at,
  };
}
