/**
 * ARCH-002: the one numeric comparison contract. Spec: docs/product/architecture/ARCH-002-question-schema.md §3.
 *
 * Every place that asks "would this typed value be marked as the answer?" uses numericMatches: the validator's check
 * that a trap is not secretly correct, its check that two traps don't overlap, and any marking built on the schema.
 *
 *  - exact:      value === answer.
 *  - round:      **supported only where scaling is exact**: |value × 10^places| ≤ MAX_SAFE_INTEGER (9007199254740991).
 *                Beyond that, scaling loses precision (MAX_SAFE_INTEGER and MAX_SAFE_INTEGER − 1 scale to the same double
 *                at one place) or overflows to Infinity (1e308 and 1.1e308), and rounding would silently equate distinct
 *                values. So `roundDomainError` reports such a value, `numericMatches` throws a RangeError for it, and the
 *                validator rejects the definition. Inside the domain, both numbers are scaled by 10^places and rounded
 *                **half away from zero**, then compared:
 *                round(−2.5) = −3, round(2.5) = 3, round(−0.25 at 1 place) = −0.3. The scaling uses the stored binary
 *                double, so a decimal tie that is not exactly representable follows the double (1.005 at 2 places
 *                scales to 100.49999999999999 and rounds to 100). Negative zero equals zero.
 *  - tolerance:  needs only finite numbers. |value − answer| ≤ absolute, **inclusive**, with no extra allowance. The subtraction is ordinary double
 *                arithmetic, so the boundary is exact where the values are exactly representable (for example
 *                |10 − 9.5| = 0.5 matches tolerance 0.5) and follows the doubles otherwise.
 */
import type { NumericComparison } from "./schema";

/** Round half away from zero, with -0 normalised to 0. */
export function roundHalfAwayFromZero(x: number): number {
  const r = Math.sign(x) * Math.round(Math.abs(x));
  return r === 0 ? 0 : r;
}

/**
 * Why `value` can't be compared by rounding to `places`, or null if it can. The supported domain: a finite number whose
 * scaled magnitude |value × 10^places| does not exceed MAX_SAFE_INTEGER, so the scaled value is exact enough to round.
 */
export function roundDomainError(places: number, value: number): string | null {
  if (!Number.isFinite(value)) return `${String(value)} is not a finite number`;
  if (Math.abs(value * 10 ** places) > Number.MAX_SAFE_INTEGER) {
    return `${value} is outside the supported range for rounding to ${places} place${places === 1 ? "" : "s"} (|value × 10^${places}| must not exceed ${Number.MAX_SAFE_INTEGER}), where scaling would lose precision or overflow`;
  }
  return null;
}

/**
 * Would `value` be marked as `answer` under this comparison? Throws RangeError, never a wrong boolean, if a `round`
 * comparison is asked about a number outside its supported domain (see roundDomainError).
 */
export function numericMatches(cmp: NumericComparison, answer: number, value: number): boolean {
  switch (cmp.kind) {
    case "exact":
      return value === answer;
    case "round": {
      const problem = roundDomainError(cmp.places, answer) ?? roundDomainError(cmp.places, value);
      if (problem) throw new RangeError(problem);
      const scale = 10 ** cmp.places;
      return roundHalfAwayFromZero(value * scale) === roundHalfAwayFromZero(answer * scale);
    }
    case "tolerance":
      return Math.abs(value - answer) <= cmp.absolute;
  }
}

/** Can `value` be typed with at most `maxDecimals` decimal places? Exact: the value must equal itself written that short. */
export function fitsDecimals(value: number, maxDecimals: number): boolean {
  return Number(value.toFixed(maxDecimals)) === value;
}
