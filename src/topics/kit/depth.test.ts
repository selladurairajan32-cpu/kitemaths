import { describe, expect, it } from "vitest";
import type { LessonStep } from "@/lessons/types";
import { TOPICS } from "@/topics";
import { templatesOf } from "@/topics/kit/define";
import { FACTOR_PUZZLES, uniquePuzzleAnswer } from "@/topics/multiply-divide";

/**
 * D-037 Phase B: every kit island's lessons follow the CUR-003 shape, and every skill has varied questions.
 *  - A picture before the first check, a "watch me" worked example, and a "together" example whose blank has a trap.
 *  - An explanation of at least 40 words.
 *  - At least 3 question makers per skill, one of them a stretch question, and at least 2 hints per question.
 * Islands still being deepened are listed in NOT_YET; the list may only shrink, and an island leaves it once it passes.
 * Mock exams are exam technique, not teaching lessons, so only the hint rule applies to them.
 */
const NOT_YET = new Set([
  "place-value", "rounding", "negative", "add-subtract", "times-tables", "mental-maths", "percentages", "money", "time",
  "area-perimeter", "shapes-angles", "coordinates", "charts-data", "ratio-algebra", "problem-solving", "mock-exams",
]);
const TEACHING_EXEMPT = new Set(["mock-exams"]);
const kit = TOPICS.filter((t) => t.id !== "fractions");

const words = (s: string) => s.replace(/\*\*|\{[^}]*\}/g, " x ").split(/\s+/).filter(Boolean).length;

function gaps(topicId: string): string[] {
  const t = kit.find((x) => x.id === topicId)!;
  const out: string[] = [];
  const tpl = templatesOf(t.id);
  if (!TEACHING_EXEMPT.has(t.id)) {
    for (const l of t.lessons) {
      const steps = l.steps as LessonStep[];
      const first = steps.findIndex((s) => s.type === "check");
      const before = first < 0 ? steps : steps.slice(0, first);
      if (!before.some((s) => ("visual" in s && s.visual) || s.type === "lab")) out.push(`${l.id}: no picture before the first check`);
      if (!steps.some((s) => s.type === "worked" && s.support === "full")) out.push(`${l.id}: no watch-me example`);
      if (!steps.some((s) => s.type === "worked" && s.support === "faded" && s.steps.some((x) => x.blank?.traps?.length))) out.push(`${l.id}: no together example with a trap`);
      const explained = steps.filter((s) => s.type === "explain").reduce((n, s) => n + (s.type === "explain" ? s.body.reduce((m, p) => m + words(p), 0) : 0), 0);
      if (explained < 40) out.push(`${l.id}: explanation of ${explained} words`);
    }
    for (const sk of t.skills) {
      const mine = tpl.filter((x) => x.skill === sk.id);
      if (mine.length < 3) out.push(`${sk.id}: ${mine.length} question makers`);
      if (!mine.some((x) => x.stretch)) out.push(`${sk.id}: no stretch question`);
    }
  }
  for (const x of tpl) {
    const d = x.difficulties[0]!;
    const q = t.questions && t.questionById(`g:${t.id}.${x.key}:${d}:7`);
    const hints = [q.hint, ...(q.hints ?? [])].filter((h) => h.trim());
    if (hints.length < 2) out.push(`${x.key}: ${hints.length} hint`);
  }
  return out;
}

describe("lesson depth (D-037 Phase B, CUR-003)", () => {
  it("holds every deepened island to the lesson shape, and keeps the not-yet list shrinking", () => {
    const problems: string[] = [];
    for (const t of kit) {
      const found = gaps(t.id);
      if (NOT_YET.has(t.id) && found.length === 0) problems.push(`${t.id} now passes: remove it from NOT_YET`);
      if (!NOT_YET.has(t.id)) problems.push(...found.map((g) => `${t.id} · ${g}`));
    }
    expect(problems).toEqual([]);
  });

  it("gives each factor puzzle exactly one answer (hand-worked)", () => {
    expect(FACTOR_PUZZLES.map(([m, n, lo, hi]) => uniquePuzzleAnswer(m, n, lo, hi))).toEqual([30, 14, 18, 15]);
  });
});
