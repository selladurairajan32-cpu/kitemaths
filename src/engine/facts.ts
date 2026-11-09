/**
 * Times-table fact evidence (R2: TT-004, TT-005, TT-006, TT-008, TT-009, TT-011, TT-012). Pure: no clock, no randomness
 * beyond the seeded helpers, so every schedule and form is deterministic and testable (TT-012 AC4).
 *
 * A fact is the unordered pair {a, b} with both numbers 2–12: 7 × 8, 8 × 7, 56 ÷ 7 and 56 ÷ 8 are one fact, because
 * knowing one means knowing the others (commutativity and the inverse). Each answer keeps the form it was asked in,
 * so the report can still separate multiplication from division (TT-011 inverse-fact understanding).
 *
 * Thresholds here are product proposals recorded in TT-001 §5 for Product Owner review; they are not MAST-001
 * thresholds and do not change skill mastery.
 */
import { hashString, prng, seededShuffle } from "./random";
import type { FactForm, FactRef, ItemResult } from "./types";

export const FACT_MIN = 2;
export const FACT_MAX = 12;
/** A fact is known after this many correct recalls in a row (TT-006 AC3: repeated correct recall). */
export const FACT_SECURE_STREAK = 3;
/** Leitner boxes: days until a fact is due again, by box (TT-012 AC1 and AC2). */
export const REVIEW_INTERVAL_DAYS = [0, 1, 2, 4, 7, 14] as const;
/** In a planned session, every Nth question retrieves a fact that is already known (TT-006 AC1, AC2). */
export const SECURE_REVIEW_EVERY = 4;
/**
 * At most this many never-seen facts join a mixed session when there are others to practise, so the load stays
 * manageable (TT-012 AC3); with nothing else to practise, new facts fill the session. Learning one chosen table (TT-004)
 * may introduce all of its facts.
 */
export const NEW_FACTS_PER_SESSION = 3;
const DAY_MS = 86_400_000;

/**
 * The recommended order for learning tables (TT-001, TT-004): the national curriculum's year order (2, 5, 10 in Year 2;
 * 3, 4, 8 in Year 3; the rest by Year 4), with each year's tables in the order they build on each other.
 */
export const TABLE_ORDER = [2, 10, 5, 3, 4, 8, 6, 9, 7, 11, 12] as const;

/** The multiplication tables check (Standards and Testing Agency, assessment framework updated 2022, §5). */
export const MTC = {
  length: 25,
  answerMs: 6000,
  pauseMs: 3000,
  /** Table 1: minimum and maximum items per table, by the first number in the question. */
  tableLimits: { 2: [0, 2], 3: [1, 3], 4: [1, 3], 5: [1, 3], 6: [2, 4], 7: [2, 4], 8: [2, 4], 9: [2, 4], 10: [0, 2], 11: [1, 3], 12: [2, 4] } as Record<number, [number, number]>,
  /** Table 2: KS1 tables (2, 5, 10) supply 3 to 7 items; KS2 tables 18 to 22. */
  ks1: [3, 7] as [number, number],
  ks2: [18, 22] as [number, number],
} as const;
const KS1_TABLES = [2, 5, 10];

export type FactStatus = "unseen" | "not-yet" | "developing" | "known";

export const factKey = (a: number, b: number) => `${Math.min(a, b)}x${Math.max(a, b)}`;

/** Every fact 2 × 2 to 12 × 12 once, as unordered pairs (66 facts), smallest first. */
export function allFacts(): { a: number; b: number }[] {
  const out: { a: number; b: number }[] = [];
  for (let a = FACT_MIN; a <= FACT_MAX; a++) for (let b = a; b <= FACT_MAX; b++) out.push({ a, b });
  return out;
}

/** The answer a form asks for, in exact integer arithmetic (TT-008 AC3). */
export function factAnswer(f: FactRef): number {
  const p = f.a * f.b;
  switch (f.form) {
    case "mul":
      return p;
    case "missing-factor":
      return f.b;
    case "div-quotient":
      return f.b;
    case "div-divisor":
      return f.a;
    case "div-dividend":
      return p;
  }
}

/** The question as text, with true × and ÷ signs (UX-003 §6). */
export function factPrompt(f: FactRef): string {
  const p = f.a * f.b;
  switch (f.form) {
    case "mul":
      return `${f.a} × ${f.b} = ?`;
    case "missing-factor":
      return `${f.a} × ? = ${p}`;
    case "div-quotient":
      return `${p} ÷ ${f.a} = ?`;
    case "div-divisor":
      return `${p} ÷ ? = ${f.b}`;
    case "div-dividend":
      return `? ÷ ${f.a} = ${f.b}`;
  }
}

