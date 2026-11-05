/**
 * Fractions (ARCH-003). Spec: docs/product/architecture/ARCH-003-maths.md.
 *
 * Two groups of functions:
 *  - Existing functions (gcd, simplify, equivalent, compare, scale, fractionOfAmount, missingNumerator,
 *    missingDenominator, parseFraction, isEqualPartition, toWords …) keep today's behaviour exactly. Their supported
 *    domain is small non-negative integers with products well inside the safe range; they do not check it, so
 *    callers validate first (§5).
 *  - Checked functions (assertFraction, add, subtract, multiply, divide, toMixed, fromMixed, shadedFraction) need
 *    safe-integer inputs and a positive denominator, check every intermediate product and sum, and throw RangeError
 *    instead of returning an imprecise or meaningless result. Results are in simplest form with a positive
 *    denominator; zero is 0/1; the sign is carried by the numerator (§1). Mixed numbers carry an authoritative sign
 *    (§2). Partitions are validated, and unequal parts give null (§4).
 */
import { assertSafeInteger, checkedAdd, checkedMultiply, gcdOf, lcm } from "./integer";

export { lcm } from "./integer";

export interface Fraction {
  n: number;
  d: number;
}

export const frac = (n: number, d: number): Fraction => ({ n, d });

export function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

export function isValidFraction(f: Fraction): boolean {
  return (
    Number.isInteger(f.n) && Number.isInteger(f.d) && f.d > 0 && f.n >= 0
  );
}

export function simplify(f: Fraction): Fraction {
  if (f.n === 0) return { n: 0, d: 1 };
  const g = gcd(f.n, f.d);
  return { n: f.n / g, d: f.d / g };
}

export function isSimplest(f: Fraction): boolean {
  return gcd(f.n, f.d) === 1;
}

/** Exact equivalence using cross-multiplication (no floating point). */
export function equivalent(a: Fraction, b: Fraction): boolean {
  return a.n * b.d === b.n * a.d;
}

export function sameFraction(a: Fraction, b: Fraction): boolean {
  return a.n === b.n && a.d === b.d;
}

export function compare(a: Fraction, b: Fraction): -1 | 0 | 1 {
  const left = a.n * b.d;
  const right = b.n * a.d;
  return left < right ? -1 : left > right ? 1 : 0;
}

export type CompareSymbol = "<" | "=" | ">";

export function compareSymbol(a: Fraction, b: Fraction): CompareSymbol {
  const c = compare(a, b);
  return c < 0 ? "<" : c > 0 ? ">" : "=";
}

export function scale(f: Fraction, k: number): Fraction {
  return { n: f.n * k, d: f.d * k };
}

/** Returns a/b of amount when it is a whole number, otherwise null. */
export function fractionOfAmount(f: Fraction, amount: number): number | null {
  const total = amount * f.n;
  return total % f.d === 0 ? total / f.d : null;
}

/** Equivalent fractions of f with denominators up to maxDen, in increasing order. */
export function equivalentsUpTo(f: Fraction, maxDen: number): Fraction[] {
  const base = simplify(f);
  const out: Fraction[] = [];
  for (let k = 1; base.d * k <= maxDen; k++) out.push(scale(base, k));
  return out;
}

/** The numerator that makes left = ?/den, or null if no whole number works. */
export function missingNumerator(left: Fraction, den: number): number | null {
  const v = (left.n * den) / left.d;
  return Number.isInteger(v) ? v : null;
}

/** The denominator that makes left = num/?, or null if no whole number works. */
export function missingDenominator(left: Fraction, num: number): number | null {
  if (left.n === 0) return null;
  const v = (left.d * num) / left.n;
  return Number.isInteger(v) ? v : null;
}

export function toDecimal(f: Fraction): number {
  return f.n / f.d;
}

export function format(f: Fraction): string {
  return `${f.n}/${f.d}`;
}

