import { describe, expect, it } from "vitest";
import {
  add,
  assertFraction,
  compare,
  compareSymbol,
  divide,
  equivalent,
  fractionOfAmount,
  fromMixed,
  gcd,
  isSimplest,
  multiply,
  shadedFraction,
  simplify,
  subtract,
  toMixed,
  type Fraction,
  type MixedNumber,
} from "./fraction";
import { checkedAdd, checkedMultiply, divmod, factors, gcdOf, isFactor, lcm } from "./integer";
import { PLACE, digitIn } from "./place-value";

/**
 * QA-001 / ARCH-003: the maths modules (spec: docs/product/architecture/ARCH-003-maths.md).
 * Expected values are worked out by hand and written into the tables. The property checks use an independent
 * BigInt oracle written here, never the function under test.
 */

const F = (n: number, d: number): Fraction => ({ n, d });
const MAX = Number.MAX_SAFE_INTEGER;

/** Independent exact oracle: a/b as a reduced BigInt pair, written without the module under test. */
const B0 = BigInt(0);
const B1 = BigInt(1);
function oracle(n: bigint, d: bigint): [bigint, bigint] {
  if (d < B0) [n, d] = [-n, -d];
  if (n === B0) return [B0, B1];
  let [a, b] = [n < B0 ? -n : n, d];
  while (b !== B0) [a, b] = [b, a % b];
  return [n / a, d / a];
}
function seeded(seed: number) {
  let s = seed >>> 0;
  return (lo: number, hi: number) => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return lo + (s % (hi - lo + 1));
  };
}

describe("fraction arithmetic (ARCH-003 §1)", () => {
  it("adds, subtracts, multiplies and divides exactly, in simplest form (hand-worked table)", () => {
    // [a, b, a+b, a−b, a×b, a÷b], each worked by hand.
    const table: [Fraction, Fraction, Fraction, Fraction, Fraction, Fraction][] = [
      [F(1, 2), F(1, 3), F(5, 6), F(1, 6), F(1, 6), F(3, 2)],
      [F(3, 4), F(1, 4), F(1, 1), F(1, 2), F(3, 16), F(3, 1)],
      [F(2, 5), F(3, 10), F(7, 10), F(1, 10), F(3, 25), F(4, 3)],
      [F(5, 6), F(7, 8), F(41, 24), F(-1, 24), F(35, 48), F(20, 21)],
      [F(0, 3), F(2, 7), F(2, 7), F(-2, 7), F(0, 1), F(0, 1)],
      [F(7, 4), F(5, 4), F(3, 1), F(1, 2), F(35, 16), F(7, 5)],
      [F(-1, 2), F(1, 3), F(-1, 6), F(-5, 6), F(-1, 6), F(-3, 2)],
      [F(6, 8), F(2, 4), F(5, 4), F(1, 4), F(3, 8), F(3, 2)],
    ];
    for (const [a, b, sum, diff, prod, quot] of table) {
      expect(add(a, b), `${a.n}/${a.d} + ${b.n}/${b.d}`).toEqual(sum);
      expect(subtract(a, b), `${a.n}/${a.d} − ${b.n}/${b.d}`).toEqual(diff);
      expect(multiply(a, b), `${a.n}/${a.d} × ${b.n}/${b.d}`).toEqual(prod);
      expect(divide(a, b), `${a.n}/${a.d} ÷ ${b.n}/${b.d}`).toEqual(quot);
    }
  });

  it("matches an independent BigInt oracle on 2,000 seeded cases, including negatives", () => {
    const r = seeded(20261105);
    for (let i = 0; i < 2000; i++) {
      const a = F(r(-60, 60), r(1, 40));
      const b = F(r(-60, 60), r(1, 40));
      const [an, ad, bn, bd] = [a.n, a.d, b.n, b.d].map(BigInt);
      const expectPair = (got: Fraction, [n, d]: [bigint, bigint], what: string) => expect([BigInt(got.n), BigInt(got.d)], what).toEqual([n, d]);
      expectPair(add(a, b), oracle(an * bd + bn * ad, ad * bd), "add");
      expectPair(subtract(a, b), oracle(an * bd - bn * ad, ad * bd), "subtract");
      expectPair(multiply(a, b), oracle(an * bn, ad * bd), "multiply");
      if (b.n !== 0) expectPair(divide(a, b), oracle(an * bd, ad * bn), "divide");
      // Cross-check: compare agrees with the oracle's sign of a − b.
      const diff = an * bd - bn * ad;
      expect(compare(a, b)).toBe(diff < B0 ? -1 : diff > B0 ? 1 : 0);
    }
  });

  it("rejects zero or negative denominators, non-integers, NaN and Infinity", () => {
    for (const bad of [F(1, 0), F(1, -2), F(1.5, 2), F(1, 2.5), F(NaN, 2), F(1, Infinity), F(Infinity, 1)]) {
      expect(() => add(bad, F(1, 2)), JSON.stringify(bad)).toThrow(RangeError);
      expect(() => assertFraction(bad)).toThrow(RangeError);
    }
  });

  it("refuses division by zero", () => {
    expect(() => divide(F(1, 2), F(0, 5))).toThrow(/division by zero/);
  });

  it("throws on overflow instead of returning an imprecise answer", () => {
    expect(() => add(F(MAX, 1), F(1, 1))).toThrow(/overflows/);
    expect(() => multiply(F(MAX, 1), F(2, 1))).toThrow(/overflows/);
    expect(() => add(F(1, 100000007), F(1, 100000037))).toThrow(/overflows/); // lcm = 100000007 × 100000037 ≈ 1.0e16 > 2^53
    // In range after cross-cancelling: (MAX/1) × (1/MAX) = 1.
    expect(multiply(F(MAX, 1), F(1, MAX))).toEqual(F(1, 1));
  });
});

