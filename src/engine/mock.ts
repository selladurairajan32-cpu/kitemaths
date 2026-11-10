/**
 * Practice mock tests (R5: EXAM-005, EXAM-006). Pure: configuration from a profile, and post-test analysis.
 *
 * A mock built by Kite Maths is practice material, never an official or past paper (EXAM-005 AC4). Its analysis
 * separates kinds of mistake only where the stored evidence supports it, says "unclear" otherwise, and never predicts
 * admission or an offer (EXAM-006 AC3).
 */
import type { ExamProfile } from "./examProfile";
import { skillMastery } from "./mastery";
import type { ItemResult } from "./types";

export type ReviewRule = "anytime" | "end" | "none";
export type MockFormat = "number" | "multiple-choice" | "mixed";

export interface MockConfig {
  questionCount: number;
  sectionMinutes: number;
  /** anytime: move back and forth and change answers; end: review only after the last question; none: no going back. */
  review: ReviewRule;
  format: MockFormat;
  profileId: string;
}

export const MOCK_LIMITS = { questions: [5, 40], minutes: [5, 60] } as const;
export const DEFAULT_MOCK: Omit<MockConfig, "profileId"> = { questionCount: 12, sectionMinutes: 15, review: "anytime", format: "mixed" };

/** The label every mock carries (EXAM-005 AC4). */
export const PRACTICE_LABEL = "Practice mock made by Kite Maths. It is not an official paper or a past paper.";
/** What post-test analysis never does (EXAM-006 AC3). */
/** What a child reads under their results (D-037: short and plain); grown-ups can open the full statement below it. */
export const NO_PREDICTION_CHILD = "This is practice. It can't tell you a test score or a result.";
export const NO_PREDICTION = "This analysis does not predict a test score, a pass mark, admission or the chance of an offer: there is no model or data that could support that.";

/**
 * EXAM-005 AC3: settings from a profile. A verified timing or format is used as stated; anything unknown comes from the
 * child's choices, and the notes say which is which.
 */
export function configFor(profile: ExamProfile, chosen: Omit<MockConfig, "profileId">): { config: MockConfig; notes: string[] } {
  const clamp = (n: number, [lo, hi]: readonly [number, number]) => Math.min(hi, Math.max(lo, Math.round(n)));
  const notes: string[] = [];
  let minutes = clamp(chosen.sectionMinutes, MOCK_LIMITS.minutes);
  let format = chosen.format;
  if (profile.mathsMinutes.status === "verified") {
    minutes = clamp(profile.mathsMinutes.value, MOCK_LIMITS.minutes);
    notes.push(`Timing: ${profile.mathsMinutes.value} minutes, from ${profile.mathsMinutes.source.publisher} (read ${profile.mathsMinutes.source.retrieved}).`);
  } else notes.push("Timing: not known for this test, so your choice is used.");
  if (profile.questionFormats.status === "verified") {
    format = profile.questionFormats.value === "standard" ? "number" : profile.questionFormats.value;
    notes.push(`Format: ${profile.questionFormats.value}, from ${profile.questionFormats.source.publisher} (read ${profile.questionFormats.source.retrieved}).`);
  } else notes.push("Format: not known for this test, so your choice is used.");
  return { config: { questionCount: clamp(chosen.questionCount, MOCK_LIMITS.questions), sectionMinutes: minutes, review: chosen.review, format, profileId: profile.id }, notes };
}

export type MistakeKind = "knowledge" | "careless" | "timing" | "format" | "unclear";

export interface QuestionAnalysis {
  index: number;
  skill: string;
  correct: boolean;
  kind: MistakeKind | null;
  /** The evidence the decision rests on, in words. */
  because: string;
}

/** Answers in the last tenth of the section count as under time pressure. */
export const LATE_SHARE = 0.9;

/**
 * EXAM-006 AC1: why each question went wrong, where the evidence permits. In order:
 * - timing pressure: left unanswered when the time ran out, or answered wrong in the last tenth of the section;
 * - format: wrong here, but every earlier answer on the same skill in the other format was right (at least two);
 * - careless: wrong, but the skill is secure in earlier practice (its learning evidence, MAST-001);
 * - knowledge gap: wrong, and earlier evidence on the skill shows it isn't secure;
 * - unclear: wrong, with too little earlier evidence to say, or left unanswered in a mock finished early.
 * `history` is every stored answer from before the mock.
 */
export function analyseMock(mockAnswers: ItemResult[], history: ItemResult[]): QuestionAnalysis[] {
  return [...mockAnswers]
    .sort((a, b) => a.mock!.index - b.mock!.index)
    .map((r) => {
      const m = r.mock!;
      const base = { index: m.index, skill: r.skill, correct: r.correct };
      if (r.correct) return { ...base, kind: null, because: "Right." };
      if (m.answeredAtMs === null)
        return m.endedAtMs >= m.sectionMs
          ? { ...base, kind: "timing", because: "Not answered before the time ran out." }
          : { ...base, kind: "unclear", because: "Skipped, and the mock was finished before the time ran out." };
      if (m.answeredAtMs >= LATE_SHARE * m.sectionMs) return { ...base, kind: "timing", because: "Answered wrong in the last tenth of the time." };
      const other = history.filter((h) => h.skill === r.skill && h.mock && h.mock.format !== m.format);
      if (other.length >= 2 && other.every((h) => h.correct)) return { ...base, kind: "format", because: `Every earlier ${m.format === "number" ? "multiple-choice" : "written-answer"} question on this skill was right.` };
      const mastery = skillMastery(r.skill, history);
      if (mastery.learningSecure) return { ...base, kind: "careless", because: "This skill is secure in earlier practice." };
      if (mastery.recentCount >= 2) return { ...base, kind: "knowledge", because: "Earlier practice on this skill isn't secure yet." };
      return { ...base, kind: "unclear", because: "Not enough earlier practice on this skill to tell." };
    });
}

export interface RevisionItem {
  kind: Exclude<MistakeKind, "unclear"> | "unclear";
  /** Skills to work on, for knowledge gaps and unclear questions. */
  skills: string[];
  action: string;
}

/** EXAM-006 AC2: an actionable plan, one line per kind of mistake found, largest first. */
export function revisionPlan(analysis: QuestionAnalysis[]): RevisionItem[] {
  const ACTION: Record<MistakeKind, string> = {
    knowledge: "Practise these skills on their island before the next mock.",
    careless: "Check each answer against a quick estimate, and reread the question before moving on.",
    timing: "Practise a timed section: answer the ones you can first, skip the rest and come back.",
    format: "Practise questions in this format, and read every option before choosing.",
    unclear: "Practise these skills a little more, so the next analysis can tell what went wrong.",
  };
  const kinds = (["knowledge", "timing", "careless", "format", "unclear"] as MistakeKind[])
    .map((kind) => ({ kind, items: analysis.filter((a) => a.kind === kind) }))
    .filter((k) => k.items.length > 0)
    .sort((a, b) => b.items.length - a.items.length);
  return kinds.map(({ kind, items }) => ({ kind, skills: [...new Set(items.map((i) => i.skill))], action: ACTION[kind] }));
}
