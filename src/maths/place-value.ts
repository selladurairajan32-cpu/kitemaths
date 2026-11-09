/**
 * Place value (ARCH-003). Moved unchanged from src/topics/kit/visuals.tsx, where maths truth sat in a picture
 * component (coupling K-7). Behaviour is identical; see docs/product/architecture/ARCH-003-maths.md §6.
 */

/** Place-value column names, biggest first: millions … ones, then tenths and hundredths. */
export type PlaceColumn = "M" | "HTh" | "TTh" | "Th" | "H" | "T" | "O" | "t" | "h";

/** The value of one unit in each column. */
export const PLACE: Record<PlaceColumn, number> = { M: 1e6, HTh: 1e5, TTh: 1e4, Th: 1e3, H: 100, T: 10, O: 1, t: 0.1, h: 0.01 };

/**
 * The digit of `value` in a column, or null for a leading blank (a column bigger than the number, except ones).
 * Works to two decimal places; the sign of `value` is ignored.
 */
export function digitIn(value: number, col: PlaceColumn): number | null {
  const place = PLACE[col];
  const scaled = Math.round(Math.abs(value) * 100);
  const p = Math.round(place * 100);
  if (p >= 100 && scaled < p && col !== "O") return null;
  return Math.floor(scaled / p) % 10;
}