describe("existing fraction functions (behaviour kept, ARCH-003 §5)", () => {
  it("simplifies, compares and tests equivalence on the supported domain (hand-worked)", () => {
    expect(simplify(F(6, 8))).toEqual(F(3, 4));
    expect(simplify(F(12, 4))).toEqual(F(3, 1));
    expect(simplify(F(0, 7))).toEqual(F(0, 1));
    expect(isSimplest(F(3, 4))).toBe(true);
    expect(isSimplest(F(4, 6))).toBe(false);
    expect(equivalent(F(2, 4), F(3, 6))).toBe(true);
    expect(equivalent(F(2, 3), F(3, 4))).toBe(false);
    expect(compareSymbol(F(1, 5), F(1, 3))).toBe("<");
    expect(compareSymbol(F(3, 4), F(6, 8))).toBe("=");
    expect(compareSymbol(F(5, 6), F(4, 5))).toBe(">");
    expect(gcd(48, 18)).toBe(6);
    expect(gcd(-12, 8)).toBe(4);
    expect(gcd(0, 9)).toBe(9);
  });

  it("finds fractions of quantities only when the answer is whole (hand-worked)", () => {
    expect(fractionOfAmount(F(3, 4), 12)).toBe(9);
    expect(fractionOfAmount(F(2, 5), 35)).toBe(14);
    expect(fractionOfAmount(F(1, 3), 10)).toBeNull();
    expect(fractionOfAmount(F(0, 6), 18)).toBe(0);
    expect(fractionOfAmount(F(5, 5), 7)).toBe(7);
  });
});

