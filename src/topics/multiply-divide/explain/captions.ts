/**
 * What Kip says at each step of each chapter, made from the long-multiplication model so the words always match the
 * pictures. About 12 words at most per step (ANIM-001 §3). Free of React so it can be tested on its own.
 */
import { regroup, rowsAsBlocks, type LongMultiplication } from "@/maths/long-multiplication";

/** One step of a chapter: what Kip says, whether the child makes a move, and what Kip says after it (Stage's step). */
export interface StageStep {
  say: string;
  task?: boolean;
  doneSay?: string;
}

const n = (x: number) => x.toLocaleString("en-GB");
/** Keeps "23 × 4" on one line when a caption wraps. */
const keep = (s: string) => s.replace(/ × /g, " × ");
const steps = (list: StageStep[]) => list.map((s) => ({ ...s, say: keep(s.say) }));

/** The pilot's scenes draw a 2-digit first number times a number from 11 to 19 whose ones make a carry. */
export function fitsPilot(m: LongMultiplication): boolean {
  return m.a >= 10 && m.a <= 99 && m.b >= 11 && m.b <= 19 && (m.a % 10) * (m.b % 10) >= 10;
}

export function blocksSteps(m: LongMultiplication): StageStep[] {
  const tA = Math.floor(m.a / 10);
  const oA = m.a % 10;
  const rest = m.b - 10;
  const top = regroup(rowsAsBlocks(m.a, 10)).result;
  const raw = rowsAsBlocks(m.a, rest);
  const after = regroup(raw).result;
  return steps([
    { say: `One row is **${m.a}**: ${tA} tens and ${oA} ones.` },
    { say: `Now make **${m.b} rows** of ${m.a}.` },
    { say: `Split them: **10 rows** and **${rest} rows**.` },
    { say: `Ten tens make a hundred. Ten ones make a ten. **${n(top.hundreds * 100 + top.tens * 10)}**!` },
    { say: `Your turn! ${raw.ones} ones is too many. Swap 10 for a ten.`, task: true, doneSay: `Brilliant! ${after.tens} tens and ${after.ones} ones make **${n(m.a * rest)}**.` },
    { say: `All together: **${n(m.total)}**. So ${m.a} × ${m.b} = ${n(m.total)}.` },
  ]);
}

export function pictureSteps(m: LongMultiplication): StageStep[] {
  return steps([
    { say: `The blocks make a rectangle: **${m.a}** long, **${m.b}** high.` },
    { say: `Your turn! Drag the scissors to cut off **${m.bParts[0]} rows**.`, task: true, doneSay: `Great cut! Now ${m.a} splits into **${m.aParts.join(" + ")}** too.` },
    { say: `Four easy pieces: ${m.cells.map((c) => `**${n(c.product)}**`).join(", ")}.` },
    { say: `Add each row: ${m.bParts.map((p) => `**${n(m.a * p)}**`).join(" and ")}. Together **${n(m.total)}**.` },
  ]);
}

export function numbersSteps(m: LongMultiplication): StageStep[] {
  const ones = m.rows[0]!;
  const v = (m.a % 10) * ones.digit;
  return steps([
    { say: `The quick way: write **${m.a}** above **${m.b}**, ones under ones.` },
    { say: `${m.a % 10} × ${ones.digit} = ${v} ones. Ten ones make a ten: carry it!` },
    { say: `Your turn! Times 10 moves each digit left. Fill the gap.`, task: true, doneSay: `Yes! The 0 keeps the digits in place: **${n(m.a * 10)}**.` },
    { say: `Add the rows: ${m.rows.map((r) => n(r.product)).join(" + ")} = **${n(m.total)}**.` },
  ]);
}

/** Where "Show me again" goes: a chapter and step of the watch-it explanation. */
export interface ShowMe {
  chapter: "blocks" | "picture" | "numbers";
  step: number;
}

/** The try-it parts for a × b: each written row, then the total; each slip says what to replay. */
export function tryItBlanks(m: LongMultiplication) {
  const rows = m.rows.map((r) => ({
    prompt: `**${m.a} × ${n(r.multiplier)}** =`,
    answer: r.product,
    hint: r.zeros > 0 ? `Times ${n(r.multiplier)}: each digit moves ${r.zeros === 1 ? "one place" : `${r.zeros} places`} left.` : `Multiply the ones first. Ten ones make a ten: carry it.`,
    show: (r.zeros > 0 ? { chapter: "numbers", step: 2 } : { chapter: "numbers", step: 1 }) as ShowMe,
    traps: r.zeros > 0 ? [{ value: m.a * r.digit, feedback: `The ${r.digit} in ${m.b} is worth **${n(r.multiplier)}**. Did you forget the 0?` }] : [],
  }));
  const sumTrap = m.rows.reduce((s, r) => s + m.a * r.digit, 0);
  return [
    ...rows,
    {
      prompt: `**${m.rows.map((r) => n(r.product)).join(" + ")}** =`,
      answer: m.total,
      hint: "Add the ones, then the tens, then the hundreds. Carry when you make ten.",
      show: { chapter: "numbers", step: 3 } as ShowMe,
      traps: sumTrap !== m.total ? [{ value: sumTrap, feedback: `Use the rows with their zeros: ${m.rows.map((r) => n(r.product)).join(" + ")}.` }] : [],
    },
  ];
}
