import { skillMastery } from "./mastery";
import type { ItemResult, QuestionBase, SkillId } from "./types";

export const PRACTICE_SESSION_LENGTH = 10;
/** Every Nth question in a session revisits a skill that is already secure. */
export const REVIEW_EVERY = 4;

export interface SelectionInput<Q extends QuestionBase> {
  questions: Q[];
  skillOrder: SkillId[];
  results: ItemResult[];
  sessionAsked: string[];
  focusSkill?: SkillId | null;
}

export interface Selection<Q extends QuestionBase> {
  question: Q;
  reason: "focus" | "review" | "chosen-skill";
  targetDifficulty: number;
}

export function targetDifficulty(skill: SkillId, results: ItemResult[]): number {
  const history = results.filter(
    (r) => r.skill === skill && r.context === "practice",
  );
  if (!history.length) return 1;
  const last = history[history.length - 1];
  const lastTwo = history.slice(-2);
  const currentLevel = last.difficulty ?? 1;
  if (lastTwo.length === 2 && lastTwo.every((r) => r.firstTry)) {
    return Math.min(3, currentLevel + 1);
  }
  if (!last.firstTry) return Math.max(1, currentLevel - (last.correct ? 0 : 1));
  return currentLevel;
}

function pickInSkill<Q extends QuestionBase>(
  skill: SkillId,
  difficulty: number,
  questions: Q[],
  results: ItemResult[],
  sessionAsked: string[],
): Q | null {
  const candidates = questions.filter(
    (q) => q.skill === skill && !sessionAsked.includes(q.id),
  );
  if (!candidates.length) return null;
  const everSeen = new Set(results.map((r) => r.questionId));
  const lastSeenAt = (id: string) => {
    const hits = results.filter((r) => r.questionId === id);
    return hits.length ? hits[hits.length - 1].at : -1;
  };
  const ranked = [...candidates].sort((a, b) => {
    const seenDiff = Number(everSeen.has(a.id)) - Number(everSeen.has(b.id));
    if (seenDiff !== 0) return seenDiff;
    const diffA = Math.abs(a.difficulty - difficulty);
    const diffB = Math.abs(b.difficulty - difficulty);
    if (diffA !== diffB) return diffA - diffB;
    if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
    const recency = lastSeenAt(a.id) - lastSeenAt(b.id);
    if (recency !== 0) return recency;
    return questions.indexOf(a) - questions.indexOf(b);
  });
  return ranked[0];
}

/**
 * Deterministic adaptive selection: work on the earliest skill that is not yet
 * secure, adjust difficulty from recent first-try success, and interleave a
 * review of a secure skill every few questions.
 */
export function selectNextQuestion<Q extends QuestionBase>(
  input: SelectionInput<Q>,
): Selection<Q> | null {
  const { questions, skillOrder, results, sessionAsked, focusSkill } = input;

  if (focusSkill) {
    const level = targetDifficulty(focusSkill, results);
    const q = pickInSkill(focusSkill, level, questions, results, sessionAsked);
    if (q) return { question: q, reason: "chosen-skill", targetDifficulty: level };
  }

  const status = new Map(skillOrder.map((s) => [s, skillMastery(s, results)]));
  const isStrong = (s: SkillId) => {
    const m = status.get(s)!;
    return m.status === "mastered" || (m.learningSecure && m.status !== "needs-review");
  };

  const position = sessionAsked.length + 1;
  if (position % REVIEW_EVERY === 0) {
    const reviewSkills = skillOrder
      .filter(isStrong)
      .sort((a, b) => lastPractised(a, results) - lastPractised(b, results));
    for (const s of reviewSkills) {
      const level = targetDifficulty(s, results);
      const q = pickInSkill(s, level, questions, results, sessionAsked);
      if (q) return { question: q, reason: "review", targetDifficulty: level };
    }
  }

  const ordered = [
    ...skillOrder.filter((s) => !isStrong(s)),
    ...skillOrder.filter(isStrong),
  ];
  for (const s of ordered) {
    const level = targetDifficulty(s, results);
    const q = pickInSkill(s, level, questions, results, sessionAsked);
    if (q) return { question: q, reason: "focus", targetDifficulty: level };
  }
  return null;
}

function lastPractised(skill: SkillId, results: ItemResult[]): number {
  const hits = results.filter((r) => r.skill === skill);
  return hits.length ? hits[hits.length - 1].at : -1;
}