export type AnswerKind = "right" | "slip" | "neighbour" | "added" | "wrong";

/**
 * Classifies an answer (TT-005 AC2: tell a gap in recall from an input mistake where possible). A slip is a wrong number
 * that is the right digits typed badly: swapped (65 for 56), one digit doubled (566) or dropped (5 for 56, when the
 * right answer has two digits or more). A neighbour is one step out (7 × 9 for 7 × 8); added is a + b.
 */
export function classifyAnswer(f: FactRef, given: number | null): AnswerKind {
  const right = factAnswer(f);
  if (given === right) return "right";
  if (given === null || !Number.isSafeInteger(given) || given < 0) return "wrong";
  const r = String(right);
  const g = String(given);
  const sorted = (x: string) => [...x].sort().join("");
  if (r.length >= 2 && g.length === r.length && sorted(g) === sorted(r)) return "slip";
  const removeOne = (x: string) => [...x].map((_, i) => x.slice(0, i) + x.slice(i + 1));
  if (g.length === r.length + 1 && removeOne(g).includes(r)) {
    // One extra digit, and it repeats its neighbour (566 for 56): a key held or pressed twice.
    for (let i = 0; i < g.length; i++) if (g.slice(0, i) + g.slice(i + 1) === r && (g[i] === g[i - 1] || g[i] === g[i + 1])) return "slip";
  }
  if (r.length >= 2 && g.length === r.length - 1 && removeOne(r).includes(g)) return "slip";
  if (f.form === "mul" && (given === f.a * (f.b + 1) || given === f.a * (f.b - 1) || given === (f.a + 1) * f.b || given === (f.a - 1) * f.b)) return "neighbour";
  if (f.form === "mul" && given === f.a + f.b) return "added";
  return "wrong";
}

/**
 * Untimed fact answers in time order. Slips are left out (a slip says nothing about recall, TT-005 AC2), and so are timed
 * answers, which the report keeps apart (TT-011 AC2): a fact is known from untimed recall, never from speed.
 */
function factHistory(results: ItemResult[]): Map<string, ItemResult[]> {
  const by = new Map<string, ItemResult[]>();
  for (const r of [...results].filter((x) => x.fact && !x.slip && !x.timed && x.context !== "timed").sort((x, y) => x.at - y.at)) {
    const k = factKey(r.fact!.a, r.fact!.b);
    if (!by.has(k)) by.set(k, []);
    by.get(k)!.push(r);
  }
  return by;
}

const recalled = (r: ItemResult) => r.correct && r.firstTry && r.hintsUsed === 0;

/** Known: the last FACT_SECURE_STREAK answers all recalled. Developing: some recalled lately. Not yet: none lately. */
export function statusOf(history: ItemResult[] | undefined): FactStatus {
  if (!history?.length) return "unseen";
  const last = history.slice(-FACT_SECURE_STREAK);
  if (last.length === FACT_SECURE_STREAK && last.every(recalled)) return "known";
  return last.some(recalled) ? "developing" : "not-yet";
}

export interface FactState {
  key: string;
  a: number;
  b: number;
  status: FactStatus;
  /** Leitner box 0–5: up one for each recall, back to 1 after a miss (TT-012 AC1). */
  box: number;
  lastAt: number | null;
  /** When it is next due, or null if never seen. */
  dueAt: number | null;
}

/** Replays each fact's answers into its status and review box. */
export function factStates(results: ItemResult[]): FactState[] {
  const history = factHistory(results);
  return allFacts().map(({ a, b }) => {
    const key = factKey(a, b);
    const h = history.get(key) ?? [];
    let box = 0;
    for (const r of h) box = recalled(r) ? Math.min(box + 1, REVIEW_INTERVAL_DAYS.length - 1) : 1;
    const lastAt = h.length ? h[h.length - 1].at : null;
    return { key, a, b, status: statusOf(h), box, lastAt, dueAt: lastAt === null ? null : lastAt + REVIEW_INTERVAL_DAYS[box] * DAY_MS };
  });
}

/** Facts in one table (the table times 2–12), for table-by-table paths (TT-004). */
export const inTable = (s: FactState, table: number) => s.a === table || s.b === table;

/** TT-004: per table, how many of its 11 facts are known, developing, not yet secure or unseen. */
export function tableSummary(states: FactState[], table: number): Record<FactStatus, number> {
  const out: Record<FactStatus, number> = { unseen: 0, "not-yet": 0, developing: 0, known: 0 };
  for (const s of states) if (inTable(s, table)) out[s.status]++;
  return out;
}