describe("mixed numbers (ARCH-003 §2)", () => {
  it("converts with an authoritative sign and canonical zero (hand-worked)", () => {
    // [fraction, mixed number, the fraction fromMixed gives back], all worked by hand.
    const table: [Fraction, MixedNumber, Fraction][] = [
      [F(-7, 4), { sign: -1, whole: 1, n: 3, d: 4 }, F(-7, 4)],
      [F(-3, 4), { sign: -1, whole: 0, n: 3, d: 4 }, F(-3, 4)],
      [F(7, 4), { sign: 1, whole: 1, n: 3, d: 4 }, F(7, 4)],
      [F(6, 4), { sign: 1, whole: 1, n: 1, d: 2 }, F(3, 2)],
      [F(8, 4), { sign: 1, whole: 2, n: 0, d: 1 }, F(2, 1)],
      [F(0, 9), { sign: 0, whole: 0, n: 0, d: 1 }, F(0, 1)],
      [F(-10, 5), { sign: -1, whole: 2, n: 0, d: 1 }, F(-2, 1)],
    ];
    for (const [f, m, back] of table) {
      expect(toMixed(f), `${f.n}/${f.d}`).toEqual(m);
      expect(fromMixed(m), `${f.n}/${f.d} back`).toEqual(back);
    }
  });

  it("rejects mixed numbers outside the rules", () => {
    const bad: MixedNumber[] = [
      { sign: 1, whole: -1, n: 1, d: 2 }, // negative whole: the sign field carries the sign
      { sign: -1, whole: 0, n: -3, d: 4 }, // negative numerator
      { sign: 1, whole: 1, n: 4, d: 4 }, // improper fractional part
      { sign: 1, whole: 1, n: 2, d: 4 }, // not simplest
      { sign: 0, whole: 1, n: 0, d: 1 }, // sign 0 for a non-zero value
      { sign: 1, whole: 0, n: 0, d: 1 }, // zero with a sign
      { sign: 1, whole: 2, n: 0, d: 3 }, // whole number must use d = 1
      { sign: 1, whole: 1, n: 1, d: 0 }, // zero denominator
      { sign: 2 as 1, whole: 1, n: 0, d: 1 }, // invalid sign
    ];
    for (const m of bad) expect(() => fromMixed(m), JSON.stringify(m)).toThrow(RangeError);
  });
});

describe("integers (ARCH-003 §1, §3)", () => {
  it("divides with a non-negative remainder (Euclidean, hand-worked)", () => {
    const table: [number, number, number, number][] = [
      [17, 5, 3, 2],
      [-7, 2, -4, 1],
      [7, -2, -3, 1],
      [-7, -2, 4, 1],
      [0, 3, 0, 0],
      [12, 4, 3, 0],
    ];
    for (const [a, b, q, r] of table) {
      expect(divmod(a, b), `${a} divmod ${b}`).toEqual({ q, r });
      expect(q * b + r).toBe(a); // the definition, checked on the hand-worked values
    }
    expect(() => divmod(5, 0)).toThrow(/division by zero/);
    expect(() => divmod(5.5, 2)).toThrow(RangeError);
  });

  it("lists factors and multiples (hand-worked)", () => {
    expect(factors(1)).toEqual([1]);
    expect(factors(12)).toEqual([1, 2, 3, 4, 6, 12]);
    expect(factors(36)).toEqual([1, 2, 3, 4, 6, 9, 12, 18, 36]);
    expect(factors(13)).toEqual([1, 13]);
    expect(() => factors(0)).toThrow(RangeError);
    expect(() => factors(-6)).toThrow(RangeError);
    expect(isFactor(3, 12)).toBe(true);
    expect(isFactor(5, 12)).toBe(false);
    expect(() => isFactor(0, 12)).toThrow(/division by zero/);
    expect(lcm(4, 6)).toBe(12);
    expect(lcm(0, 6)).toBe(0);
    expect(lcm(-4, 6)).toBe(12);
    expect(() => lcm(100000007, 100000037)).toThrow(/overflows/);
    expect(lcm(94906267, 94906263)).toBe(9007199136250221); // just below 2^53: still exact
    expect(() => checkedMultiply(MAX, 2)).toThrow(/overflows/);
    expect(() => checkedAdd(MAX, 1)).toThrow(/overflows/);
  });

  it("finds digits by place value (hand-worked, moved from a UI file without change)", () => {
    expect(PLACE.Th).toBe(1000);
    expect(digitIn(4527, "Th")).toBe(4);
    expect(digitIn(4527, "H")).toBe(5);
    expect(digitIn(4527, "O")).toBe(7);
    expect(digitIn(4527, "TTh")).toBeNull(); // a leading blank
    expect(digitIn(7, "O")).toBe(7);
    expect(digitIn(0, "O")).toBe(0);
    expect(digitIn(3.47, "t")).toBe(4);
    expect(digitIn(3.47, "h")).toBe(7);
    expect(digitIn(-305, "T")).toBe(0);
  });
});

