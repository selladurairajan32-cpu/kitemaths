import { describe, expect, it } from "vitest";
import { topicById } from "@/topics";
import { genId } from "@/topics/kit/define";
import type { KitQuestion } from "@/topics/kit/types";
import { FRACTIONS2_DEEP } from "./deep";

/**
 * D-055: the exam-standard Fractions 2 questions. Every answer is checked against answers worked out by hand (the table
 * below), over many seeds, so every hand-picked item is reached. Options are read back as numbers with a separate
 * parser and compared by cross-multiplying, not with the fraction maths the makers use.
 */

const topic = topicById("fractions-2")!;
const SEEDS = Array.from({ length: 120 }, (_, i) => i * 7919 + 13);
const get = (key: string, seed: number) => topic.questionById(genId("fractions-2", key, 3, seed)) as KitQuestion;

/** "2 {7/12}" → [31, 12]; "{3/4}" → [3, 4]; "3" → [3, 1]; unsimplified as written. */
function parse(text: string): [number, number] {
  const m = /^(?:(\d+) )?\{(\d+)\/(\d+)\}$/.exec(text.trim());
  if (m) {
    const w = Number(m[1] ?? 0);
    const d = Number(m[3]);
    return [w * d + Number(m[2]), d];
  }
  if (/^\d+$/.test(text.trim())) return [Number(text), 1];
  throw new Error(`Can't read ${text}`);
}
const same = (a: [number, number], b: [number, number]) => a[0] * b[1] === b[0] * a[1];
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const key = ([n, d]: [number, number]) => {
  const g = gcd(n, d);
  return `${n / g}/${d / g}`;
};

/** The right answer of every item, worked out by hand. */
const HAND: Record<string, string[]> = {
  "f2x-simp-big": ["2/3", "3/4", "4/7", "3/5"],
  "f2x-missing": ["35/1", "28/1", "49/1", "21/1", "81/1"],
  "f2x-order": ["7/12", "7/10", "3/8", "11/15"],
  "f2x-between": ["9/20", "5/12", "31/40", "31/48"],
  "f2x-simp-word": ["5/8", "3/5", "7/12"],
  "f2x-add-mixed": ["55/12", "64/15", "127/24", "43/10"],
  "f2x-sub-mixed": ["23/15", "17/12", "39/14", "19/12"],
  "f2x-left": ["4/15", "3/8", "8/21", "1/12"],
  "f2x-missing-add": ["7/12", "13/24", "1/2", "11/18"],
  "f2x-times-mixed": ["7/2", "14/3", "21/5", "3/1"],
  "f2x-of-of": ["18/1", "30/1", "14/1"],
  "f2x-remainder": ["1/4", "2/5", "1/2"],
  "f2x-reverse": ["27/1", "40/1", "56/1", "63/1"],
  "f2x-area": ["1/2", "3/10", "7/12"],
};

describe("exam-standard Fractions 2 questions (D-055)", () => {
  it("gives the hand-worked answer for every item, and reaches every item", () => {
    for (const [k, answers] of Object.entries(HAND)) {
      const found = new Set<string>();
      for (const s of SEEDS) {
        const q = get(k, s);
        found.add(key(q.kind === "choose" ? parse(q.options[q.answer].text) : [q.answer, 1]));
      }
      expect([...found].sort(), k).toEqual([...answers].sort());
    }
  });

  it("never marks a right answer wrong: a wrong option has another value, or is equal but not simplified", () => {
    for (const k of Object.keys(HAND)) {
      for (const s of SEEDS) {
        const q = get(k, s);
        expect([q.hint, ...(q.hints ?? [])].filter(Boolean).length, k).toBeGreaterThanOrEqual(2);
        if (q.kind === "number") {
          for (const t of q.traps ?? []) expect(t.value, k).not.toBe(q.answer);
          continue;
        }
        const right = parse(q.options[q.answer].text);
        expect(gcd(right[0], right[1]), `${k}: right answer in simplest form`).toBe(1);
        expect(new Set(q.options.map((o) => o.text)).size, k).toBe(q.options.length);
        expect(q.options.length, k).toBeGreaterThanOrEqual(3);
        q.options.forEach((o, i) => {
          if (i === q.answer) return;
          const v = parse(o.text);
          expect(!same(v, right) || gcd(v[0], v[1]) !== 1, `${k}: ${o.text}`).toBe(true);
        });
      }
    }
  });

  it("between: the right option lies strictly between the two fractions and the others don't", () => {
    for (const s of SEEDS) {
      const q = get("f2x-between", s);
      if (q.kind !== "choose") throw new Error("choose expected");
      const [a, b] = [...q.prompt.matchAll(/\{(\d+)\/(\d+)\}/g)].map((m) => [Number(m[1]), Number(m[2])] as [number, number]);
      const inside = (v: [number, number]) => v[0] * a[1] > a[0] * v[1] && v[0] * b[1] < b[0] * v[1];
      q.options.forEach((o, i) => expect(inside(parse(o.text)), o.text).toBe(i === q.answer));
    }
  });

  it("every deep sub-topic names a real lesson and skill, and its exercise questions exist", () => {
    for (const d of FRACTIONS2_DEEP) {
      expect(topic.lessonById(d.lessonId), d.lessonId).toBeDefined();
      expect(topic.skillById(d.skill).lessonId).toBe(d.lessonId);
      expect(d.scenes.length).toBeGreaterThanOrEqual(3);
      expect(d.examples.map((e) => e.level)).toContain("GCSE");
      for (const id of d.exercise) expect(topic.questionById(id).skill).toBe(d.skill);
    }
  });
});
