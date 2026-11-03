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
  if (value !== null && value === q.answer) return { correct: true, misconceptions: [] };
  const trap = q.traps?.find((t) => t.value === value);
  if (trap) return { correct: false, misconceptions: trap.misconception ? [trap.misconception] : [], feedback: trap.feedback };
  return { correct: false, misconceptions: [] };
}

/** Numbers the way UK children read them: 12,345 and −5. */
export function num(n: number): string {
  const s = Math.abs(n).toLocaleString("en-GB");
  return n < 0 ? `−${s}` : s;
}

function withUnit(q: KitQuestion, value: string): string {
  if (q.kind !== "number" || !q.unit) return value;
  return q.unit === "£" ? `£${value}` : `${value} ${q.unit}`;
}

export function answerText(q: KitQuestion): string {
  if (q.kind === "choose") return q.options[q.answer].text;
  return `**${withUnit(q, num(q.answer))}**`;
}

export function responseText(q: KitQuestion, r: KitResponse | undefined): string {
  if (!r) return "No answer";
  if (q.kind === "choose") return r.kind === "choose" ? (q.options[r.choice]?.text ?? "No answer") : "No answer";
  return r.kind === "number" && r.value !== null ? withUnit(q, num(r.value)) : "No answer";
}
