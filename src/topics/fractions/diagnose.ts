import { M } from "./misconceptions";
import type { CompareSymbol, Fraction } from "./math";
import { compare, compareSymbol, sameFraction } from "./math";

/**
 * Possible reasons a child named a diagram's fraction incorrectly.
 * total = number of equal parts (or gaps on a number line), counted = the parts asked about.
 */
export function diagnoseNamedFraction(
  given: Fraction,
  ctx: { total: number; counted: number },
): string[] {
  const { total, counted } = ctx;
  if (given.n * total === counted * given.d) return [];
  const out: string[] = [];
  if (given.n === total && given.d === counted && counted !== total) out.push(M.SWAP);
  const others = total - counted;
  if (given.n === counted && others > 0 && given.d === others) out.push(M.PART_PART);
  if (given.n === counted && given.d !== total && Math.abs(given.d - total) === 1) {
    out.push(M.MISCOUNT);
  }
  return out;
}

export function diagnoseCompare(
  left: Fraction,
  right: Fraction,
  chosen: CompareSymbol,
): string[] {
  const correct = compareSymbol(left, right);
  if (chosen === correct) return [];
  const sameNumerator = left.n === right.n && left.d !== right.d;
  if (sameNumerator && chosen !== "=") {
    const childThinksLeftBigger = chosen === ">";
    const leftHasBiggerDen = left.d > right.d;
    if (childThinksLeftBigger === leftHasBiggerDen) return [M.BIGGER_DEN];
  }
  return [];
}

export function diagnoseFractionOf(
  f: Fraction,
  amount: number,
  given: number,
): string[] {
  const correct = (amount * f.n) / f.d;
  if (given === correct) return [];
  const out: string[] = [];
  if (f.n > 1 && given === amount / f.d) out.push(M.UNIT_ONLY);
  if (f.n > 1 && given === amount / f.n) out.push(M.SWAP);
  return out;
}

/** a/b = ?/D or a/b = C/? — detects "add the same number" reasoning. */
export function diagnoseMissingNumber(
  left: Fraction,
  right: { n?: number; d?: number },
  given: number,
): string[] {
  if (right.d !== undefined && right.n === undefined) {
    if (given === left.n + (right.d - left.d)) return [M.ADDITIVE];
  }
  if (right.n !== undefined && right.d === undefined) {
    if (given === left.d + (right.n - left.n)) return [M.ADDITIVE];
  }
  return [];
}

export function diagnoseShade(
  target: Fraction,
  parts: number,
  shadedCount: number,
): string[] {
  if (shadedCount * target.d === target.n * parts) return [];
  if (shadedCount === target.d && target.n !== target.d && parts >= target.d) {
    return [M.SWAP];
  }
  return [];
}

export function isCorrectFraction(given: Fraction, answer: Fraction, allowEquivalent: boolean) {
  return allowEquivalent
    ? compare(given, answer) === 0
    : sameFraction(given, answer);
}
