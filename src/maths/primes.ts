/**
 * Primes, prime factors, square and cube numbers (Y5.MD.2, Y5.MD.3, Y5.MD.6; D-037). Safe whole numbers only.
 */
import { assertSafeInteger } from "./integer";

/** True for 2, 3, 5, 7, 11 …: exactly two factors. 0 and 1 are not prime. */
export function isPrime(n: number): boolean {
  assertSafeInteger(n, "n");
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let d = 3; d * d <= n; d += 2) if (n % d === 0) return false;
  return true;
}

/** The primes from 2 up to and including `max`. */
export function primesUpTo(max: number): number[] {
  const out: number[] = [];
  for (let n = 2; n <= max; n++) if (isPrime(n)) out.push(n);
  return out;
}

/** Prime factors in order, with repeats: 60 → [2, 2, 3, 5]. Needs n ≥ 2. */
export function primeFactors(n: number): number[] {
  assertSafeInteger(n, "n");
  if (n < 2) throw new RangeError(`primeFactors: ${n} has no prime factors`);
  const out: number[] = [];
  let left = n;
  for (let d = 2; d * d <= left; d++) {
    while (left % d === 0) {
      out.push(d);
      left /= d;
    }
  }
  if (left > 1) out.push(left);
  return out;
}

/** True when n = k × k for a whole number k. */
export function isSquare(n: number): boolean {
  assertSafeInteger(n, "n");
  if (n < 0) return false;
  const k = Math.round(Math.sqrt(n));
  return k * k === n;
}

/** True when n = k × k × k for a whole number k ≥ 0. */
export function isCube(n: number): boolean {
  assertSafeInteger(n, "n");
  if (n < 0) return false;
  const k = Math.round(Math.cbrt(n));
  return k * k * k === n;
}
