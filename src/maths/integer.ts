/**
 * Checked integer helpers (ARCH-003). Spec: docs/product/architecture/ARCH-003-maths.md §1 and §3.
 *
 * Domain: every argument must be a safe integer (Number.isSafeInteger). NaN, Infinity and non-integers
 * throw RangeError. Every product or sum these functions form is checked: if it would leave the safe
 * range they throw RangeError rather than return an imprecise result.
 */

/** Throws RangeError unless `value` is a safe integer. Returns it, typed, for chaining. */
export function assertSafeInteger(value: number, name: string): number {
  if (!Number.isSafeInteger(value)) throw new RangeError(`${name} must be a safe integer, got ${String(value)}`);
  return value;
}

/** a × b, or RangeError if the exact product is not a safe integer. */
export function checkedMultiply(a: number, b: number): number {
  assertSafeInteger(a, "a");
  assertSafeInteger(b, "b");
  const p = a * b;
  if (!Number.isSafeInteger(p)) throw new RangeError(`${a} × ${b} overflows the safe integer range`);
  return p;
}

/** a + b, or RangeError if the exact sum is not a safe integer. */
export function checkedAdd(a: number, b: number): number {
  assertSafeInteger(a, "a");
  assertSafeInteger(b, "b");
  const s = a + b;
  if (!Number.isSafeInteger(s)) throw new RangeError(`${a} + ${b} overflows the safe integer range`);
  return s;
}

/** Greatest common divisor of two safe integers, always 0 or more; gcd(0, 0) = 0. */
export function gcdOf(a: number, b: number): number {
  assertSafeInteger(a, "a");
  assertSafeInteger(b, "b");
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

/** Least common multiple, always 0 or more; lcm(0, x) = 0. RangeError if it overflows. */
export function lcm(a: number, b: number): number {
  assertSafeInteger(a, "a");
  assertSafeInteger(b, "b");
  if (a === 0 || b === 0) return 0;
  return checkedMultiply(Math.abs(a) / gcdOf(a, b), Math.abs(b));
}

/** True if `d` divides `n` exactly. `d` must not be 0. */
export function isFactor(d: number, n: number): boolean {
  assertSafeInteger(d, "d");
  assertSafeInteger(n, "n");
  if (d === 0) throw new RangeError("0 is not a factor of anything (division by zero)");
  return n % d === 0;
}

/** The positive factors of a positive integer, smallest first. n must be at least 1. */
export function factors(n: number): number[] {
  assertSafeInteger(n, "n");
  if (n < 1) throw new RangeError(`factors needs a positive integer, got ${n}`);
  const small: number[] = [];
  const large: number[] = [];
  for (let d = 1; d * d <= n; d++) {
    if (n % d === 0) {
      small.push(d);
      if (d !== n / d) large.unshift(n / d);
    }
  }
  return [...small, ...large];
}

/**
 * Euclidean division: a = q·b + r with 0 ≤ r < |b|, so the remainder is never negative.
 * divmod(-7, 2) = { q: -4, r: 1 }; divmod(7, -2) = { q: -3, r: 1 }. RangeError if b is 0.
 */
export function divmod(a: number, b: number): { q: number; r: number } {
  assertSafeInteger(a, "a");
  assertSafeInteger(b, "b");
  if (b === 0) throw new RangeError("division by zero");
  const m = Math.abs(b);
  const r = ((a % m) + m) % m;
  return { q: (a - r) / b, r };
}
