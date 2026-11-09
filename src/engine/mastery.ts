import { INDEPENDENT_CONTEXTS } from "./types";
import type {
  ItemResult,
  MisconceptionDef,
  MisconceptionId,
  ResultContext,
  SkillId,
} from "./types";

export type SkillStatus =
  | "not-started"
  | "developing"
  | "secure"
  | "passed-check"
  | "mastered"
  | "needs-review";

export interface IndependentEvidence {
  correct: number;
  total: number;
  at: number;
  context: ResultContext;
}

export interface SkillMastery {
  skill: SkillId;
  status: SkillStatus;
  /** 0–1 weighted score over the most recent learning evidence. */
  score: number;
  evidence: number;
  recentCount: number;
  learningSecure: boolean;
  assessed: IndependentEvidence | null;
  sinceCheck: { count: number; score: number };
}

const RECENT_WINDOW = 5;
export const SECURE_MIN_EVIDENCE = 3;
export const SECURE_THRESHOLD = 0.75;
export const MASTERY_MIN_INDEPENDENT = 2;

/** First-try without support = 1, correct with support = 0.5, not correct = 0. */
export function episodeScore(r: ItemResult): number {
  if (r.correct && r.firstTry && r.hintsUsed === 0) return 1;
  if (r.correct) return 0.5;
  return 0;
}

const isLearning = (r: ItemResult) => r.context === "practice" || r.context === "lesson";
const isIndependent = (r: ItemResult) => INDEPENDENT_CONTEXTS.includes(r.context);

function average(rs: ItemResult[]) {
  return rs.length ? rs.reduce((s, r) => s + episodeScore(r), 0) / rs.length : 0;
}

export function latestIndependent(skill: SkillId, results: ItemResult[]): ItemResult[] {
  const items = results.filter((r) => r.skill === skill && isIndependent(r));
  if (!items.length) return [];
  const last = items[items.length - 1];
  return items.filter((r) => r.at === last.at && r.context === last.context);
}

export function skillMastery(skill: SkillId, results: ItemResult[]): SkillMastery {
  const learning = results.filter((r) => r.skill === skill && isLearning(r));
  const recent = learning.slice(-RECENT_WINDOW);
  const score = average(recent);
  const learningSecure = recent.length >= SECURE_MIN_EVIDENCE && score >= SECURE_THRESHOLD;

  const latest = latestIndependent(skill, results);
  const assessed: IndependentEvidence | null = latest.length
    ? {
        correct: latest.filter((r) => r.correct).length,
        total: latest.length,
        at: latest[0].at,
        context: latest[0].context,
      }
    : null;

  const after = assessed ? learning.filter((r) => r.at > assessed.at).slice(-RECENT_WINDOW) : [];
  const sinceCheck = { count: after.length, score: average(after) };

  let status: SkillStatus;
  if (assessed) {
    if (assessed.correct < assessed.total) status = "needs-review";
    else if (assessed.total >= MASTERY_MIN_INDEPENDENT && learningSecure) status = "mastered";
    else status = "passed-check";
  } else if (learning.length === 0) {
    status = "not-started";
  } else if (learningSecure) {
    status = "secure";
  } else {
    status = "developing";
  }

  return { skill, status, score, evidence: learning.length, recentCount: recent.length, learningSecure, assessed, sinceCheck };
}

export function readyForRecheck(m: SkillMastery): boolean {
  return (
    m.status === "needs-review" &&
    m.sinceCheck.count >= SECURE_MIN_EVIDENCE &&
    m.sinceCheck.score >= SECURE_THRESHOLD
  );
}

/** Results from the most recent completed mastery check only. */
export function latestAssessment(results: ItemResult[]): ItemResult[] {
  const assessment = results.filter((r) => r.context === "assessment");
  if (!assessment.length) return [];
  const lastAt = assessment[assessment.length - 1].at;
  return assessment.filter((r) => r.at === lastAt);
}

export type MisconceptionConfidence = "possible" | "likely";
export type MisconceptionState = "watching" | "improving" | "resolved";

export interface MisconceptionReport {
  id: MisconceptionId;
  timesSeen: number;
  confidence: MisconceptionConfidence;
  state: MisconceptionState;
  lastSeen: number;
}

/**
 * Builds a cautious picture of possible misconceptions. One wrong answer is only
 * ever reported as "possible"; repeated evidence is needed before calling it
 * "likely", and later correct work is needed before calling it "resolved".
 */
export function misconceptionReports(
  results: ItemResult[],
  defs: MisconceptionDef[],
): MisconceptionReport[] {
  const reports: MisconceptionReport[] = [];
  for (const def of defs) {
    const seenIn = results.filter((r) => r.misconceptions.includes(def.id));
    if (!seenIn.length) continue;
    const lastSeen = seenIn[seenIn.length - 1].at;
    const after = results.filter((r) => r.at > lastSeen);
    // MIS-005: success on the question where the misconception showed (or any repeat of it) is not evidence of recovery.
    const original = new Set(seenIn.map((r) => r.questionId));
    const followUpPassed = after.some(
      (r) => r.context === "followup" && r.targets === def.id && r.correct,
    );
    const laterClean = after.filter(
      (r) =>
        r.context !== "followup" &&
        !original.has(r.questionId) &&
        def.skills.includes(r.skill) &&
        r.correct &&
        r.firstTry,
    ).length;

    let state: MisconceptionState = "watching";
    if (laterClean >= 2) state = "resolved";
    else if (followUpPassed || laterClean === 1) state = "improving";

    reports.push({
      id: def.id,
      timesSeen: seenIn.length,
      confidence: seenIn.length >= 2 ? "likely" : "possible",
      state,
      lastSeen,
    });
  }
  return reports.sort((a, b) => b.lastSeen - a.lastSeen);
}
