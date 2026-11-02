import type { Evaluation } from "@/engine/types";
import {
  diagnoseCompare,
  diagnoseFractionOf,
  diagnoseMissingNumber,
  diagnoseNamedFraction,
  diagnoseShade,
  isCorrectFraction,
} from "./diagnose";
import {
  compare,
  compareSymbol,
  equivalent,
  format,
  isEqualPartition,
  missingDenominator,
  missingNumerator,
  sameFraction,
  simplify,
  type Fraction,
} from "./math";
import { M } from "./misconceptions";
import type { Diagram, FractionQuestion, NumericTrap, Response } from "./types";
import { diagramParts, diagramSizes } from "./types";

function unique(ids: (string | undefined)[]): string[] {
  return [...new Set(ids.filter((x): x is string => !!x))];
}

/** Parts the question asks about (shaded or unshaded, or the marked point). */
export function countedParts(diagram: Diagram, ask: "shaded" | "unshaded" = "shaded") {
  const total = diagramParts(diagram);
  if (diagram.shape === "line") return { total, counted: diagram.point ?? 0 };
  const shaded = diagram.shaded?.length ?? 0;
  return { total, counted: ask === "shaded" ? shaded : total - shaded };
}

function trapFor(traps: NumericTrap[] | undefined, value: number) {
  return traps?.find((t) => t.value === value);
}

export function equivalenceNote(given: Fraction, direct: Fraction): string | undefined {
  if (sameFraction(given, direct)) return undefined;
  const [big, small] = given.d > direct.d ? [given, direct] : [direct, given];
  const k = big.d / small.d;
  const how = Number.isInteger(k)
    ? `multiplying the top and bottom of {${format(small)}} by ${k} gives {${format(big)}}`
    : `both simplify to {${format(simplify(given))}}`;
  return `The picture shows {${format(direct)}}. Your answer {${format(given)}} is equivalent — the same amount: ${how}. So it is correct too.`;
}

export function numericAnswer(q: FractionQuestion): number | null {
  switch (q.kind) {
    case "fraction-of":
      return (q.amount * q.fraction.n) / q.fraction.d;
    case "missing-number":
      return q.right.d !== undefined && q.right.n === undefined
        ? missingNumerator(q.left, q.right.d)
        : missingDenominator(q.left, q.right.n ?? 0);
    case "number":
      return q.answer;
    default:
      return null;
  }
}

