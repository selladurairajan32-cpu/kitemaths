/**
 * The words for each step of each method, made from the long-multiplication model so the captions always match the
 * pictures. Kept free of React so they can be tested on their own.
 */
import type { LongMultiplication, ShortRow } from "@/maths/long-multiplication";

const n = (x: number) => x.toLocaleString("en-GB");
/** Keeps "23 × 4" on one line when a caption wraps. */
const keep = (s: string) => s.replace(/ × /g, "\u00a0×\u00a0");
const tensWord = (r: ShortRow) => (r.place === 1 ? `${r.digit} one${r.digit === 1 ? "" : "s"}` : `${r.digit} ${r.place === 10 ? "ten" : r.place === 100 ? "hundred" : `lot of ${n(r.place)}`}${r.digit === 1 ? "" : "s"}`);

/** Rows of the area model / hall, in the order they are drawn (biggest part of b first). */
export const drawnParts = (m: LongMultiplication) => m.bParts;

export function hallCaptions(m: LongMultiplication): string[] {
  return hallCaptionsRaw(m).map(keep);
}

function hallCaptionsRaw(m: LongMultiplication): string[] {
  const parts = m.bParts;
  return [
    `A school hall has **${m.b} rows** of **${m.a} chairs**. How many chairs is that? Counting them one by one would take ages!`,
    `Split the ${m.b} rows into ${parts.map((p) => `**${p} rows**`).join(" and ")}. Each part is easier to work out.`,
    ...parts.map((p) => `**${p} rows of ${m.a}** is ${m.a} × ${p} = **${n(m.a * p)}** chairs.`),
    `Put the parts together: ${parts.map((p) => n(m.a * p)).join(" + ")} = **${n(m.total)}** chairs. So ${m.a} × ${m.b} = ${n(m.total)}.`,
  ];
}

export function areaCaptions(m: LongMultiplication): string[] {
  return areaCaptionsRaw(m).map(keep);
}

function areaCaptionsRaw(m: LongMultiplication): string[] {
  const rowSums = m.bParts.map((bp) => m.cells.filter((c) => c.bPart === bp));
  return [
    `Think of ${m.a} × ${m.b} as a rectangle **${m.a} long** and **${m.b} high**. Its area is the answer.`,
    `Split ${m.a} into **${m.aParts.join(" + ")}** and ${m.b} into **${m.bParts.join(" + ")}**. Now we have smaller pieces.`,
    `Each piece is an easy multiplication: ${m.cells.map((c) => `${c.aPart} × ${c.bPart} = ${n(c.product)}`).join(", ")}.`,
    `Add along each row: ${rowSums.map((cells, i) => `${cells.map((c) => n(c.product)).join(" + ")} = **${n(m.a * m.bParts[i]!)}**`).join(", and ")}. Each row is ${m.a} times one part of ${m.b}.`,
    `Add the rows: ${m.bParts.map((p) => n(m.a * p)).join(" + ")} = **${n(m.total)}**. That's the whole area, so ${m.a} × ${m.b} = ${n(m.total)}.`,
  ];
}

/** What happens in one written row, column by column. */
export function rowWorking(m: LongMultiplication, r: ShortRow): string {
  const parts = r.columns
    .filter((c, i) => i < String(m.a).length)
    .map((c) => {
      const v = c.aDigit * r.digit + c.carryIn;
      const plus = c.carryIn ? `, plus the carried ${c.carryIn} makes ${v}` : "";
      const write = v >= 10 ? `: write ${v % 10}, carry ${Math.floor(v / 10)}` : "";
      return `${c.aDigit} × ${r.digit} = ${c.aDigit * r.digit}${plus}${write}`;
    });
  return parts.join(". ");
}

/** The column-method steps: set out, then for each row (a placeholder-zero step first when needed), then add. */
export interface ColumnStep {
  /** Index into m.rows of the row being written, or -1. */
  row: number;
  kind: "setup" | "zero" | "row" | "sum";
}

export function columnSteps(m: LongMultiplication): ColumnStep[] {
  const steps: ColumnStep[] = [{ row: -1, kind: "setup" }];
  m.rows.forEach((r, i) => {
    if (r.zeros > 0) steps.push({ row: i, kind: "zero" });
    steps.push({ row: i, kind: "row" });
  });
  if (m.rows.length > 1) steps.push({ row: -1, kind: "sum" });
  return steps;
}

export function columnCaptions(m: LongMultiplication): string[] {
  return columnCaptionsRaw(m).map(keep);
}

function columnCaptionsRaw(m: LongMultiplication): string[] {
  return columnSteps(m).map((s) => {
    if (s.kind === "setup") return `Write **${m.a}** on top and **× ${m.b}** underneath, ones under ones. We multiply by each digit of ${m.b} in turn.`;
    const r = m.rows[s.row]!;
    if (s.kind === "zero")
      return `Now multiply by the **${tensWord(r)}**. A ${r.place === 10 ? "ten" : "place"} makes every digit worth ${n(r.place)} times more, so first write **${"0".repeat(r.zeros)}** in the ${r.zeros === 1 ? "ones column" : "empty columns"}.`;
    if (s.kind === "row") {
      const lead = r.zeros === 0 ? `Multiply by the **${tensWord(r)}**, starting with the ones. ` : "";
      return `${lead}${rowWorking(m, r)}. This row is **${n(r.product)}**, the same as ${m.a} × ${n(r.multiplier)}.`;
    }
    return `Add the rows: ${m.rows.map((x) => n(x.product)).join(" + ")} = **${n(m.total)}**. So ${m.a} × ${m.b} = ${n(m.total)}.`;
  });
}

/** The try-it parts for a × b: each written row, then the total. */
export function tryItBlanks(m: LongMultiplication) {
  const rows = m.rows.map((r) => ({
    prompt: `**${m.a} × ${n(r.multiplier)}** =`,
    answer: r.product,
    hint: r.zeros > 0 ? `${m.a} × ${r.digit} = ${n(m.a * r.digit)}. Multiplying by ${n(r.multiplier)} makes it ${n(r.place)} times bigger.` : `Multiply the ones first, then the tens. Carry if a column makes 10 or more.`,
    traps: r.zeros > 0 ? [{ value: m.a * r.digit, feedback: `The ${r.digit} in ${m.b} is worth **${n(r.multiplier)}**, so the answer is ${n(r.place)} times bigger. Did you forget the 0?` }] : [],
  }));
  const sumTrap = m.rows.reduce((s, r) => s + m.a * r.digit, 0);
  return [
    ...rows,
    {
      prompt: `**${m.rows.map((r) => n(r.product)).join(" + ")}** =`,
      answer: m.total,
      hint: "Add the ones, then the tens, then the hundreds. Carry if a column makes 10 or more.",
      traps: sumTrap !== m.total ? [{ value: sumTrap, feedback: `Use the rows you worked out, with their zeros: ${m.rows.map((r) => n(r.product)).join(" + ")}.` }] : [],
    },
  ];
}
