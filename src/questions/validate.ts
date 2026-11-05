/**
 * ARCH-002: runtime validation of question definitions. Spec: docs/product/architecture/ARCH-002-question-schema.md.
 *
 * validateQuestion(x) accepts unknown input (for example parsed JSON) and returns either the typed definition or
 * every problem found, each with a path ("options[2].id") and a message. It checks structure, identifiers and
 * references, option uniqueness, fields that don't belong to the interaction, and the maths (using src/maths), so
 * a definition whose answer is wrong for its own numbers or picture is rejected. Pure: no UI, no I/O.
 */
import { checkedMultiply } from "@/maths/integer";
import { COUNTEREXAMPLE_PREDICATES, INTERACTIONS, type Interaction, type QuestionDefinition } from "./schema";

export interface ValidationError {
  path: string;
  message: string;
}
export type ValidationResult = { ok: true; value: QuestionDefinition } | { ok: false; errors: ValidationError[] };

const COMMON_KEYS = ["id", "skill", "level", "difficulty", "prompt", "explanation", "hints", "misconceptions", "scoring", "model", "interaction"];
const KEYS: Record<Interaction, string[]> = {
  "choose-one": ["options", "correctId", "fixedOrder"],
  "multi-select": ["options", "correctIds"],
  "number-entry": ["answer", "validation", "unit", "traps"],
  "fraction-entry": ["answer", "validation", "traps"],
  compare: ["left", "right", "answer"],
  shade: ["target", "validation"],
  "number-line-place": ["intervals", "target"],
  match: ["rows", "choices", "pairs"],
  "missing-number": ["left", "right", "answer"],
  "fraction-of": ["fraction", "amount", "answer", "unit", "traps"],
  "explain-frame": ["frame"],
  counterexample: ["predicate"],
};
const PARTIAL_CREDIT: Interaction[] = ["multi-select", "match", "explain-frame"];
/** Ids: letters, digits and . : _ - only, starting with a letter or digit (existing ids such as "g:place-value.pv-digit:2:5" fit). */
const ID = /^[A-Za-z0-9][A-Za-z0-9.:_-]*$/;

type Obj = Record<string, unknown>;
const isObj = (x: unknown): x is Obj => typeof x === "object" && x !== null && !Array.isArray(x);

