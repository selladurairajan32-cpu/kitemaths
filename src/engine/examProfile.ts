/**
 * Exam profiles (R5: EXAM-001, EXAM-002). Pure data model and validation.
 *
 * Every fact about an exam is either verified, with the source it came from, or explicitly unknown. Nothing has a
 * default: an unknown timing stays unknown rather than borrowing a typical one. A verified fact must come from a
 * source about this school or consortium, so a format is never inferred from a nearby school (EXAM-002 AC2), and every
 * change is date-stamped (AC3).
 */

export interface SourceRef {
  /** The official page or document. */
  url: string;
  /** Who published it: the school, the council or the consortium. */
  publisher: string;
  /** The profile this source is about. A source about another school can't verify this profile. */
  about: string;
  /** When it was read, as YYYY-MM-DD. */
  retrieved: string;
  /** The words relied on, quoted. */
  quote?: string;
}

export type Known<T> = { status: "verified"; value: T; source: SourceRef } | { status: "unknown"; note?: string };

export type QuestionFormat = "multiple-choice" | "standard" | "mixed";
export type Calculators = "not allowed" | "allowed";

export interface ExamProfile {
  id: string;
  /** The school, consortium or area the profile describes. */
  name: string;
  /** The admissions cycle it describes, such as "2027 entry". */
  admissionsYear: string;
  subjects: Known<string[]>;
  provider: Known<string>;
  questionFormats: Known<QuestionFormat>;
  /** Minutes for the maths section, where officially stated. */
  mathsMinutes: Known<number>;
  calculators: Known<Calculators>;
  /** The latest source date across the profile, YYYY-MM-DD, or null when nothing is verified. */
  sourceDate: string | null;
  changes: ProfileChange[];
}

export interface ProfileChange {
  /** When the change was recorded, YYYY-MM-DD. */
  date: string;
  field: KnownField;
  from: string;
  to: string;
  source: SourceRef | null;
}

export type KnownField = "subjects" | "provider" | "questionFormats" | "mathsMinutes" | "calculators";
export const KNOWN_FIELDS: KnownField[] = ["subjects", "provider", "questionFormats", "mathsMinutes", "calculators"];

export const unknown = <T>(note?: string): Known<T> => ({ status: "unknown", ...(note ? { note } : {}) });

/**
 * The only profile the app ships: general practice, not any real school. Every exam fact is unknown, so a mock built
 * from it says so and uses practice settings the child chooses.
 */
export const GENERAL_PRACTICE: ExamProfile = {
  id: "general",
  name: "General 11+ practice (no particular school)",
  admissionsYear: "any",
  subjects: unknown("Different schools and consortia test different subjects."),
  provider: unknown("No provider is assumed."),
  questionFormats: unknown("Formats differ between tests."),
  mathsMinutes: unknown("Timings differ between tests."),
  calculators: unknown(),
  sourceDate: null,
  changes: [],
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const show = (k: Known<unknown>) => (k.status === "unknown" ? "unknown" : JSON.stringify(k.value));

/** Problems with a profile, or none. Checks EXAM-001 and EXAM-002's rules. */
export function validateProfile(p: ExamProfile): string[] {
  const problems: string[] = [];
  const dates: string[] = [];
  for (const f of KNOWN_FIELDS) {
    const k = p[f] as Known<unknown>;
    if (k.status !== "verified") continue;
    const s = k.source;
    if (!/^https:\/\//.test(s.url)) problems.push(`${f}: the source needs an https URL`);
    if (!s.publisher.trim()) problems.push(`${f}: the source needs a publisher`);
    if (!DATE.test(s.retrieved)) problems.push(`${f}: the source needs a retrieval date (YYYY-MM-DD)`);
    if (s.about !== p.id) problems.push(`${f}: the source is about "${s.about}", not this profile: formats can't be inferred from another school`);
    dates.push(s.retrieved);
  }
  const sorted = dates.sort();
  const latest = sorted.length ? sorted[sorted.length - 1] : null;
  if (p.sourceDate !== latest) problems.push(`sourceDate should be ${latest ?? "null"}, the latest source date`);
  for (const c of p.changes) if (!DATE.test(c.date)) problems.push(`change to ${c.field}: needs a date (YYYY-MM-DD)`);
  return problems;
}

/** Records a change to one fact, date-stamped, with the source for the new value (EXAM-002 AC3). */
export function recordChange<F extends KnownField>(p: ExamProfile, field: F, next: ExamProfile[F], date: string): ExamProfile {
  const before = p[field] as Known<unknown>;
  const after = next as Known<unknown>;
  const change: ProfileChange = { date, field, from: show(before), to: show(after), source: after.status === "verified" ? after.source : null };
  const updated = { ...p, [field]: next, changes: [...p.changes, change] } as ExamProfile;
  const dates = KNOWN_FIELDS.flatMap((f) => {
    const k = updated[f] as Known<unknown>;
    return k.status === "verified" ? [k.source.retrieved] : [];
  });
  dates.sort();
  return { ...updated, sourceDate: dates.length ? dates[dates.length - 1] : null };
}