/** TT-004 AC3: the first table in TABLE_ORDER that isn't fully known, so a diagnostic can skip what is known. */
export function recommendedTable(states: FactState[]): number | null {
  return TABLE_ORDER.find((t) => tableSummary(states, t).known < 11) ?? null;
}

const DIVISION_FORMS: FactForm[] = ["div-quotient", "div-divisor", "div-dividend"];

/**
 * TT-006 and TT-012: a session of `length` facts. Weak facts first (not yet, then developing, oldest first), every
 * SECURE_REVIEW_EVERY-th slot a known fact that is due (or, failing that, the longest unseen known fact), then up to
 * NEW_FACTS_PER_SESSION new facts in table order. A fact already recalled in multiplication is asked as a division or
 * missing-number form half the time (TT-008), so the inverse keeps being practised. Same input, same session.
 */
export function planSession(results: ItemResult[], now: number, length: number, opts: { table?: number; seed?: string } = {}): FactRef[] {
  const states = factStates(results).filter((s) => opts.table === undefined || inTable(s, opts.table));
  const byAge = (x: FactState, y: FactState) => (x.lastAt ?? 0) - (y.lastAt ?? 0) || x.key.localeCompare(y.key);
  const weak = [...states.filter((s) => s.status === "not-yet").sort(byAge), ...states.filter((s) => s.status === "developing").sort(byAge)];
  const known = states.filter((s) => s.status === "known");
  const dueKnown = [...known.filter((s) => (s.dueAt ?? 0) <= now).sort(byAge), ...known.filter((s) => (s.dueAt ?? 0) > now).sort(byAge)];
  const order = (s: FactState) => Math.min(...[s.a, s.b].map((n) => TABLE_ORDER.indexOf(n as (typeof TABLE_ORDER)[number])));
  const fresh = states.filter((s) => s.status === "unseen").sort((x, y) => order(x) - order(y) || x.key.localeCompare(y.key)).slice(0, opts.table === undefined ? Math.max(NEW_FACTS_PER_SESSION, length - weak.length - dueKnown.length) : length);

  const picked: FactState[] = [];
  const take = (list: FactState[]) => {
    const next = list.find((s) => !picked.includes(s));
    if (next) picked.push(next);
    return !!next;
  };
  while (picked.length < length) {
    const slot = picked.length + 1;
    const ok = slot % SECURE_REVIEW_EVERY === 0 ? take(dueKnown) || take(weak) || take(fresh) : take(weak) || take(fresh) || take(dueKnown);
    if (!ok) break;
  }
  // Recall evidence per fact, to choose a form: inverse forms only once multiplication has been recalled.
  const history = factHistory(results);
  const rand = prng(hashString(`${opts.seed ?? "plan"}:${now}`));
  return picked.map((s) => {
    const mulRecalled = (history.get(s.key) ?? []).some((r) => r.fact!.form === "mul" && recalled(r));
    const flip = rand() < 0.5;
    const [a, b] = flip ? [s.b, s.a] : [s.a, s.b];
    const form: FactForm = mulRecalled && rand() < 0.5 ? (rand() < 0.25 ? "missing-factor" : DIVISION_FORMS[Math.floor(rand() * DIVISION_FORMS.length)]) : "mul";
    return { a, b, form };
  });
}


/**
 * TT-005: an all-facts diagnostic. Two facts from every table 2–12 (each fact counted once), plus three more from the
 * tables the multiplication tables check names as hardest (6, 7, 8, 9 and 12), so every table is sampled and none is
 * judged on a single answer. Deterministic for a seed.
 */
export function diagnosticSample(seed: string): FactRef[] {
  const chosen: string[] = [];
  const out: FactRef[] = [];
  const add = (a: number, b: number) => {
    const k = factKey(a, b);
    if (chosen.includes(k) || out.length >= 25) return false;
    chosen.push(k);
    out.push({ a, b, form: "mul" });
    return true;
  };
  for (let a = FACT_MIN; a <= FACT_MAX; a++) {
    let n = 0;
    for (const b of seededShuffle(range(FACT_MIN, FACT_MAX), `${seed}:${a}`)) if (n < 2 && add(a, b)) n++;
  }
  for (const a of seededShuffle([6, 7, 8, 9, 12], `${seed}:hard`))
    for (const b of seededShuffle(range(6, FACT_MAX), `${seed}:hard:${a}`)) if (add(a, b)) break;
  return seededShuffle(out, `${seed}:order`);
}

/**
 * TT-009: one form of the timed simulator, built within the published limits: 25 multiplication questions, the table
 * (first number) within Table 1, KS1 and KS2 counts within Table 2, second numbers 2–12 spread evenly, no fact twice.
 */