/** Independent exact Euclidean division in BigInt: a = q·b + r with 0 ≤ r < |b|. Written here, not taken from the module. */
function euclid(a: number, b: number): { q: bigint; r: bigint } {
  const [A, B] = [BigInt(a), BigInt(b)];
  const m = B < B0 ? -B : B;
  let r = A % m;
  if (r < B0) r += m;
  return { q: (A - r) / B, r };
}
const EXTREMES = [0, 1, -1, 2, -2, 3, -3, 7, -7, MAX - 1, -(MAX - 1), MAX, -MAX, 2 ** 52, -(2 ** 52), 2 ** 52 + 1];

describe("divmod is exact across the safe range (DEF-029, ARCH-003 §3)", () => {
  it("returns the reproduced case exactly: divmod(2, MAX) = { q: 0, r: 2 }", () => {
    expect(divmod(2, MAX)).toEqual({ q: 0, r: 2 });
    expect(divmod(-2, MAX)).toEqual({ q: -1, r: MAX - 2 });
    expect(divmod(2, -MAX)).toEqual({ q: 0, r: 2 });
  });

  it("matches a BigInt oracle for every pair of safe-integer extremes, both divisor signs, zero and negative dividends", () => {
    for (const a of EXTREMES) {
      for (const b of EXTREMES.filter((x) => x !== 0)) {
        const want = euclid(a, b);
        const got = divmod(a, b);
        expect({ q: BigInt(got.q), r: BigInt(got.r) }, `divmod(${a}, ${b})`).toEqual(want);
        expect(Number.isSafeInteger(got.q) && Number.isSafeInteger(got.r), `${a}, ${b}: safe results`).toBe(true);
        expect(Object.is(got.q, -0) || Object.is(got.r, -0), `${a}, ${b}: no negative zero`).toBe(false);
        // The definition, in BigInt: a = q·b + r and 0 ≤ r < |b|.
        expect(BigInt(got.q) * BigInt(b) + BigInt(got.r)).toBe(BigInt(a));
        expect(BigInt(got.r) >= B0 && BigInt(got.r) < (BigInt(b) < B0 ? -BigInt(b) : BigInt(b))).toBe(true);
      }
    }
  });

  it("handles divisors larger than the dividend (hand-worked) and zero dividends", () => {
    expect(divmod(5, 9)).toEqual({ q: 0, r: 5 });
    expect(divmod(-5, 9)).toEqual({ q: -1, r: 4 });
    expect(divmod(5, -9)).toEqual({ q: 0, r: 5 });
    expect(divmod(-5, -9)).toEqual({ q: 1, r: 4 });
    expect(divmod(0, 7)).toEqual({ q: 0, r: 0 });
    expect(divmod(0, -7)).toEqual({ q: 0, r: 0 });
  });

  it("matches the oracle on 3,000 seeded cases across the whole safe range", () => {
    let s = 20261106;
    const next = () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 2 ** 32;
    const big = () => Math.floor((next() * 2 - 1) * MAX);
    for (let i = 0; i < 3000; i++) {
      const a = i % 3 === 0 ? big() : Math.floor((next() * 2 - 1) * 1000);
      let b = i % 2 === 0 ? big() : Math.floor((next() * 2 - 1) * 50);
      if (b === 0) b = 1;
      const want = euclid(a, b);
      const got = divmod(a, b);
      expect({ q: BigInt(got.q), r: BigInt(got.r) }, `divmod(${a}, ${b})`).toEqual(want);
    }
  });
});

