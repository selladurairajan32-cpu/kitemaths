/**
 * Long multiplication, worked the way it is taught (ARCH-003 rules: safe integers only; checked arithmetic).
 *
 * One model drives every picture of the animated lesson, so the chairs, the area model and the column
 * method can never disagree with each other or with the maths.
 */
import { assertSafeInteger, checkedAdd, checkedMultiply } from "./integer";

/** A whole number split into its non-zero place parts, biggest first: 23 → [20, 3], 105 → [100, 5]. */
export function placeParts(n: number): number[] {
  assertSafeInteger(n, "n");
  if (n < 1) throw new RangeError(`placeParts needs a whole number of 1 or more, got ${n}`);
  const digits = String(n).split("").map(Number);
  return digits.map((d, i) => d * 10 ** (digits.length - 1 - i)).filter((p) => p > 0);
}

/** n × d for a single digit d, column by column from the ones: the digits written and the carry into each column. */
export interface ShortRow {
  /** The multiplier for this row: one digit of the second number times its place value (4, 10, 20…). */
  multiplier: number;
  /** The single digit used (4 for ×4, 1 for ×10). */
  digit: number;
  /** Place value of that digit: 1, 10, 100… */
  place: number;
  /** a × multiplier. */
  product: number;
  /**
   * Column-by-column working, ones first, for a × digit (before the placeholder zeros).
   * `carryIn` is the carry written above that column; `written` is the digit written under it.
   */
  columns: { aDigit: number; carryIn: number; written: number }[];
  /** Placeholder zeros written before the digits (0 for the ones row, 1 for the tens row…). */
  zeros: number;
}

export interface LongMultiplication {
  a: number;
  b: number;
  aParts: number[];
  bParts: number[];
  /** Area-model pieces: one per (bPart, aPart), row by row. */
  cells: { row: number; col: number; aPart: number; bPart: number; product: number }[];
  /** One written row per non-zero digit of b, ones row first (as in the column method). */
  rows: ShortRow[];
  /** Digits of the final column addition, ones first, with the carry into each column. */
  sum: { written: number; carryIn: number }[];
  total: number;
}

function shortRow(a: number, digit: number, place: number): ShortRow {
  const aDigits = String(a).split("").map(Number).reverse();
  const columns: ShortRow["columns"] = [];
  let carry = 0;
  for (const aDigit of aDigits) {
    const v = aDigit * digit + carry;
    columns.push({ aDigit, carryIn: carry, written: v % 10 });
    carry = Math.floor(v / 10);
  }
  // A final carry is written as its own digits in new columns, with nothing carried in.
  while (carry > 0) {
    columns.push({ aDigit: 0, carryIn: 0, written: carry % 10 });
    carry = Math.floor(carry / 10);
  }
  const multiplier = checkedMultiply(digit, place);
  return { multiplier, digit, place, product: checkedMultiply(a, multiplier), columns, zeros: String(place).length - 1 };
}

/** Column addition of whole numbers, ones first, with the carry into each column. */
export function columnSum(values: number[]): { written: number; carryIn: number }[] {
  values.forEach((v, i) => assertSafeInteger(v, `values[${i}]`));
  const digits = values.map((v) => String(v).split("").map(Number).reverse());
  const width = Math.max(...digits.map((d) => d.length));
  const out: { written: number; carryIn: number }[] = [];
  let carry = 0;
  for (let i = 0; i < width || carry > 0; i++) {
    const v = digits.reduce((s, d) => s + (d[i] ?? 0), 0) + carry;
    out.push({ written: v % 10, carryIn: carry });
    carry = Math.floor(v / 10);
  }
  return out;
}

/** The full working for a × b, where both are whole numbers from 1 upwards. */
export function longMultiplication(a: number, b: number): LongMultiplication {
  assertSafeInteger(a, "a");
  assertSafeInteger(b, "b");
  if (a < 1 || b < 1) throw new RangeError(`longMultiplication needs whole numbers of 1 or more, got ${a} × ${b}`);
  const total = checkedMultiply(a, b);
  const aParts = placeParts(a);
  const bParts = placeParts(b);
  const cells = bParts.flatMap((bPart, row) => aParts.map((aPart, col) => ({ row, col, aPart, bPart, product: checkedMultiply(aPart, bPart) })));
  const bDigits = String(b).split("").map(Number).reverse();
  const rows = bDigits.flatMap((digit, i) => (digit === 0 ? [] : [shortRow(a, digit, 10 ** i)]));
  const sum = columnSum(rows.map((r) => r.product));
  // Self-check: the rows must add up to the product (they always do; this guards future edits).
  if (rows.reduce((s, r) => checkedAdd(s, r.product), 0) !== total) throw new Error("long multiplication rows do not add up");
  return { a, b, aParts, bParts, cells, rows, sum, total };
}

/** Base-ten blocks: how many hundreds flats, tens rods and ones cubes. */
export interface PlaceCounts {
  hundreds: number;
  tens: number;
  ones: number;
}

/** The value the blocks show. */
export function blocksValue(c: PlaceCounts): number {
  return checkedAdd(checkedAdd(checkedMultiply(c.hundreds, 100), checkedMultiply(c.tens, 10)), c.ones);
}

/** `rows` copies of a (below 1,000) laid out as blocks, before any swapping: 23 × 4 rows → 8 tens and 12 ones. */
export function rowsAsBlocks(a: number, rows: number): PlaceCounts {
  assertSafeInteger(a, "a");
  assertSafeInteger(rows, "rows");
  if (a < 1 || a > 999 || rows < 0) throw new RangeError(`rowsAsBlocks needs 1 ≤ a ≤ 999 and rows ≥ 0, got ${a}, ${rows}`);
  return { hundreds: checkedMultiply(Math.floor(a / 100), rows), tens: checkedMultiply(Math.floor(a / 10) % 10, rows), ones: checkedMultiply(a % 10, rows) };
}

/**
 * Swap ten ones for a ten, then ten tens for a hundred, as many times as possible (what a carry is).
 * Returns how many swaps of each kind were made and the blocks left; the value never changes.
 */
export function regroup(c: PlaceCounts): { onesToTens: number; tensToHundreds: number; result: PlaceCounts } {
  for (const k of ["hundreds", "tens", "ones"] as const) {
    assertSafeInteger(c[k], k);
    if (c[k] < 0) throw new RangeError(`${k} must not be negative, got ${c[k]}`);
  }
  const onesToTens = Math.floor(c.ones / 10);
  const tens = checkedAdd(c.tens, onesToTens);
  const tensToHundreds = Math.floor(tens / 10);
  return { onesToTens, tensToHundreds, result: { hundreds: checkedAdd(c.hundreds, tensToHundreds), tens: tens % 10, ones: c.ones % 10 } };
}