export function mtcForm(seed: string): FactRef[] {
  const tables = Object.keys(MTC.tableLimits).map(Number);
  const count: Record<number, number> = Object.fromEntries(tables.map((t) => [t, MTC.tableLimits[t][0]]));
  const ks1 = () => KS1_TABLES.reduce((n, t) => n + count[t], 0);
  const total = () => tables.reduce((n, t) => n + count[t], 0);
  // Meet the KS1 minimum, then fill to 25, always within each table's maximum and the KS1/KS2 maximums.
  for (const t of seededShuffle(KS1_TABLES, `${seed}:ks1`)) if (ks1() < MTC.ks1[0] && count[t] < MTC.tableLimits[t][1]) count[t]++;
  for (const t of seededShuffle(KS1_TABLES, `${seed}:ks1b`)) if (ks1() < MTC.ks1[0] && count[t] < MTC.tableLimits[t][1]) count[t]++;
  const fillOrder = seededShuffle(tables, `${seed}:fill`);
  let guard = 0;
  while (total() < MTC.length && guard++ < 200) {
    for (const t of fillOrder) {
      if (total() >= MTC.length) break;
      const isKs1 = KS1_TABLES.includes(t);
      if (count[t] >= MTC.tableLimits[t][1]) continue;
      if (isKs1 && ks1() >= MTC.ks1[1]) continue;
      if (!isKs1 && total() - ks1() >= MTC.ks2[1]) continue;
      count[t]++;
    }
  }
  const usedB: Record<number, number> = Object.fromEntries(range(FACT_MIN, FACT_MAX).map((b) => [b, 0]));
  const seen = new Set<string>();
  const out: FactRef[] = [];
  for (const t of seededShuffle(tables, `${seed}:pick`)) {
    for (let i = 0; i < count[t]; i++) {
      // The least-used second number not yet asked with this table.
      const options = seededShuffle(range(FACT_MIN, FACT_MAX), `${seed}:${t}:${i}`).filter((b) => !seen.has(`${t}x${b}`));
      options.sort((x, y) => usedB[x] - usedB[y]);
      const b = options[0];
      seen.add(`${t}x${b}`);
      usedB[b]++;
      out.push({ a: t, b, form: "mul" });
    }
  }
  return seededShuffle(out, `${seed}:order`);
}

/** Familiarisation questions before a timed run: the framework allows the 1 times table here; they are not scored. */
export function mtcPractice(seed: string): FactRef[] {
  return seededShuffle([1, 2, 10], `${seed}:warm`).map((a, i) => ({ a, b: [3, 4, 5][i], form: "mul" as const }));
}

/** TT-009: an answer counts only if it is right and given within the 6-second window. */
export const mtcCorrect = (f: FactRef, given: number | null, durationMs: number) => given === factAnswer(f) && durationMs <= MTC.answerMs;

export interface FactReportRow {
  key: string;
  a: number;
  b: number;
  status: FactStatus;
  /** Untimed answers (practice, diagnostic, confidence mode). */
  attempts: number;
  correct: number;
  /** The last up-to-three untimed answers, oldest first: true for a recall (TT-011 recall consistency). */
  recent: boolean[];
  /** Division and missing-number answers (TT-011 inverse-fact understanding). */
  inverseAttempts: number;
  inverseCorrect: number;
  /** Timed simulator answers, kept apart (TT-011 AC2). */
  timedAttempts: number;
  timedCorrect: number;
  slips: number;
}

/** TT-011: per-fact accuracy, consistency, inverse understanding and timed results, from the stored answers only. */
export function factReport(results: ItemResult[]): FactReportRow[] {
  const states = new Map(factStates(results).map((s) => [s.key, s]));
  const all = results.filter((r) => r.fact);
  return allFacts().map(({ a, b }) => {
    const key = factKey(a, b);
    const mine = all.filter((r) => factKey(r.fact!.a, r.fact!.b) === key);
    const untimed = mine.filter((r) => !r.timed && !r.slip).sort((x, y) => x.at - y.at);
    const timed = mine.filter((r) => r.timed);
    const inverse = untimed.filter((r) => r.fact!.form !== "mul");
    return {
      key, a, b,
      status: states.get(key)!.status,
      attempts: untimed.length,
      correct: untimed.filter((r) => r.correct).length,
      recent: untimed.slice(-FACT_SECURE_STREAK).map(recalled),
      inverseAttempts: inverse.length,
      inverseCorrect: inverse.filter((r) => r.correct).length,
      timedAttempts: timed.length,
      timedCorrect: timed.filter((r) => r.correct).length,
      slips: mine.filter((r) => r.slip).length,
    };
  });
}

function range(lo: number, hi: number): number[] {
  return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
}