/** Parses "3/4" into a fraction; returns null for anything else. */
export function parseFraction(text: string): Fraction | null {
  const m = /^\s*(\d+)\s*\/\s*(\d+)\s*$/.exec(text);
  if (!m) return null;
  const f = { n: Number(m[1]), d: Number(m[2]) };
  return isValidFraction(f) ? f : null;
}

export function isEqualPartition(sizes: number[]): boolean {
  if (sizes.length === 0) return false;
  return sizes.every((s) => Math.abs(s - sizes[0]) < 1e-9);
}

const NUMBER_WORDS = [
  "zero", "one", "two", "three", "four", "five", "six",
  "seven", "eight", "nine", "ten", "eleven", "twelve",
];
const PART_SINGULAR: Record<number, string> = {
  1: "whole", 2: "half", 3: "third", 4: "quarter", 5: "fifth", 6: "sixth",
  7: "seventh", 8: "eighth", 9: "ninth", 10: "tenth", 11: "eleventh", 12: "twelfth",
};
const PART_PLURAL: Record<number, string> = {
  1: "wholes", 2: "halves", 3: "thirds", 4: "quarters", 5: "fifths", 6: "sixths",
  7: "sevenths", 8: "eighths", 9: "ninths", 10: "tenths", 11: "elevenths", 12: "twelfths",
};

export function partName(d: number, plural = true): string {
  return (plural ? PART_PLURAL[d] : PART_SINGULAR[d]) ?? `${d}ths`;
}

/** "3/4" → "three quarters", "1/2" → "one half" (UK naming). */
export function toWords(f: Fraction): string {
  const count = NUMBER_WORDS[f.n] ?? String(f.n);
  const part = f.n === 1 ? PART_SINGULAR[f.d] : PART_PLURAL[f.d];
  return `${count} ${part ?? `out of ${f.d}`}`;
}

/* ---------- Checked fraction arithmetic (ARCH-003 §1) ---------- */

/** Throws RangeError unless f has a safe-integer numerator and a positive safe-integer denominator. */
export function assertFraction(f: Fraction, name = "fraction"): Fraction {
  if (!f || typeof f !== "object") throw new RangeError(`${name} must be a fraction`);
  assertSafeInteger(f.n, `${name} numerator`);
  assertSafeInteger(f.d, `${name} denominator`);
  if (f.d <= 0) throw new RangeError(`${name} denominator must be positive, got ${f.d}`);
  return f;
}

/** Simplest form with a positive denominator; zero is 0/1. */
function normalise(n: number, d: number): Fraction {
  if (n === 0) return { n: 0, d: 1 };
  const g = gcdOf(n, d);
  return { n: n / g, d: d / g };
}

/** a + b, exact, in simplest form. */
export function add(a: Fraction, b: Fraction): Fraction {
  assertFraction(a, "a");
  assertFraction(b, "b");
  const d = lcm(a.d, b.d);
  return normalise(checkedAdd(checkedMultiply(a.n, d / a.d), checkedMultiply(b.n, d / b.d)), d);
}

/** a − b, exact, in simplest form (may be negative). */
export function subtract(a: Fraction, b: Fraction): Fraction {
  assertFraction(b, "b");
  return add(a, { n: checkedMultiply(b.n, -1), d: b.d });
}

/** a × b, exact, in simplest form. Cross-cancels first so in-range answers don't overflow needlessly. */
export function multiply(a: Fraction, b: Fraction): Fraction {
  assertFraction(a, "a");
  assertFraction(b, "b");
  const g1 = gcdOf(a.n, b.d) || 1;
  const g2 = gcdOf(b.n, a.d) || 1;
  return normalise(checkedMultiply(a.n / g1, b.n / g2), checkedMultiply(a.d / g2, b.d / g1));
}