export function evaluate(q: FractionQuestion, r: Response): Evaluation {
  if (q.kind !== r.kind) throw new Error(`Response kind ${r.kind} does not match ${q.kind}`);

  switch (q.kind) {
    case "choose-fraction": {
      const choice = (r as Extract<Response, { kind: "choose-fraction" }>).choice;
      if (sameFraction(choice, q.answer)) return { correct: true, misconceptions: [] };
      const tagged = q.options.find((o) => sameFraction(o, choice))?.misconception;
      return {
        correct: false,
        misconceptions: unique([
          tagged,
          ...diagnoseNamedFraction(choice, countedParts(q.diagram, q.ask)),
        ]),
      };
    }
    case "write-fraction": {
      const value = (r as Extract<Response, { kind: "write-fraction" }>).value;
      if (value.d === 0) {
        return {
          correct: false,
          misconceptions: [],
          feedback: "The denominator can never be 0 — a whole must be split into at least 1 part.",
        };
      }
      if (isCorrectFraction(value, q.answer, true)) {
        return { correct: true, misconceptions: [], feedback: equivalenceNote(value, q.answer) };
      }
      return {
        correct: false,
        misconceptions: diagnoseNamedFraction(value, countedParts(q.diagram, q.ask)),
      };
    }
    case "choose": {
      const choice = (r as Extract<Response, { kind: "choose" }>).choice;
      if (choice === q.answer) return { correct: true, misconceptions: [] };
      const opt = q.options.find((o) => o.id === choice);
      return { correct: false, misconceptions: unique([opt?.misconception]) };
    }
    case "shade": {
      const shaded = (r as Extract<Response, { kind: "shade" }>).shaded;
      const parts = diagramParts(q.diagram);
      const count = new Set(shaded).size;
      if (count * q.target.d === q.target.n * parts) {
        return { correct: true, misconceptions: [] };
      }
      return { correct: false, misconceptions: diagnoseShade(q.target, parts, count) };
    }
    case "equal-parts": {
      const selected = new Set((r as Extract<Response, { kind: "equal-parts" }>).selected);
      const answer = new Set(q.answer);
      const correct =
        selected.size === answer.size && [...answer].every((id) => selected.has(id));
      if (correct) return { correct, misconceptions: [] };
      const pickedUnequal = q.items.some(
        (it) => selected.has(it.id) && !isEqualPartition(diagramSizes(it.diagram)),
      );
      return { correct: false, misconceptions: pickedUnequal ? [M.UNEQUAL] : [] };
    }
    case "match": {
      const pairs = (r as Extract<Response, { kind: "match" }>).pairs;
      const wrongRows = q.rows.filter((row) => {
        const given = pairs[row.id];
        return !given || !sameFraction(given, row.answer);
      });
      if (!wrongRows.length) return { correct: true, misconceptions: [] };
      return {
        correct: false,
        misconceptions: unique(
          wrongRows.flatMap((row) => {
            const given = pairs[row.id];
            return given ? diagnoseNamedFraction(given, countedParts(row.diagram)) : [];
          }),
        ),
      };
    }
    case "compare": {
      const symbol = (r as Extract<Response, { kind: "compare" }>).symbol;
      return {
        correct: symbol === compareSymbol(q.left, q.right),
        misconceptions: diagnoseCompare(q.left, q.right, symbol),
      };
    }
    case "number-line-place": {
      const index = (r as Extract<Response, { kind: "number-line-place" }>).index;
      return {
        correct: equivalent({ n: index, d: q.intervals }, q.target),
        misconceptions: [],
      };
    }
    case "fraction-of": {
      const value = (r as Extract<Response, { kind: "fraction-of" }>).value;
      if (value === numericAnswer(q)) return { correct: true, misconceptions: [] };
      const trap = trapFor(q.traps, value);
      if (trap) {
        return {
          correct: false,
          misconceptions: unique([trap.misconception]),
          feedback: trap.feedback,
        };
      }
      return { correct: false, misconceptions: diagnoseFractionOf(q.fraction, q.amount, value) };
    }
    case "missing-number": {
      const value = (r as Extract<Response, { kind: "missing-number" }>).value;
      if (value === numericAnswer(q)) return { correct: true, misconceptions: [] };
      return { correct: false, misconceptions: diagnoseMissingNumber(q.left, q.right, value) };
    }
    case "number": {
      const value = (r as Extract<Response, { kind: "number" }>).value;
      if (value === q.answer) return { correct: true, misconceptions: [] };
      const trap = trapFor(q.traps, value);
      return {
        correct: false,
        misconceptions: unique([trap?.misconception]),
        feedback: trap?.feedback,
      };
    }
    case "explain-frame": {
      const slots = (r as Extract<Response, { kind: "explain-frame" }>).slots;
      const slotParts = q.frame.filter((p): p is Exclude<typeof p, string> => typeof p !== "string");
      const wrong = slotParts.filter((p) => slots[p.slot] !== p.answer);
      if (!wrong.length) return { correct: true, misconceptions: [] };
      return {
        correct: false,
        misconceptions: unique(wrong.map((p) => p.options.find((o) => o.id === slots[p.slot])?.misconception)),
      };
    }
    case "counterexample": {
      const { a, b } = r as Extract<Response, { kind: "counterexample" }>;
      return evaluateCounterexample(q.claim, a, b);
    }
  }
}

export function evaluateCounterexample(
  claim: Extract<FractionQuestion, { kind: "counterexample" }>["claim"],
  a: Fraction,
  b: Fraction,
): Evaluation {
  const c = compare(b, a);
  if (claim === "bigger-denominator-is-smaller") {
    if (b.d <= a.d) {
      return { correct: false, misconceptions: [], feedback: "The second fraction needs the bigger denominator, so the claim applies to it." };
    }
    if (c >= 0) return { correct: true, misconceptions: [] };
    return {
      correct: false,
      misconceptions: [],
      feedback: `Here ${format(b)} really is smaller than ${format(a)}, so this pair agrees with the claim. Try giving the second fraction a bigger numerator.`,
    };
  }
  if (b.n <= a.n) {
    return { correct: false, misconceptions: [], feedback: "The second fraction needs the bigger numerator, so the claim applies to it." };
  }
  if (c <= 0) return { correct: true, misconceptions: [] };
  return {
    correct: false,
    misconceptions: [],
    feedback: `Here ${format(b)} really is bigger than ${format(a)}, so this pair agrees with the claim. Try giving the second fraction a much bigger denominator.`,
  };
}

export function inputProblem(q: FractionQuestion, r: Response | null): string | null {
  if (!r) return null;
  if (r.kind === "write-fraction" && r.value.d === 0) {
    return "The bottom number can't be 0 — a whole must be split into at least 1 equal part.";
  }
  if (r.kind === "counterexample" && q.kind === "counterexample") {
    for (const f of [r.a, r.b]) {
      if (f.d < 1 || f.n < 1 || f.n > f.d) return "Each fraction needs a top number from 1 up to its bottom number.";
    }
  }
  return null;
}

