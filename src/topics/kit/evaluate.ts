import type { Evaluation } from "@/engine/types";
import type { KitQuestion, KitResponse } from "./types";

/** Marking for the kit's two answer kinds. */

export function isComplete(q: KitQuestion, r: KitResponse | null): boolean {
  if (!r) return false;
  if (q.kind === "choose") return r.kind === "choose" && r.choice >= 0;
  return r.kind === "number" && r.value !== null && Number.isFinite(r.value);
}

export function inputProblem(q: KitQuestion, r: KitResponse | null): string | null {
  if (!r || q.kind !== "number" || r.kind !== "number") return null;
  if (r.value === null) return "Type a number first.";
  return null;
}

export function evaluate(q: KitQuestion, r: KitResponse): Evaluation {
  if (q.kind === "choose") {
    const choice = r.kind === "choose" ? r.choice : -1;
    if (choice === q.answer) return { correct: true, misconceptions: [] };
    const o = q.options[choice];
    return { correct: false, misconceptions: o?.misconception ? [o.misconception] : [], feedback: o?.feedback };
  }
  const value = r.kind === "number" ? r.value : null;
  if (value !== null && same(value, q.answer)) return { correct: true, misconceptions: [] };
  const trap = q.traps?.find((t) => value !== null && same(t.value, value));
  if (trap) return { correct: false, misconceptions: trap.misconception ? [trap.misconception] : [], feedback: trap.feedback };
  return { correct: false, misconceptions: [] };
}

/** Two numbers are the same answer (decimals compared to the thousandth, so 0.1 + 0.2 = 0.3). */
export function same(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-9 || Math.round(a * 1000) === Math.round(b * 1000);
}

/** Numbers the way UK children read them: 12,345, 0.75 and −5. */
export function num(n: number): string {
  const s = Math.abs(n).toLocaleString("en-GB", { maximumFractionDigits: 3 });
  return n < 0 ? `−${s}` : s;
}

/** Money shows pence in full: £11.10, not £11.1. */
export function money(n: number): string {
  return `£${n.toLocaleString("en-GB", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;
}

function withUnit(q: KitQuestion, value: number): string {
  if (q.kind !== "number" || !q.unit) return num(value);
  if (q.unit === "£") return money(value);
  // Short units sit right next to the number: 45p, 30%. Others take a space: 12 cm.
  return q.unit === "%" || q.unit === "p" ? `${num(value)}${q.unit}` : `${num(value)} ${q.unit}`;
}

export function answerText(q: KitQuestion): string {
  if (q.kind === "choose") return q.options[q.answer].text;
  return `**${withUnit(q, q.answer)}**`;
}

export function responseText(q: KitQuestion, r: KitResponse | undefined): string {
  if (!r) return "No answer";
  if (q.kind === "choose") return r.kind === "choose" ? (q.options[r.choice]?.text ?? "No answer") : "No answer";
  return r.kind === "number" && r.value !== null ? withUnit(q, r.value) : "No answer";
}