/** a ÷ b, exact, in simplest form. RangeError when b is zero. */
export function divide(a: Fraction, b: Fraction): Fraction {
  assertFraction(a, "a");
  assertFraction(b, "b");
  if (b.n === 0) throw new RangeError("division by zero");
  const reciprocal = b.n < 0 ? { n: -b.d, d: -b.n } : { n: b.d, d: b.n };
  return multiply(a, reciprocal);
}

/* ---------- Mixed numbers (ARCH-003 §2) ---------- */

/** A mixed number with an authoritative sign: whole ≥ 0, 0 ≤ n < d, d > 0, fractional part in simplest form. */
export interface MixedNumber {
  sign: -1 | 0 | 1;
  whole: number;
  n: number;
  d: number;
}

/** −7/4 → { sign: -1, whole: 1, n: 3, d: 4 }; −3/4 → { sign: -1, whole: 0, n: 3, d: 4 }; 0 → { 0, 0, 0, 1 }. */
export function toMixed(f: Fraction): MixedNumber {
  assertFraction(f);
  const s = normalise(f.n, f.d);
  if (s.n === 0) return { sign: 0, whole: 0, n: 0, d: 1 };
  const abs = Math.abs(s.n);
  const rest = abs % s.d;
  return { sign: s.n < 0 ? -1 : 1, whole: (abs - rest) / s.d, n: rest, d: rest === 0 ? 1 : s.d };
}

/** The fraction (simplest form) for a mixed number; RangeError for anything outside the §2 rules. */
export function fromMixed(m: MixedNumber): Fraction {
  if (![-1, 0, 1].includes(m.sign)) throw new RangeError(`sign must be -1, 0 or 1, got ${String(m.sign)}`);
  assertSafeInteger(m.whole, "whole");
  assertSafeInteger(m.n, "numerator");
  assertSafeInteger(m.d, "denominator");
  if (m.whole < 0 || m.n < 0) throw new RangeError("whole and numerator must not be negative: the sign field carries the sign");
  if (m.d <= 0) throw new RangeError(`denominator must be positive, got ${m.d}`);
  if (m.n >= m.d) throw new RangeError(`the fractional part must be proper (n < d), got ${m.n}/${m.d}`);
  if (m.n === 0 && m.d !== 1) throw new RangeError("a whole number is written with n = 0 and d = 1");
  if (m.n > 0 && gcdOf(m.n, m.d) !== 1) throw new RangeError(`the fractional part must be in simplest form, got ${m.n}/${m.d}`);
  const isZero = m.whole === 0 && m.n === 0;
  if (m.sign === 0 && !isZero) throw new RangeError("sign 0 is only for zero");
  if (m.sign !== 0 && isZero) throw new RangeError("zero must have sign 0");
  if (isZero) return { n: 0, d: 1 };
  return { n: m.sign * checkedAdd(checkedMultiply(m.whole, m.d), m.n), d: m.d };
}

/* ---------- Partitions (ARCH-003 §4) ---------- */

/**
 * The fraction a partition shows: `shaded` parts out of `sizes.length`, not simplified (2 of 4 is 2/4).
 * Unequal parts are valid input but show no equal-part fraction, so the result is null. RangeError for an
 * empty partition, a size that isn't a positive finite number, or a shaded index that is not an integer,
 * is out of range or is repeated.
 */
export function shadedFraction(sizes: readonly number[], shaded: readonly number[]): Fraction | null {
  if (sizes.length === 0) throw new RangeError("a partition needs at least one part");
  sizes.forEach((s, i) => {
    if (!Number.isFinite(s) || s <= 0) throw new RangeError(`part ${i} has size ${s}; sizes must be positive`);
  });
  const seen = new Set<number>();
  for (const i of shaded) {
    if (!Number.isInteger(i) || i < 0 || i >= sizes.length) throw new RangeError(`shaded index ${i} is not a part of this partition`);
    if (seen.has(i)) throw new RangeError(`shaded index ${i} is repeated`);
    seen.add(i);
  }
  return isEqualPartition([...sizes]) ? { n: shaded.length, d: sizes.length } : null;
}
