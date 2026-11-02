import { describe, expect, it } from "vitest";
import {
  compare,
  compareSymbol,
  equivalent,
  equivalentsUpTo,
  frac,
  fractionOfAmount,
  gcd,
  isEqualPartition,
  missingDenominator,
  missingNumerator,
  parseFraction,
  simplify,
  toWords,
} from "./math";

describe("fraction maths", () => {
  it("computes greatest common divisors", () => {
    expect(gcd(12, 8)).toBe(4);
    expect(gcd(7, 3)).toBe(1);
    expect(gcd(0, 5)).toBe(5);
  });

  it("simplifies fractions", () => {
    expect(simplify(frac(4, 8))).toEqual(frac(1, 2));
    expect(simplify(frac(6, 9))).toEqual(frac(2, 3));
    expect(simplify(frac(5, 7))).toEqual(frac(5, 7));
    expect(simplify(frac(0, 4))).toEqual(frac(0, 1));
  });

  it("detects equivalence exactly", () => {
    expect(equivalent(frac(1, 2), frac(4, 8))).toBe(true);
    expect(equivalent(frac(2, 3), frac(8, 12))).toBe(true);
    expect(equivalent(frac(1, 2), frac(2, 3))).toBe(false);
    expect(equivalent(frac(1, 3), frac(33, 100))).toBe(false);
  });

  it("compares fractions, including unit fractions", () => {
    expect(compare(frac(1, 3), frac(1, 5))).toBe(1);
    expect(compare(frac(1, 8), frac(1, 2))).toBe(-1);
    expect(compareSymbol(frac(2, 4), frac(1, 2))).toBe("=");
    expect(compareSymbol(frac(3, 4), frac(3, 5))).toBe(">");
    expect(compareSymbol(frac(5, 8), frac(3, 8))).toBe(">");
  });

  it("finds fractions of amounts only when whole", () => {
    expect(fractionOfAmount(frac(3, 4), 12)).toBe(9);
    expect(fractionOfAmount(frac(2, 5), 15)).toBe(6);
    expect(fractionOfAmount(frac(1, 2), 7)).toBeNull();
  });

  it("finds missing numerators and denominators", () => {
    expect(missingNumerator(frac(3, 4), 8)).toBe(6);
    expect(missingNumerator(frac(2, 3), 12)).toBe(8);
    expect(missingNumerator(frac(1, 3), 4)).toBeNull();
    expect(missingDenominator(frac(2, 5), 4)).toBe(10);
    expect(missingDenominator(frac(6, 8), 3)).toBe(4);
  });

  it("lists equivalents from the simplest form", () => {
    expect(equivalentsUpTo(frac(2, 4), 8)).toEqual([frac(1, 2), frac(2, 4), frac(3, 6), frac(4, 8)]);
  });

  it("parses and names fractions in UK English", () => {
    expect(parseFraction(" 3 / 4 ")).toEqual(frac(3, 4));
    expect(parseFraction("3/0")).toBeNull();
    expect(parseFraction("abc")).toBeNull();
    expect(toWords(frac(3, 4))).toBe("three quarters");
    expect(toWords(frac(1, 2))).toBe("one half");
    expect(toWords(frac(5, 8))).toBe("five eighths");
  });

  it("recognises equal partitions", () => {
    expect(isEqualPartition([1, 1, 1])).toBe(true);
    expect(isEqualPartition([1, 2, 1])).toBe(false);
    expect(isEqualPartition([])).toBe(false);
  });
});
