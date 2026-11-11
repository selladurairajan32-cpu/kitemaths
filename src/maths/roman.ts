/**
 * Roman numerals (Y4.NPV.9 to 100, Y5.NPV.6 to 1,000; D-037). Standard subtractive form only: IV, IX, XL, XC, CD, CM.
 * Whole numbers from 1 to 3,999; anything else throws a RangeError.
 */

const TABLE: [number, string][] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

export const ROMAN_MAX = 3999;

/** 1 to 3,999 as a Roman numeral, biggest symbols first. */
export function toRoman(n: number): string {
  if (!Number.isInteger(n) || n < 1 || n > ROMAN_MAX) throw new RangeError(`toRoman: ${n} is not a whole number from 1 to ${ROMAN_MAX}`);
  let left = n;
  let out = "";
  for (const [value, symbol] of TABLE) {
    while (left >= value) {
      out += symbol;
      left -= value;
    }
  }
  return out;
}

/** A Roman numeral in standard form back to a number, or null if it isn't one (such as IIII, IC or VX). */
export function fromRoman(text: string): number | null {
  if (!/^[MDCLXVI]+$/.test(text)) return null;
  let rest = text;
  let total = 0;
  for (const [value, symbol] of TABLE) {
    while (rest.startsWith(symbol)) {
      total += value;
      rest = rest.slice(symbol.length);
    }
  }
  // Only the standard spelling is accepted: it must read back exactly the same.
  return rest === "" && total >= 1 && total <= ROMAN_MAX && toRoman(total) === text ? total : null;
}

/** The parts a numeral is built from, biggest first, for a worked example: 1984 → ["M", "CM", "LXXX", "IV"]. */
export function romanParts(n: number): { value: number; numeral: string }[] {
  const parts: { value: number; numeral: string }[] = [];
  const digits = String(n).split("").map(Number);
  digits.forEach((d, i) => {
    const place = 10 ** (digits.length - 1 - i);
    if (d > 0) parts.push({ value: d * place, numeral: toRoman(d * place) });
  });
  if (toRoman(n) !== parts.map((p) => p.numeral).join("")) throw new Error("romanParts: parts do not rebuild the numeral");
  return parts;
}
