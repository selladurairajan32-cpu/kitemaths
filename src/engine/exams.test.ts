import { describe, expect, it } from "vitest";
import { GENERAL_PRACTICE, KNOWN_FIELDS, recordChange, validateProfile, type ExamProfile, type SourceRef } from "./examProfile";
import { analyseMock, configFor, DEFAULT_MOCK, NO_PREDICTION, PRACTICE_LABEL, revisionPlan } from "./mock";
import type { ItemResult, MockMeta } from "./types";

/** R5: exam profiles (EXAM-001, EXAM-002) and mock analysis (EXAM-005, EXAM-006). Hand-built cases as oracles. */

const src = (about: string, retrieved = "2026-09-01"): SourceRef => ({ url: "https://example.org/admissions", publisher: "Example School", about, retrieved, quote: "Maths: 50 minutes" });
const profile = (over: Partial<ExamProfile> = {}): ExamProfile => ({ ...GENERAL_PRACTICE, id: "example-school", name: "Example School", admissionsYear: "2027 entry", ...over });

describe("exam profiles (EXAM-001)", () => {
  it("ships only general practice, with every exam fact explicitly unknown", () => {
    for (const f of KNOWN_FIELDS) expect(GENERAL_PRACTICE[f].status, f).toBe("unknown");
    expect(GENERAL_PRACTICE.sourceDate).toBeNull();
    expect(validateProfile(GENERAL_PRACTICE)).toEqual([]);
  });

  it("accepts a verified fact only with an https source, publisher, date and the same profile", () => {
    const ok = profile({ mathsMinutes: { status: "verified", value: 50, source: src("example-school") }, sourceDate: "2026-09-01" });
    expect(validateProfile(ok)).toEqual([]);
    const noDate = profile({ mathsMinutes: { status: "verified", value: 50, source: { ...src("example-school"), retrieved: "Sept" } }, sourceDate: "Sept" });
    expect(validateProfile(noDate).join()).toMatch(/retrieval date/);
  });
});