class Checker {
  errors: ValidationError[] = [];
  fail(path: string, message: string) {
    this.errors.push({ path, message });
    return false;
  }
  text(o: Obj, key: string, path: string, { optional = false } = {}): boolean {
    const v = o[key];
    if (v === undefined && optional) return true;
    if (typeof v !== "string" || !v.trim()) return this.fail(path + key, "must be a non-empty string");
    return true;
  }
  id(v: unknown, path: string): boolean {
    if (typeof v !== "string" || !ID.test(v)) return this.fail(path, `must be an id (letters, digits, . : _ -), got ${JSON.stringify(v)}`);
    return true;
  }
  /** A local key inside one question (option, slot, row, choice): any non-empty text without outer spaces, e.g. "2/6". */
  key(v: unknown, path: string): boolean {
    if (typeof v !== "string" || !v || v !== v.trim() || v.length > 64) return this.fail(path, `must be a non-empty key of up to 64 characters with no outer spaces, got ${JSON.stringify(v)}`);
    return true;
  }
  int(v: unknown, path: string, min: number, max = Number.MAX_SAFE_INTEGER): v is number {
    if (!Number.isSafeInteger(v) || (v as number) < min || (v as number) > max) return this.fail(path, `must be a whole number from ${min} to ${max}, got ${JSON.stringify(v)}`);
    return true;
  }
  /** A non-negative fraction with a positive denominator. */
  fraction(v: unknown, path: string): v is { n: number; d: number } {
    if (!isObj(v)) return this.fail(path, "must be a fraction { n, d }");
    const okN = this.int(v.n, `${path}.n`, 0);
    const okD = this.int(v.d, `${path}.d`, 1);
    this.extra(v, ["n", "d"], path + ".");
    return okN && okD;
  }
  extra(o: Obj, allowed: string[], path: string) {
    for (const k of Object.keys(o)) if (!allowed.includes(k)) this.fail(path + k, "is not a field of this object (unknown or belongs to another interaction)");
  }
  options(v: unknown, path: string, { min = 2 } = {}): string[] {
    if (!Array.isArray(v) || v.length < min) {
      this.fail(path, `must be a list of at least ${min} options`);
      return [];
    }
    const ids: string[] = [];
    const texts = new Set<string>();
    v.forEach((o, i) => {
      const p = `${path}[${i}]`;
      if (!isObj(o)) return this.fail(p, "must be an option { id, text }");
      this.extra(o, ["id", "text", "misconception", "feedback", "model"], `${p}.`);
      if (this.key(o.id, `${p}.id`)) {
        if (ids.includes(o.id as string)) this.fail(`${p}.id`, `duplicate option id "${o.id}"`);
        ids.push(o.id as string);
      }
      if (this.text(o, "text", `${p}.`)) {
        if (texts.has(o.text as string)) this.fail(`${p}.text`, `duplicate option text "${o.text}"`);
        texts.add(o.text as string);
      }
      this.text(o, "misconception", `${p}.`, { optional: true });
      this.text(o, "feedback", `${p}.`, { optional: true });
      if (o.model !== undefined) this.model(o.model, `${p}.model`);
    });
    return ids;
  }
  model(v: unknown, path: string) {
    if (!isObj(v)) return this.fail(path, "must be a model");
    if (v.kind === "partition") {
      this.extra(v, ["kind", "shape", "parts", "sizes", "shaded"], path + ".");
      if (!["bar", "circle", "grid"].includes(v.shape as string)) this.fail(`${path}.shape`, "must be bar, circle or grid");
      if (!this.int(v.parts, `${path}.parts`, 1, 1000)) return false;
      const parts = v.parts as number;
      if (v.sizes !== undefined && (!Array.isArray(v.sizes) || v.sizes.length !== parts || !v.sizes.every((s) => typeof s === "number" && Number.isFinite(s) && s > 0)))
        this.fail(`${path}.sizes`, `must list ${parts} positive sizes`);
      if (v.shaded !== undefined) {
        if (!Array.isArray(v.shaded)) return this.fail(`${path}.shaded`, "must be a list of part indices");
        const seen = new Set<number>();
        v.shaded.forEach((i, k) => {
          if (!Number.isInteger(i) || i < 0 || i >= parts) this.fail(`${path}.shaded[${k}]`, `is not a part of a ${parts}-part model`);
          else if (seen.has(i)) this.fail(`${path}.shaded[${k}]`, `part ${i} is repeated`);
          seen.add(i);
        });
      }
    } else if (v.kind === "number-line") {
      this.extra(v, ["kind", "min", "max", "intervals", "point"], path + ".");
      if (v.min !== 0 || v.max !== 1) this.fail(path, "number lines run from 0 to 1");
      if (this.int(v.intervals, `${path}.intervals`, 1, 1000) && v.point !== undefined) this.int(v.point, `${path}.point`, 0, v.intervals as number);
    } else if (v.kind === "other") {
      this.extra(v, ["kind", "description"], path + ".");
      this.text(v, "description", path + ".");
    } else this.fail(`${path}.kind`, "must be partition, number-line or other");
    return true;
  }
}

/** Is a/b equal to c/d? Exact, and RangeError-safe: overflowing products are reported, not mis-compared. */
function equalFractions(c: Checker, a: { n: number; d: number }, b: { n: number; d: number }, path: string): boolean | null {
  try {
    return checkedMultiply(a.n, b.d) === checkedMultiply(b.n, a.d);
  } catch {
    c.fail(path, "numbers too large to check exactly");
    return null;
  }
}
function sign(c: Checker, a: { n: number; d: number }, b: { n: number; d: number }, path: string): "<" | "=" | ">" | null {
  try {
    const l = checkedMultiply(a.n, b.d);
    const r = checkedMultiply(b.n, a.d);
    return l < r ? "<" : l > r ? ">" : "=";
  } catch {
    c.fail(path, "numbers too large to check exactly");
    return null;
  }
}

