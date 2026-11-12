/**
 * Ratio and proportion (Y6.RP.1 to Y6.RP.4; D-040). Exact on safe whole numbers: anything that wouldn't share or scale
 * into whole amounts throws a RangeError, so a caller never shows a rounded answer as if it were exact.
 */
import { assertSafeInteger, checkedMultiply, divmod, gcdOf } from "./integer";

/** a : b … in simplest form: 6 : 9 → 2 : 3. Every part must be a whole number ≥ 1. */
export function simplifyRatio(parts: number[]): number[] {
  if (parts.length < 2) throw new RangeError("A ratio needs at least two parts");
  for (const p of parts) if (assertSafeInteger(p, "part") < 1) throw new RangeError("Ratio parts must be at least 1");
  const g = parts.reduce((acc, p) => gcdOf(acc, p));
  return parts.map((p) => p / g);
}

/**
 * Shares `total` in the ratio `parts`: 35 in 2 : 3 → one part 7, shares [14, 21]. Throws a RangeError unless the total
 * divides exactly into the number of parts.
 */
export function shareInRatio(total: number, parts: number[]): { onePart: number; shares: number[]; partCount: number } {
  assertSafeInteger(total, "total");
  if (total < 0) throw new RangeError("The total must not be negative");
  for (const p of parts) if (assertSafeInteger(p, "part") < 1) throw new RangeError("Ratio parts must be at least 1");
  const partCount = parts.reduce((a, b) => a + b, 0);
  const { q, r } = divmod(total, partCount);
  if (r !== 0) throw new RangeError(`${total} doesn't share exactly into ${partCount} parts`);
  return { onePart: q, shares: parts.map((p) => checkedMultiply(p, q)), partCount };
}

/**
 * Scales an amount for a recipe from `from` servings to `to` servings: 300 ml for 4 → 450 ml for 6. Throws a RangeError
 * unless the result is a whole number.
 */
export function scaleAmount(amount: number, from: number, to: number): number {
  assertSafeInteger(amount, "amount");
  assertSafeInteger(from, "from");
  assertSafeInteger(to, "to");
  if (from < 1 || to < 0) throw new RangeError("Servings must be positive");
  const { q, r } = divmod(checkedMultiply(amount, to), from);
  if (r !== 0) throw new RangeError(`${amount} for ${from} doesn't scale to a whole amount for ${to}`);
  return q;
}