describe("verification workflow (EXAM-002)", () => {
  it("refuses a format inferred from a nearby school", () => {
    const borrowed = profile({ questionFormats: { status: "verified", value: "multiple-choice", source: src("neighbouring-school") }, sourceDate: "2026-09-01" });
    expect(validateProfile(borrowed).join()).toMatch(/can't be inferred from another school/);
  });

  it("date-stamps every change and keeps the source date current", () => {
    const p1 = recordChange(profile(), "mathsMinutes", { status: "verified", value: 50, source: src("example-school", "2026-09-01") }, "2026-09-02");
    const p2 = recordChange(p1, "mathsMinutes", { status: "verified", value: 45, source: src("example-school", "2026-10-15") }, "2026-10-16");
    expect(p2.changes.map((c) => [c.date, c.field, c.from, c.to])).toEqual([
      ["2026-09-02", "mathsMinutes", "unknown", "50"],
      ["2026-10-16", "mathsMinutes", "50", "45"],
    ]);
    expect(p2.sourceDate).toBe("2026-10-15");
    expect(validateProfile(p2)).toEqual([]);
  });
});

describe("mock configuration (EXAM-005)", () => {
  it("uses verified timing and format as stated, and the child's choices for anything unknown, saying which", () => {
    const general = configFor(GENERAL_PRACTICE, { ...DEFAULT_MOCK, sectionMinutes: 20, format: "number" });
    expect(general.config).toMatchObject({ sectionMinutes: 20, format: "number", profileId: "general" });
    expect(general.notes.join(" ")).toMatch(/not known for this test/);
    const verified = profile({
      mathsMinutes: { status: "verified", value: 50, source: src("example-school") },
      questionFormats: { status: "verified", value: "multiple-choice", source: src("example-school") },
      sourceDate: "2026-09-01",
    });
    const v = configFor(verified, { ...DEFAULT_MOCK, sectionMinutes: 20, format: "number" });
    expect(v.config).toMatchObject({ sectionMinutes: 50, format: "multiple-choice" });
    expect(v.notes.join(" ")).toMatch(/from Example School \(read 2026-09-01\)/);
  });

  it("keeps question count and time within limits, and labels itself practice", () => {
    expect(configFor(GENERAL_PRACTICE, { ...DEFAULT_MOCK, questionCount: 400, sectionMinutes: 0 }).config).toMatchObject({ questionCount: 40, sectionMinutes: 5 });
    expect(PRACTICE_LABEL).toMatch(/not an official paper or a past paper/);
  });
});

describe("post-test analysis (EXAM-006)", () => {
  let clock = 0;
  const ans = (skill: string, ok: boolean, extra: Partial<ItemResult> = {}): ItemResult => {
    clock += 1;
    return { questionId: `q${clock}`, skill, context: "practice", correct: ok, firstTry: ok, attempts: 1, hintsUsed: 0, misconceptions: [], at: clock, ...extra };
  };
  const meta = (index: number, m: Partial<MockMeta> = {}): MockMeta => ({ session: "s", index, total: 5, sectionMs: 600_000, format: "number", answeredAtMs: 60_000, changed: false, endedAtMs: 600_000, ...m });

  it("separates timing pressure, format, careless errors and knowledge gaps, and says unclear without evidence", () => {
    const history = [
      ...Array.from({ length: 4 }, () => ans("mock-exams.number", true)), // secure skill
      ans("mock-exams.fdp", false), ans("mock-exams.fdp", false), ans("mock-exams.fdp", true), // not secure
      ans("mock-exams.shape", true, { context: "mock", mock: meta(9, { format: "multiple-choice" }) }),
      ans("mock-exams.shape", true, { context: "mock", mock: meta(8, { format: "multiple-choice" }) }),
    ];
    const mock = [
      ans("mock-exams.calculation", false, { context: "mock", mock: meta(0, { answeredAtMs: null }) }), // unanswered: timing
      ans("mock-exams.calculation", false, { context: "mock", mock: meta(1, { answeredAtMs: 560_000 }) }), // last tenth: timing
      ans("mock-exams.shape", false, { context: "mock", mock: meta(2, { format: "number" }) }), // right in the other format: format
      ans("mock-exams.number", false, { context: "mock", mock: meta(3) }), // secure skill: careless
      ans("mock-exams.fdp", false, { context: "mock", mock: meta(4) }), // not secure: knowledge
      ans("mock-exams.reasoning", false, { context: "mock", mock: meta(5) }), // no evidence: unclear
      ans("mock-exams.reasoning", true, { context: "mock", mock: meta(6) }),
    ];
    const a = analyseMock(mock, history);
    expect(a.map((x) => x.kind)).toEqual(["timing", "timing", "format", "careless", "knowledge", "unclear", null]);
    // Skipped in a mock finished early is not time pressure: the evidence doesn't say why.
    const early = analyseMock([ans("mock-exams.calculation", false, { context: "mock", mock: meta(0, { answeredAtMs: null, endedAtMs: 120_000 }) })], history);
    expect(early[0]).toMatchObject({ kind: "unclear", because: expect.stringMatching(/finished before the time ran out/) });
    for (const x of a) expect(x.because.length).toBeGreaterThan(3);
  });

  it("turns the analysis into an actionable plan, largest problem first, and predicts nothing", () => {
    const plan = revisionPlan([
      { index: 0, skill: "a", correct: false, kind: "knowledge", because: "" },
      { index: 1, skill: "b", correct: false, kind: "knowledge", because: "" },
      { index: 2, skill: "c", correct: false, kind: "timing", because: "" },
      { index: 3, skill: "c", correct: true, kind: null, because: "" },
    ]);
    expect(plan.map((p) => [p.kind, p.skills])).toEqual([["knowledge", ["a", "b"]], ["timing", ["c"]]]);
    for (const p of plan) expect(p.action.length).toBeGreaterThan(20);
    expect(NO_PREDICTION).toMatch(/does not predict/);
    expect(`${NO_PREDICTION} ${plan.map((p) => p.action).join(" ")}`).not.toMatch(/\b(likely to pass|will pass|chance of passing|offer probability|predicted score)\b/i);
  });
});
