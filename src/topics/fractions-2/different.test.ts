import { describe, expect, it } from "vitest";
import { topicById } from "@/topics";
import { genId } from "@/topics/kit/define";
import type { Difficulty, KitQuestion } from "@/topics/kit/types";

/**
 * D-041: adding and subtracting fractions with different denominators (Y6.FRAC.3). Every answer is checked against an
 * independent oracle: BigInt cross-multiplication and Euclid's algorithm written here, and a brute-force search for
 * the smallest common denominator. Never the island's own maths.
 */

const topic = topicById("fractions-2")!;
const q = (key: string, d: Difficulty, seed: number) => topic.questionById(genId("fractions-2", key, d, seed)) as KitQuestion;
const SEEDS = Array.from({ length: 60 }, (_, i) => i + 1);

type Big = { n: bigint; d: bigint };
const big = (n: number, d: number): Big => ({ n: BigInt(n), d: BigInt(d) });
const bgcd = (a: bigint, b: bigint): bigint => (b === BigInt(0) ? (a < BigInt(0) ? -a : a) : bgcd(b, a % b));
const norm = (x: Big): Big => { const g = bgcd(x.n, x.d); return { n: x.n / g, d: x.d / g }; };
const plus = (a: Big, b: Big) => norm({ n: a.n * b.d + b.n * a.d, d: a.d * b.d });
const minus = (a: Big, b: Big) => norm({ n: a.n * b.d - b.n * a.d, d: a.d * b.d });
const equal = (a: Big, b: Big) => a.n * b.d === b.n * a.d;

/** Reads "{n/d}", "w {n/d}" or "w" as an exact fraction. */
function read(text: string): Big {
  const m = text.match(/^(?:(\d+) )?\{(\d+)\/(\d+)\}$/);
  if (m) return norm({ n: BigInt(m[1] ?? 0) * BigInt(m[3]!) + BigInt(m[2]!), d: BigInt(m[3]!) });
  if (/^\d+$/.test(text)) return big(Number(text), 1);
  throw new Error(`not a fraction: ${text}`);
}
/** The two fractions in a prompt, in order. */
const operands = (prompt: string) => [...prompt.matchAll(/\{(\d+)\/(\d+)\}/g)].slice(0, 2).map((m) => big(Number(m[1]), Number(m[2])));
const simplest = (x: Big) => bgcd(x.n, x.d) === BigInt(1);

function checkChoice(question: KitQuestion, expected: Big) {
  if (question.kind !== "choose") throw new Error("expected a choice");
  const right = read(question.options[question.answer]!.text);
  expect(equal(right, expected), `${question.prompt}: ${question.options[question.answer]!.text}`).toBe(true);
  expect(simplest(right), question.prompt).toBe(true);
  for (const [i, o] of question.options.entries()) if (i !== question.answer) expect(equal(read(o.text), expected), `${question.prompt}: wrong option ${o.text} is right`).toBe(false);
  expect(new Set(question.options.map((o) => o.text)).size).toBe(question.options.length);
  expect(question.options.length).toBeGreaterThanOrEqual(3);
}

describe("add and subtract with different denominators (D-041, Y6.FRAC.3)", () => {
  it("adds correctly, in simplest form, with no wrong option worth the answer", () => {
    for (const d of [2, 3] as const) for (const s of SEEDS) {
      const x = q("f2-add-diff", d, s);
      const [a, b] = operands(x.prompt);
      // Different denominators, neither a multiple of the other.
      expect(a!.d % b!.d !== BigInt(0) && b!.d % a!.d !== BigInt(0), x.prompt).toBe(true);
      checkChoice(x, plus(a!, b!));
    }
    for (const s of SEEDS) {
      const x = q("f2-add-diff-stretch", 3, s);
      const [a, b] = operands(x.prompt);
      checkChoice(x, plus(a!, b!));
    }
  });

  it("subtracts correctly, and the answer is always positive", () => {
    for (const d of [2, 3] as const) for (const s of SEEDS) {
      const x = q("f2-diff-subtract", d, s);
      const [a, b] = operands(x.prompt);
      const want = minus(a!, b!);
      expect(want.n > BigInt(0), x.prompt).toBe(true);
      checkChoice(x, want);
    }
  });

  it("asks for the right number of common pieces, and the smallest common denominator", () => {
    for (const d of [1, 2] as const) for (const s of SEEDS) {
      const x = q("f2-diff-common", d, s);
      if (x.kind !== "number") throw new Error("expected a number");
      const [a, b] = operands(x.prompt);
      const pieces = Number(x.explanation.match(/= \{\d+\/(\d+)\}/)![1]);
      // The pieces fit both fractions, and the answer is a in those pieces.
      expect(BigInt(pieces) % a!.d === BigInt(0) && BigInt(pieces) % b!.d === BigInt(0), x.prompt).toBe(true);
      expect(equal(big(x.answer, pieces), a!), x.prompt).toBe(true);
    }
    const NAMES: Record<string, number> = { halves: 2, thirds: 3, quarters: 4, fifths: 5, sixths: 6, eighths: 8, tenths: 10 };
    for (const d of [1, 2, 3] as const) for (const s of SEEDS) {
      const x = q("f2-diff-denominator", d, s);
      if (x.kind !== "number") throw new Error("expected a number");
      const [p, r] = [...x.prompt.matchAll(/\*\*(\w+)\*\*/g)].slice(0, 2).map((m) => NAMES[m[1]!]!);
      let smallest = Math.max(p!, r!);
      while (smallest % p! !== 0 || smallest % r! !== 0) smallest++;
      expect(x.answer, x.prompt).toBe(smallest);
      for (const t of x.traps ?? []) expect(t.value).not.toBe(smallest);
    }
  });

  it("names the classic mistakes: adding the bottoms, and adding before the pieces match", () => {
    const x = q("f2-add-diff", 2, 1);
    if (x.kind !== "choose") throw new Error("expected a choice");
    const tagged = x.options.map((o) => o.misconception).filter(Boolean);
    expect(tagged).toContain("fractions-2.add-denominators");
    const lesson = topic.lessons.find((l) => l.id === "add-different")!;
    expect(lesson.steps.some((s) => s.type === "lab")).toBe(true);
    expect(topic.skills.find((s) => s.id === "fractions-2.add-different")?.lessonId).toBe("add-different");
  });
});