describe("other integer functions at the extremes, against BigInt (DEF-029 review)", () => {
  const big = (n: number) => BigInt(n);
  const bgcd = (a: bigint, b: bigint): bigint => {
    a = a < B0 ? -a : a;
    b = b < B0 ? -b : b;
    while (b !== B0) [a, b] = [b, a % b];
    return a;
  };
  it("gcd, lcm and the checked add and multiply are exact or throw, never imprecise", () => {
    const vals = [0, 1, -1, 2, 6, 9007199136250221, MAX, -MAX, MAX - 1, 94906267, 94906263, 3 ** 33];
    const limit = BigInt(MAX);
    for (const a of vals) {
      for (const b of vals) {
        expect(BigInt(gcdOf(a, b)), `gcd(${a}, ${b})`).toBe(bgcd(big(a), big(b)));
        const l = a === 0 || b === 0 ? B0 : (big(a) < B0 ? -big(a) : big(a)) / bgcd(big(a), big(b)) * (big(b) < B0 ? -big(b) : big(b));
        if (l <= limit) expect(BigInt(lcm(a, b)), `lcm(${a}, ${b})`).toBe(l);
        else expect(() => lcm(a, b), `lcm(${a}, ${b}) overflows`).toThrow(/overflows/);
        const p = big(a) * big(b);
        if (p <= limit && p >= -limit) expect(BigInt(checkedMultiply(a, b))).toBe(p);
        else expect(() => checkedMultiply(a, b)).toThrow(/overflows/);
        const sum = big(a) + big(b);
        if (sum <= limit && sum >= -limit) expect(BigInt(checkedAdd(a, b))).toBe(sum);
        else expect(() => checkedAdd(a, b)).toThrow(/overflows/);
      }
    }
  });

  it("converts the largest fractions to mixed numbers exactly", () => {
    expect(toMixed(F(MAX, 2))).toEqual({ sign: 1, whole: (MAX - 1) / 2, n: 1, d: 2 });
    expect(toMixed(F(-MAX, 2))).toEqual({ sign: -1, whole: (MAX - 1) / 2, n: 1, d: 2 });
    expect(toMixed(F(-MAX, 1))).toEqual({ sign: -1, whole: MAX, n: 0, d: 1 });
    expect(fromMixed({ sign: -1, whole: (MAX - 1) / 2, n: 1, d: 2 })).toEqual(F(-MAX, 2));
  });
});

describe("partition mapping (ARCH-003 §4)", () => {
  it("maps shaded equal parts to the fraction the picture shows, unsimplified (hand-worked)", () => {
    expect(shadedFraction([1, 1, 1, 1], [0, 2])).toEqual(F(2, 4));
    expect(shadedFraction([1, 1, 1], [])).toEqual(F(0, 3));
    expect(shadedFraction([2, 2, 2, 2, 2], [0, 1, 2, 3, 4])).toEqual(F(5, 5));
    expect(shadedFraction([1], [0])).toEqual(F(1, 1));
  });

  it("gives no fraction for unequal parts, and rejects invalid partitions", () => {
    expect(shadedFraction([1, 1, 2], [0])).toBeNull();
    expect(() => shadedFraction([], [])).toThrow(RangeError);
    expect(() => shadedFraction([1, 0, 1], [0])).toThrow(RangeError);
    expect(() => shadedFraction([1, -1], [0])).toThrow(RangeError);
    expect(() => shadedFraction([1, NaN], [0])).toThrow(RangeError);
    expect(() => shadedFraction([1, 1], [2])).toThrow(/not a part/);
    expect(() => shadedFraction([1, 1], [0.5])).toThrow(/not a part/);
    expect(() => shadedFraction([1, 1], [1, 1])).toThrow(/repeated/);
  });
});