/** Human-readable correct answer, with {n/d} fraction markup. */
export function answerText(q: FractionQuestion): string {
  switch (q.kind) {
    case "choose-fraction":
    case "write-fraction":
      return `{${format(q.answer)}}`;
    case "choose":
      return q.options.find((o) => o.id === q.answer)?.label ?? "";
    case "shade": {
      const parts = diagramParts(q.diagram);
      const need = (q.target.n * parts) / q.target.d;
      return `Shade ${need} of the ${parts} parts`;
    }
    case "equal-parts":
      return `${q.answer.length} shape${q.answer.length === 1 ? "" : "s"} with equal parts`;
    case "match":
      return q.rows.map((row, i) => `${String.fromCharCode(65 + i)} → {${format(row.answer)}}`).join(", ");
    case "compare":
      return `{${format(q.left)}} ${compareSymbol(q.left, q.right)} {${format(q.right)}}`;
    case "number-line-place": {
      const idx = (q.target.n * q.intervals) / q.target.d;
      const simplest = simplify(q.target);
      return `The mark ${idx} jump${idx === 1 ? "" : "s"} from 0 ({${format(simplest)}})`;
    }
    case "fraction-of":
    case "number":
      return withUnit(numericAnswer(q) ?? 0, q.unit);
    case "missing-number":
      return String(numericAnswer(q));
    case "explain-frame":
      return fillFrame(q.frame, (p) => p.answer);
    case "counterexample":
      return q.claim === "bigger-denominator-is-smaller"
        ? "Any pair where the second fraction has the bigger denominator but is not smaller — for example {1/3} and {3/4}"
        : "Any pair where the second fraction has the bigger numerator but is not bigger — for example {1/2} and {2/8}";
  }
}

export function fillFrame(
  frame: Extract<FractionQuestion, { kind: "explain-frame" }>["frame"],
  pick: (slot: Exclude<(typeof frame)[number], string>) => string | undefined,
): string {
  return frame
    .map((p) => {
      if (typeof p === "string") return p;
      const id = pick(p);
      return `**${p.options.find((o) => o.id === id)?.label ?? "…"}**`;
    })
    .join("");
}

export function withUnit(value: number, unit?: string): string {
  if (!unit) return String(value);
  return unit === "£" ? `£${value}` : `${value} ${unit}`;
}

/** Short description of what the child answered, for review screens. */
export function responseText(q: FractionQuestion, r: Response | undefined): string {
  if (!r) return "No answer";
  switch (r.kind) {
    case "choose-fraction":
      return `{${format(r.choice)}}`;
    case "write-fraction":
      return `{${format(r.value)}}`;
    case "choose":
      return q.kind === "choose" ? q.options.find((o) => o.id === r.choice)?.label ?? r.choice : r.choice;
    case "shade":
      return `Shaded ${new Set(r.shaded).size} part${new Set(r.shaded).size === 1 ? "" : "s"}`;
    case "equal-parts":
      return `Selected ${r.selected.length} shape${r.selected.length === 1 ? "" : "s"}`;
    case "match":
      return q.kind === "match"
        ? q.rows
            .map((row, i) => {
              const f = r.pairs[row.id];
              return `${String.fromCharCode(65 + i)} → ${f ? `{${format(f)}}` : "—"}`;
            })
            .join(", ")
        : "";
    case "compare":
      return q.kind === "compare"
        ? `{${format(q.left)}} ${r.symbol} {${format(q.right)}}`
        : r.symbol;
    case "number-line-place":
      return `Marked ${r.index} jump${r.index === 1 ? "" : "s"} from 0`;
    case "explain-frame":
      return q.kind === "explain-frame" ? fillFrame(q.frame, (p) => r.slots[p.slot]) : "";
    case "counterexample":
      return `{${format(r.a)}} and {${format(r.b)}}`;
    default:
      return withUnit(r.value, q.kind === "fraction-of" || q.kind === "number" ? q.unit : undefined);
  }
}

export function isResponseComplete(q: FractionQuestion, r: Response | null): boolean {
  if (!r) return false;
  switch (r.kind) {
    case "shade":
      return r.shaded.length > 0;
    case "equal-parts":
      return r.selected.length > 0;
    case "match":
      return q.kind === "match" && q.rows.every((row) => !!r.pairs[row.id]);
    case "write-fraction":
      return Number.isFinite(r.value.n) && Number.isFinite(r.value.d);
    case "fraction-of":
    case "missing-number":
    case "number":
      return Number.isFinite(r.value);
    case "explain-frame":
      return q.kind === "explain-frame" && q.frame.every((p) => typeof p === "string" || !!r.slots[p.slot]);
    default:
      return true;
  }
}
