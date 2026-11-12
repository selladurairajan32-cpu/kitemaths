import { describe, expect, it } from "vitest";
import { topicById } from "@/topics";
import { genId } from "@/topics/kit/define";
import type { KitQuestion } from "@/topics/kit/types";
import { fromHundredths, twoPlaces } from "./decimals/journey";

/**
 * D-050: the question makers added for the first batch of hard concepts. Each answer is checked against an independent
 * oracle: the numbers are read back out of the question's own words and worked out here by hand rules, over many seeds.
 */

type Choose = KitQuestion & { kind: "choose"; options: { text: string; misconception?: string }[]; answer: number };
type Num = KitQuestion & { kind: "number"; answer: number };
const q = <T,>(topic: string, key: string, d: 1 | 2 | 3, seed: number) => topicById(topic)!.questionById(genId(topic, key, d, seed)) as unknown as T;
const SEEDS = Array.from({ length: 60 }, (_, i) => i * 7919 + 13);
/** "0.35" → 35 hundredths, by reading the digits (no floating point). */
const hundredths = (s: string) => {
  const [w, f = ""] = s.split(".");
  return Number(w) * 100 + Number(f.padEnd(2, "0"));
};
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

describe("journey question makers (D-050)", () => {
  it("writes hundredths as decimals (hand-worked table)", () => {
    expect([35, 40, 240, 205, 1240, 7].map(fromHundredths)).toEqual(["0.35", "0.4", "2.4", "2.05", "12.4", "0.07"]);
    expect([40, 1240, 7].map(twoPlaces)).toEqual(["0.40", "12.40", "0.07"]);
  });

  it("decimals: the why-question's two numbers really have the shorter one bigger, and the right reason is marked", () => {
    for (const s of SEEDS) {
      const x = q<Choose>("decimals", "dc-compare-why", 2, s);
      const [, longS, shortS] = /\*\*([\d.]+) is bigger than ([\d.]+)\*\*/.exec(x.prompt)!;
      expect(hundredths(shortS!)).toBeGreaterThan(hundredths(longS!));
      expect(longS!.split(".")[1]!.length).toBeGreaterThan(shortS!.split(".")[1]!.length);
      expect(x.options[x.answer]!.text).toMatch(/is the same as/);
      expect(x.options.some((o) => o.misconception === "decimals.longer-is-bigger")).toBe(true);
    }
  });

  it("decimals: real life picks the longer jump, and the fastest (smallest) race time", () => {
    for (const s of SEEDS) {
      const a = q<Choose>("decimals", "dc-compare-apply", 2, s);
      const m = /, (\w+) jumped \*\*([\d.]+) m\*\* and (\w+) jumped \*\*([\d.]+) m\*\*/.exec(a.prompt.replace(/^In the long jump/, ","))!;
      const best = hundredths(m[2]!) > hundredths(m[4]!) ? m[1] : m[3];
      expect(a.options[a.answer]!.text).toBe(best);
      const b = q<Choose>("decimals", "dc-compare-apply", 3, s);
      const times = [...b.prompt.matchAll(/(\w+) \*\*([\d.]+)\*\*/g)].map((t) => ({ name: t[1]!, h: hundredths(t[2]!) }));
      expect(times).toHaveLength(3);
      expect(b.options[b.answer]!.text).toBe(times.reduce((m2, t) => (t.h < m2.h ? t : m2)).name);
    }
  });

  it("percentages: the wrong claim really divides by the percentage, and the right answer is p out of every 100", () => {
    for (const s of SEEDS) {
      const x = q<Choose>("percentages", "pc-amount-why", 2, s);
      const [, p, amount, wrong] = /\*\*(\d+)% of (\d+) = \d+ ÷ \d+ = ([\d.]+)\*\*/.exec(x.prompt)!;
      expect(hundredths(wrong!) * Number(p)).toBe(Number(amount) * 100);
      expect(x.explanation).toContain(`is **${(Number(p) * Number(amount)) / 100}**`);
      expect(x.options[x.answer]!.text).toMatch(/out of every 100/);
    }
  });

  it("fractions: a fraction of a fraction in real life, and why multiplying by a fraction makes it smaller", () => {
    for (const s of SEEDS) {
      for (const d of [2, 3] as const) {
        const x = q<Choose>("fractions-2", "f2-ff-apply", d, s);
        const fr = [...x.prompt.matchAll(/\{(\d+)\/(\d+)\}/g)].map((m) => [Number(m[1]), Number(m[2])] as const);
        const [[bn, bd], [an, ad]] = [fr[0]!, fr[1]!];
        const g = gcd(an * bn, ad * bd);
        expect(x.options[x.answer]!.text.replace(/[{}]/g, "")).toBe(`${(an * bn) / g}/${(ad * bd) / g}`);
      }
      const w = q<Choose>("fractions-2", "f2-ff-why", 2, s);
      expect(w.options[w.answer]!.text).toMatch(/less than all of it/);
      expect(w.options.some((o) => o.misconception === "fractions-2.times-makes-bigger")).toBe(true);
    }
  });

  it("division: the remainder means round up, round down, or what is left, as the story says", () => {
    for (const s of SEEDS) {
      for (const d of [2, 3] as const) {
        const x = q<Num>("multiply-divide", "md-rem-apply", d, s);
        const nums = [...x.prompt.matchAll(/\*\*£?(\d+)/g)].map((m) => Number(m[1]));
        const [a, b] = /costs/.test(x.prompt) ? [nums[1]!, nums[0]!] : /packs of/.test(x.prompt) ? [nums[1]!, nums[0]!] : [nums[0]!, nums[1]!];
        const full = Math.floor(a / b);
        const left = a - full * b;
        expect(left).toBeGreaterThan(0);
        const want = /left over/.test(x.prompt) ? left : /needed/.test(x.prompt) ? full + 1 : full;
        expect(x.answer, x.prompt).toBe(want);
      }
      const w = q<Choose>("multiply-divide", "md-rem-why", 2, s);
      const [, n, cap] = /\*\*(\d+) children\*\* go on a trip in minibuses that hold \*\*(\d+)\*\*/.exec(w.prompt)!;
      expect(w.options[w.answer]!.text).toContain(`${Math.ceil(Number(n) / Number(cap))} minibuses`);
    }
  });
});
