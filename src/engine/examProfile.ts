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

/* D-037: profiles from official pages read on 10 Nov 2026 (docs/product/exams/evidence/official-sources-2026-11-10.md). */
const READ = "2026-11-10";
const src = (about: string, publisher: string, url: string, quote: string): SourceRef => ({ url, publisher, about, retrieved: READ, quote });

const ISEB_FAMILIES = "https://iseb.co.uk/families-hub/pre-tests-admissions-toolkit/preparing-for-the-pre-tests/what-are-the-iseb-common-pre-tests-11-and-how-do-they-work";
export const ISEB_PRE_TEST: ExamProfile = {
  id: "iseb",
  name: "ISEB Common Pre-Tests (many independent schools)",
  admissionsYear: "as published by ISEB, read 10 Nov 2026",
  subjects: { status: "verified", value: ["English", "mathematics", "verbal reasoning", "non-verbal reasoning"], source: src("iseb", "ISEB", ISEB_FAMILIES, "through four tests: English, mathematics, verbal reasoning (VR) and non-verbal reasoning (NVR).") },
  provider: { status: "verified", value: "ISEB", source: src("iseb", "ISEB", ISEB_FAMILIES, "The Pre-Tests are multiple choice, online tests.") },
  questionFormats: { status: "verified", value: "multiple-choice", source: src("iseb", "ISEB", ISEB_FAMILIES, "The Pre-Tests are multiple choice, online tests.") },
  mathsMinutes: { status: "verified", value: 40, source: src("iseb", "ISEB", ISEB_FAMILIES, "Mathematics: 40 minutes") },
  calculators: unknown("Not stated on the pages read."),
  sourceDate: READ,
  changes: [],
};

const GL_FREE = "https://11plus.gl-assessment.co.uk/free-materials/";
export const GL_GENERAL: ExamProfile = {
  id: "gl",
  name: "GL Assessment 11+ (general: local tests differ)",
  admissionsYear: "as published by GL Assessment, read 10 Nov 2026",
  subjects: unknown("Each area or school chooses its subjects from verbal reasoning, non-verbal reasoning, English and maths."),
  provider: { status: "verified", value: "GL Assessment", source: src("gl", "GL Assessment", GL_FREE, "We recommend children familiarise themselves with the multiple-choice layout of the test") },
  questionFormats: { status: "verified", value: "multiple-choice", source: src("gl", "GL Assessment", GL_FREE, "We recommend children familiarise themselves with the multiple-choice layout of the test") },
  mathsMinutes: unknown("GL says: The exact timings for, and number of questions in, your local 11+ test may differ."),
  calculators: unknown("Not stated on the page read."),
  sourceDate: READ,
  changes: [],
};

const CSSE_HOME = "https://www.csse.org.uk/";
export const CSSE_ESSEX: ExamProfile = {
  id: "csse",
  name: "CSSE (Consortium of Selective Schools in Essex)",
  admissionsYear: "as published by CSSE, read 10 Nov 2026",
  subjects: { status: "verified", value: ["English", "Mathematics"], source: src("csse", "CSSE", CSSE_HOME, "The candidates sit two tests. One in English and one in Mathematics.") },
  provider: { status: "verified", value: "CSSE", source: src("csse", "CSSE", CSSE_HOME, "The candidates sit two tests. One in English and one in Mathematics.") },
  questionFormats: unknown("Not stated on the CSSE home page; tutoring sites disagree, so it isn't assumed."),
  mathsMinutes: { status: "verified", value: 60, source: src("csse", "CSSE", CSSE_HOME, "The Mathematics paper will last sixty minutes.") },
  calculators: unknown("Not stated on the page read."),
  sourceDate: READ,
  changes: [],
};

const SEAG_GUIDE = "https://www.seagni.co.uk/guidance/assessment-guide";
export const SEAG_NI: ExamProfile = {
  id: "seag",
  name: "SEAG Entrance Assessment (Northern Ireland)",
  admissionsYear: "as published by SEAG, read 10 Nov 2026",
  subjects: { status: "verified", value: ["English (or Gaeilge)", "Mathematics"], source: src("seag", "SEAG", SEAG_GUIDE, "English (or Gaeilge) and Mathematics.") },
  provider: { status: "verified", value: "SEAG", source: src("seag", "SEAG", SEAG_GUIDE, "The SEAG Entrance Assessment consists of two Papers: Paper 1 and Paper 2.") },
  questionFormats: unknown("Not stated on the assessment guide page."),
  mathsMinutes: unknown("Each 60-minute Main Test covers English (or Gaeilge) and maths together (28 questions each), so there is no separate maths time."),
  calculators: unknown("Not stated on the page read."),
  sourceDate: READ,
  changes: [],
};

/** Every profile the app offers: general practice first, then the verified ones. */
export const EXAM_PROFILES: ExamProfile[] = [GENERAL_PRACTICE, ISEB_PRE_TEST, GL_GENERAL, CSSE_ESSEX, SEAG_NI];
