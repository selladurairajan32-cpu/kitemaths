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
