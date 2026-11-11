import { describe, expect, it } from "vitest";
import { isCube, isPrime, isSquare, primeFactors, primesUpTo } from "./primes";
import { fromRoman, romanParts, toRoman } from "./roman";

/** D-037 maths for the new KS2 topics. Oracles: hand-worked tables, never the function under test. */

describe("Roman numerals (Y4.NPV.9, Y5.NPV.6)", () => {
  it("writes numbers as standard Roman numerals (hand-worked)", () => {
    const table: [number, string][] = [
      [1, "I"], [4, "IV"], [9, "IX"], [14, "XIV"], [19, "XIX"], [40, "XL"], [49, "XLIX"], [90, "XC"], [99, "XCIX"], [100, "C"],
      [400, "CD"], [444, "CDXLIV"], [500, "D"], [900, "CM"], [1000, "M"], [1066, "MLXVI"], [1984, "MCMLXXXIV"], [2026, "MMXXVI"], [3999, "MMMCMXCIX"],
    ];
    for (const [n, r] of table) {
      expect(toRoman(n), String(n)).toBe(r);
      expect(fromRoman(r), r).toBe(n);
    }
  });

  it("refuses numbers it can't write and spellings that aren't standard", () => {
    for (const n of [0, -1, 4000, 2.5, Number.NaN]) expect(() => toRoman(n), String(n)).toThrow(RangeError);
    for (const s of ["IIII", "IC", "VX", "IL", "XM", "MMMM", "", "ABC", "iv", "VV", "LL", "DD"]) expect(fromRoman(s), s).toBeNull();
  });

  it("splits a numeral into its place parts (hand-worked)", () => {
    expect(romanParts(1984)).toEqual([{ value: 1000, numeral: "M" }, { value: 900, numeral: "CM" }, { value: 80, numeral: "LXXX" }, { value: 4, numeral: "IV" }]);
    expect(romanParts(207)).toEqual([{ value: 200, numeral: "CC" }, { value: 7, numeral: "VII" }]);
  });
});

describe("primes, squares and cubes (Y5.MD.2, Y5.MD.3, Y5.MD.6)", () => {
  it("knows the primes to 100 (hand-worked list)", () => {
    expect(primesUpTo(100)).toEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97]);
    for (const n of [0, 1, 4, 9, 51, 57, 91, 1001]) expect(isPrime(n), String(n)).toBe(false);
    expect(isPrime(7919)).toBe(true);
  });

  it("breaks numbers into prime factors (hand-worked)", () => {
    expect(primeFactors(60)).toEqual([2, 2, 3, 5]);
    expect(primeFactors(97)).toEqual([97]);
    expect(primeFactors(1024)).toEqual([2, 2, 2, 2, 2, 2, 2, 2, 2, 2]);
    expect(primeFactors(990)).toEqual([2, 3, 3, 5, 11]);
    expect(() => primeFactors(1)).toThrow(RangeError);
  });

  it("finds square and cube numbers (hand-worked)", () => {
    const squares = [0, 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144];
    const cubes = [0, 1, 8, 27, 64, 125, 216, 343, 512, 729, 1000];
    for (let n = 0; n <= 1000; n++) {
      if (n <= 144) expect(isSquare(n), String(n)).toBe(squares.includes(n));
      expect(isCube(n), String(n)).toBe(cubes.includes(n));
    }
    expect(isSquare(-4)).toBe(false);
  });
});