/** True if the value is plain JSON data: no functions, undefined values, NaN or Infinity, symbols or class instances. */
function isJsonData(x: unknown): boolean {
  if (x === null || typeof x === "string" || typeof x === "boolean") return true;
  if (typeof x === "number") return Number.isFinite(x);
  if (Array.isArray(x)) return x.every(isJsonData);
  if (isObj(x)) return Object.getPrototypeOf(x) === Object.prototype && Object.values(x).every((v) => v !== undefined && isJsonData(v));
  return false;
}

export function validateQuestion(x: unknown): ValidationResult {
  const c = new Checker();
  if (!isObj(x)) return { ok: false, errors: [{ path: "", message: "a question definition must be an object" }] };
  if (!isJsonData(x)) c.fail("", "must be plain JSON data (no functions, undefined, NaN, Infinity or class instances)");

  // Common fields
  c.id(x.id, "id");
  c.text(x, "skill", "");
  if (x.level === "unverified") {
    // explicitly unknown: allowed
  } else if (isObj(x.level) && Array.isArray(x.level.years) && x.level.years.length > 0) {
    c.extra(x.level, ["years"], "level.");
    const years = x.level.years as unknown[];
    years.forEach((y, i) => c.int(y, `level.years[${i}]`, 1, 13));
    if (new Set(years).size !== years.length) c.fail("level.years", "has a repeated year");
  } else c.fail("level", 'must be { years: [...] } from verified metadata, or "unverified"');
  c.int(x.difficulty, "difficulty", 1, 3);
  c.text(x, "prompt", "");
  c.text(x, "explanation", "");
  if (!Array.isArray(x.hints)) c.fail("hints", "must be a list (the hint ladder; it may be empty)");
  else x.hints.forEach((h, i) => (typeof h !== "string" || !h.trim()) && c.fail(`hints[${i}]`, "must be a non-empty string"));
  if (!Array.isArray(x.misconceptions)) c.fail("misconceptions", "must be a list of misconception ids");
  else {
    x.misconceptions.forEach((m, i) => c.id(m, `misconceptions[${i}]`));
    if (new Set(x.misconceptions).size !== x.misconceptions.length) c.fail("misconceptions", "has a repeated id");
  }
  if (x.model !== undefined) c.model(x.model, "model");

  const interaction = x.interaction as Interaction;
  if (!INTERACTIONS.includes(interaction)) {
    c.fail("interaction", `must be one of ${INTERACTIONS.join(", ")}`);
    return { ok: false, errors: c.errors };
  }
  c.extra(x, [...COMMON_KEYS, ...KEYS[interaction]], "");

  if (!isObj(x.scoring)) c.fail("scoring", "must be { marks }");
  else {
    c.extra(x.scoring, ["marks", "partialCredit", "timeLimitSeconds"], "scoring.");
    c.int(x.scoring.marks, "scoring.marks", 1, 100);
    if (x.scoring.partialCredit !== undefined) {
      if (!["none", "per-part"].includes(x.scoring.partialCredit as string)) c.fail("scoring.partialCredit", "must be none or per-part");
      else if (x.scoring.partialCredit === "per-part" && !PARTIAL_CREDIT.includes(interaction)) c.fail("scoring.partialCredit", `per-part credit needs several parts; ${interaction} has one answer`);
    }
    if (x.scoring.timeLimitSeconds !== undefined) c.int(x.scoring.timeLimitSeconds, "scoring.timeLimitSeconds", 1, 3600);
  }

  // Interaction-specific fields
  const declared = new Set(Array.isArray(x.misconceptions) ? (x.misconceptions as string[]) : []);
  const tagsUsed = (list: unknown, path: string) => {
    if (!Array.isArray(list)) return;
    list.forEach((o, i) => {
      if (isObj(o) && typeof o.misconception === "string" && !declared.has(o.misconception)) c.fail(`${path}[${i}].misconception`, `"${o.misconception}" is not listed in misconceptions`);
    });
  };

  switch (interaction) {
    case "choose-one": {
      const ids = c.options(x.options, "options");
      if (c.key(x.correctId, "correctId") && ids.length && !ids.includes(x.correctId as string)) c.fail("correctId", `"${x.correctId}" is not one of the option ids`);
      const right = Array.isArray(x.options) ? (x.options as Obj[]).find((o) => isObj(o) && o.id === x.correctId) : undefined;
      if (right?.misconception) c.fail("correctId", "the correct option can't carry a misconception tag");
      if (x.fixedOrder !== undefined && typeof x.fixedOrder !== "boolean") c.fail("fixedOrder", "must be true or false");
      tagsUsed(x.options, "options");
      break;
    }
    case "multi-select": {
      const ids = c.options(x.options, "options");
      if (!Array.isArray(x.correctIds) || x.correctIds.length === 0) c.fail("correctIds", "must list at least one correct option id");
      else {
        if (new Set(x.correctIds).size !== x.correctIds.length) c.fail("correctIds", "has a repeated id (it is a set)");
        x.correctIds.forEach((id, i) => c.key(id, `correctIds[${i}]`) && ids.length && !ids.includes(id as string) && c.fail(`correctIds[${i}]`, `"${id}" is not one of the option ids`));
      }
      tagsUsed(x.options, "options");
      break;
    }
    case "number-entry": {
      if (typeof x.answer !== "number" || !Number.isFinite(x.answer)) c.fail("answer", "must be a finite number");
      const v = x.validation;
      if (!isObj(v)) c.fail("validation", "must be { comparison, maxDecimals, allowNegative }");
      else {
        c.extra(v, ["comparison", "maxDecimals", "allowNegative"], "validation.");
        const cmp = v.comparison;
        if (!isObj(cmp) || !["exact", "round", "tolerance"].includes(cmp.kind as string)) c.fail("validation.comparison", "must be exact, round or tolerance");
        else if (cmp.kind === "exact") c.extra(cmp, ["kind"], "validation.comparison.");
        else if (cmp.kind === "round") {
          c.extra(cmp, ["kind", "places"], "validation.comparison.");
          c.int(cmp.places, "validation.comparison.places", 0, 6);
        } else {
          c.extra(cmp, ["kind", "absolute"], "validation.comparison.");
          if (typeof cmp.absolute !== "number" || !(cmp.absolute > 0) || !Number.isFinite(cmp.absolute)) c.fail("validation.comparison.absolute", "must be a positive number");
        }
        if (c.int(v.maxDecimals, "validation.maxDecimals", 0, 6) && typeof x.answer === "number") {
          const scaled = x.answer * 10 ** (v.maxDecimals as number);
          if (Math.abs(scaled - Math.round(scaled)) > 1e-9) c.fail("answer", `has more than ${v.maxDecimals} decimal places, so it couldn't be typed`);
        }
        if (typeof v.allowNegative !== "boolean") c.fail("validation.allowNegative", "must be true or false");
        else if (!v.allowNegative && typeof x.answer === "number" && x.answer < 0) c.fail("answer", "is negative but negative answers are not allowed");
      }
      if (x.unit !== undefined) c.text(x, "unit", "");
      if (x.traps !== undefined) {
        if (!Array.isArray(x.traps)) c.fail("traps", "must be a list");
        else {
          const seen = new Set<number>();
          x.traps.forEach((t, i) => {
            if (!isObj(t) || typeof t.value !== "number" || !Number.isFinite(t.value)) return c.fail(`traps[${i}].value`, "must be a finite number");
            c.extra(t, ["value", "misconception", "feedback"], `traps[${i}].`);
            if (t.value === x.answer) c.fail(`traps[${i}].value`, "equals the correct answer");
            if (seen.has(t.value)) c.fail(`traps[${i}].value`, "repeats another trap");
            seen.add(t.value);
          });
          tagsUsed(x.traps, "traps");
        }
      }
      break;
    }
    case "fraction-entry": {
      const okA = c.fraction(x.answer, "answer");
      if (!isObj(x.validation) || typeof x.validation.acceptEquivalent !== "boolean") c.fail("validation.acceptEquivalent", "must be true or false");
      else c.extra(x.validation, ["acceptEquivalent"], "validation.");
      if (x.traps !== undefined) {
        if (!Array.isArray(x.traps)) c.fail("traps", "must be a list");
        else
          x.traps.forEach((t, i) => {
            if (!isObj(t)) return c.fail(`traps[${i}]`, "must be a trap { value }");
            c.extra(t, ["value", "misconception", "feedback"], `traps[${i}].`);
            if (c.fraction(t.value, `traps[${i}].value`) && okA) {
              const a = x.answer as { n: number; d: number };
              const v = t.value as { n: number; d: number };
              const same = a.n === v.n && a.d === v.d;
              const eq = equalFractions(c, a, v, `traps[${i}].value`);
              if (same || (eq && isObj(x.validation) && x.validation.acceptEquivalent)) c.fail(`traps[${i}].value`, "would be marked correct, so it can't be a trap");
            }
          });
        tagsUsed(x.traps, "traps");
      }
      break;
    }
    case "compare": {
      const ok = c.fraction(x.left, "left") && c.fraction(x.right, "right");
      if (!["<", "=", ">"].includes(x.answer as string)) c.fail("answer", "must be <, = or >");
      else if (ok) {
        const s = sign(c, x.left as { n: number; d: number }, x.right as { n: number; d: number }, "answer");
        if (s && s !== x.answer) c.fail("answer", `is "${x.answer}" but the fractions give "${s}"`);
      }
      break;
    }
    case "shade": {
      const m = x.model;
      if (!isObj(m) || m.kind !== "partition") c.fail("model", "shade needs a partition model to shade");
      else if (Array.isArray(m.sizes) && !(m.sizes as number[]).every((s) => s === (m.sizes as number[])[0])) c.fail("model.sizes", "shade needs equal parts");
      if (!isObj(x.validation) || typeof x.validation.acceptEquivalent !== "boolean") c.fail("validation.acceptEquivalent", "must be true or false");
      else c.extra(x.validation, ["acceptEquivalent"], "validation.");
      if (c.fraction(x.target, "target") && isObj(m) && Number.isSafeInteger(m.parts)) {
        const t = x.target as { n: number; d: number };
        if (t.n > t.d) c.fail("target", "is more than one whole");
        else if ((t.n * (m.parts as number)) % t.d !== 0) c.fail("target", `${t.n}/${t.d} is not a whole number of the ${m.parts} parts`);
      }
      break;
    }
    case "number-line-place": {
      if (c.int(x.intervals, "intervals", 1, 1000) && c.fraction(x.target, "target")) {
        const t = x.target as { n: number; d: number };
        if (t.n > t.d) c.fail("target", "is beyond 1 on a 0–1 line");
        else if ((t.n * (x.intervals as number)) % t.d !== 0) c.fail("target", `${t.n}/${t.d} is not on a tick of a line with ${x.intervals} gaps`);
      }
      break;
    }
    case "match": {
      const rowIds: string[] = [];
      const choiceIds: string[] = [];
      for (const [key, list, out] of [["rows", x.rows, rowIds], ["choices", x.choices, choiceIds]] as const) {
        if (!Array.isArray(list) || list.length < 2) {
          c.fail(key, "must list at least 2 items");
          continue;
        }
        list.forEach((it, i) => {
          if (!isObj(it)) return c.fail(`${key}[${i}]`, "must be { id, text }");
          c.extra(it, key === "rows" ? ["id", "text", "model"] : ["id", "text"], `${key}[${i}].`);
          if (c.key(it.id, `${key}[${i}].id`)) {
            if (out.includes(it.id as string)) c.fail(`${key}[${i}].id`, `duplicate id "${it.id}"`);
            out.push(it.id as string);
          }
          c.text(it, "text", `${key}[${i}].`);
          if (it.model !== undefined) c.model(it.model, `${key}[${i}].model`);
        });
      }
      if (!isObj(x.pairs)) c.fail("pairs", "must map every row id to one choice id");
      else {
        for (const r of rowIds) if (!(r in x.pairs)) c.fail(`pairs.${r}`, "row has no paired choice");
        for (const [r, ch] of Object.entries(x.pairs)) {
          if (!rowIds.includes(r)) c.fail(`pairs.${r}`, "is not a row id");
          if (typeof ch !== "string" || !choiceIds.includes(ch)) c.fail(`pairs.${r}`, `"${String(ch)}" is not a choice id`);
        }
      }
      break;
    }
    case "missing-number": {
      const okL = c.fraction(x.left, "left");
      if (!isObj(x.right)) {
        c.fail("right", "must be { n, d } with exactly one of them null");
        break;
      }
      c.extra(x.right, ["n", "d"], "right.");
      const rn = x.right.n;
      const rd = x.right.d;
      if ((rn === null) === (rd === null)) c.fail("right", "exactly one of n and d must be null (the gap)");
      else {
        if (rn !== null) c.int(rn, "right.n", 0);
        if (rd !== null) c.int(rd, "right.d", 1);
        if (c.int(x.answer, "answer", rd === null ? 1 : 0) && okL) {
          const filled = rn === null ? { n: x.answer as number, d: rd as number } : { n: rn as number, d: x.answer as number };
          const eq = equalFractions(c, x.left as { n: number; d: number }, filled, "answer");
          if (eq === false) c.fail("answer", `${x.answer} doesn't make the two fractions equal`);
        }
      }
      break;
    }
    case "fraction-of": {
      const okF = c.fraction(x.fraction, "fraction");
      if (c.int(x.amount, "amount", 0) && okF && c.int(x.answer, "answer", 0)) {
        const f = x.fraction as { n: number; d: number };
        try {
          const total = checkedMultiply(x.amount as number, f.n);
          if (total % f.d !== 0) c.fail("fraction", `${f.n}/${f.d} of ${x.amount} is not a whole number`);
          else if (total / f.d !== x.answer) c.fail("answer", `is ${x.answer} but ${f.n}/${f.d} of ${x.amount} is ${total / f.d}`);
        } catch {
          c.fail("answer", "numbers too large to check exactly");
        }
      }
      if (x.unit !== undefined) c.text(x, "unit", "");
      if (x.traps !== undefined) {
        if (!Array.isArray(x.traps)) c.fail("traps", "must be a list");
        else
          x.traps.forEach((t, i) => {
            if (!isObj(t) || typeof t.value !== "number") return c.fail(`traps[${i}].value`, "must be a number");
            c.extra(t, ["value", "misconception", "feedback"], `traps[${i}].`);
            if (t.value === x.answer) c.fail(`traps[${i}].value`, "equals the correct answer");
          });
        tagsUsed(x.traps, "traps");
      }
      break;
    }
    case "explain-frame": {
      if (!Array.isArray(x.frame) || !x.frame.some((p) => isObj(p))) {
        c.fail("frame", "must contain text and at least one slot");
        break;
      }
      const slots = new Set<string>();
      x.frame.forEach((p, i) => {
        if (typeof p === "string") return;
        if (!isObj(p)) return c.fail(`frame[${i}]`, "must be text or a slot");
        c.extra(p, ["slot", "options", "answerId"], `frame[${i}].`);
        if (c.key(p.slot, `frame[${i}].slot`)) {
          if (slots.has(p.slot as string)) c.fail(`frame[${i}].slot`, `duplicate slot "${p.slot}"`);
          slots.add(p.slot as string);
        }
        const ids = c.options(p.options, `frame[${i}].options`);
        if (c.key(p.answerId, `frame[${i}].answerId`) && ids.length && !ids.includes(p.answerId as string)) c.fail(`frame[${i}].answerId`, `"${p.answerId}" is not one of this slot's option ids`);
        tagsUsed(p.options, `frame[${i}].options`);
      });
      break;
    }
    case "counterexample": {
      const p = x.predicate;
      if (!isObj(p)) {
        c.fail("predicate", "must be { id, params }");
        break;
      }
      c.extra(p, ["id", "params"], "predicate.");
      if (!COUNTEREXAMPLE_PREDICATES.includes(p.id as never)) c.fail("predicate.id", `must be one of ${COUNTEREXAMPLE_PREDICATES.join(", ")}`);
      if (!isObj(p.params)) c.fail("predicate.params", "must be { maxDenominator }");
      else {
        c.extra(p.params, ["maxDenominator"], "predicate.params.");
        // Both claims need a pair like 1/2 and 3/4 (or 2/8): denominators up to at least 4.
        c.int(p.params.maxDenominator, "predicate.params.maxDenominator", 4, 100);
      }
      break;
    }
  }
  return c.errors.length ? { ok: false, errors: c.errors } : { ok: true, value: x as unknown as QuestionDefinition };
}
