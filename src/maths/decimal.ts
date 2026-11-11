/**
 * Exact decimals as scaled whole numbers (D-038): a decimal is `units` of 10^−places, so 0.35 is { units: 35, places: 2 }.
 * Arithmetic is done on safe integers, so 0.35 × 6 is exactly 2.1 and never 2.0999999999999996. Overflow throws a
 * RangeError (via the checked integer functions).
 */
import { assertSafeInteger, checkedMultiply, divmod } from "./integer";

export interface ScaledDecimal {
  units: number;
  places: number;
}

/** The decimal as a JavaScript number: the nearest double to the exact value, the same as writing it as a literal. */
export function toNumber(x: ScaledDecimal): number {
  return x.units / 10 ** x.places;
}

/** Removes trailing zero places: { units: 210, places: 2 } → { units: 21, places: 1 }. */
export function normalise(x: ScaledDecimal): ScaledDecimal {
  let { units, places } = x;
  while (places > 0 && units % 10 === 0) {
    units /= 10;
    places -= 1;
  }
  return { units, places };
}

/** A decimal times a whole number, exactly: 0.35 × 6 = 2.1. */
export function multiplyByWhole(x: ScaledDecimal, k: number): ScaledDecimal {
  assertSafeInteger(k, "k");
  return normalise({ units: checkedMultiply(assertSafeInteger(x.units, "units"), k), places: x.places });
}

/**
 * n ÷ d by written division, carrying on past the decimal point for at most `maxPlaces` places. `exact` says whether it
 * came out exactly; if not, the result is cut off (not rounded) after `maxPlaces` places. Needs whole n ≥ 0 and d ≥ 1.
 */
export function divideToPlaces(n: number, d: number, maxPlaces: number): ScaledDecimal & { exact: boolean } {
  assertSafeInteger(n, "n");
  assertSafeInteger(d, "d");
  if (n < 0 || d < 1) throw new RangeError("divideToPlaces needs n ≥ 0 and d ≥ 1");
  const first = divmod(n, d);
  let r = first.r;
  let units = first.q;
  let places = 0;
  while (r !== 0 && places < maxPlaces) {
    const step = divmod(checkedMultiply(r, 10), d);
    units = checkedMultiply(units, 10) + step.q;
    r = step.r;
    places += 1;
  }
  return { ...normalise({ units, places }), exact: r === 0 };
}

/** The decimal written out with a point and its exact places: { units: 175, places: 2 } → "1.75", { 7, 3 } → "0.007". */
export function decimalText(x: ScaledDecimal): string {
  const sign = x.units < 0 ? "−" : "";
  const digits = String(Math.abs(x.units)).padStart(x.places + 1, "0");
  if (x.places === 0) return sign + digits;
  return `${sign}${digits.slice(0, -x.places)}.${digits.slice(-x.places)}`;
}
