import { fromFractionQuestion } from "@/questions/adapt";
import { validateQuestion } from "@/questions/validate";
import type { FractionQuestion } from "../types";

/**
 * PRACT-001 AC3: malformed question definitions are rejected at run time, not only in tests. Every practice question
 * is checked against the typed question schema (ARCH-002) before it can be shown. Marking is unchanged: it stays in
 * the Fractions evaluator, so the kit-marking difference (DEF-038) is not affected (RC-008 Q-E).
 */
const cache = new Map<string, boolean>();

export function isWellFormed(q: FractionQuestion): boolean {
  const known = cache.get(q.id);
  if (known !== undefined) return known;
  const ok = validateQuestion(fromFractionQuestion(q, { level: "unverified" })).ok;
  if (cache.size > 5000) cache.clear();
  cache.set(q.id, ok);
  return ok;
}

/** Keeps only well-formed questions, reporting any it drops once, in development builds. */
export function wellFormedOnly(questions: FractionQuestion[]): FractionQuestion[] {
  return questions.filter((q) => {
    const ok = isWellFormed(q);
    if (!ok && process.env.NODE_ENV !== "production") console.warn(`Dropped malformed question ${q.id}`);
    return ok;
  });
}
