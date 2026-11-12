import type { TopicDefinition } from "./journey";
import { lessonsEvidenced } from "./journey";
import { skillMastery, type SkillStatus } from "./mastery";
import type { LearnerState, TopicLearner } from "./progress";
import { JOURNEY_STAGES, type JourneyProgress } from "./topicJourney";
import type { ItemResult } from "./types";

/**
 * D-043 step 3: what the kid pages (Home, Topics, Practice, Tests, Progress) show, from the existing evidence. Pure, and
 * no new thresholds: every count comes from `skillMastery` (MAST-001) and lesson evidence (CUR-002 §4).
 */

/** Skills of one topic by mastery status, and its lessons with independent evidence. */
export interface TopicOverview {
  topicId: string;
  skills: number;
  /** Skills by status: "mastered", then "on the way" (secure in practice or passed a check), then developing. */
  mastered: number;
  onTheWay: number;
  developing: number;
  needsReview: number;
  lessons: number;
  lessonsDone: number;
  /** Any answer, or a lesson done, in this topic. */
  started: boolean;
}

const ON_THE_WAY: ReadonlySet<SkillStatus> = new Set(["secure", "passed-check"]);

export function topicOverview(topic: TopicDefinition, state: TopicLearner): TopicOverview {
  const statuses = topic.skills.map((s) => skillMastery(s.id, state.results).status);
  const count = (f: (s: SkillStatus) => boolean) => statuses.filter(f).length;
  const skillIds = new Set(topic.skills.map((s) => s.id));
  return {
    topicId: topic.id,
    skills: topic.skills.length,
    mastered: count((s) => s === "mastered"),
    onTheWay: count((s) => ON_THE_WAY.has(s)),
    developing: count((s) => s === "developing"),
    needsReview: count((s) => s === "needs-review"),
    lessons: topic.lessons.length,
    lessonsDone: lessonsEvidenced(topic, state),
    started: state.results.some((r) => skillIds.has(r.skill)) || Object.keys(state.lessons).length > 0,
  };
}

/** The mastery ring: every skill across the given topics, by status. */
export interface MasterySummary {
  skills: number;
  mastered: number;
  onTheWay: number;
  developing: number;
  needsReview: number;
}

export function masterySummary(topics: TopicOverview[]): MasterySummary {
  const sum = (f: (t: TopicOverview) => number) => topics.reduce((n, t) => n + f(t), 0);
  return {
    skills: sum((t) => t.skills),
    mastered: sum((t) => t.mastered),
    onTheWay: sum((t) => t.onTheWay),
    developing: sum((t) => t.developing),
    needsReview: sum((t) => t.needsReview),
  };
}

/** One saved topic journey and when the child last worked in it. */
export interface JourneyActivity {
  key: string;
  progress: JourneyProgress;
  /** The later of its start and the child's last answer on its skill since then. */
  lastAt: number;
  done: boolean;
}

export const journeyDone = (p: JourneyProgress) => p.reached >= JOURNEY_STAGES.length - 1;

/**
 * Continue Learning: the unfinished journey the child worked in last. A journey's last activity is its start or the last
 * answer on its skill after that, so going back to an older journey brings it to the front. `skillOf` maps a journey key
 * ("<topic>/<concept>") to its skill; keys it does not know are ignored.
 */
export function latestJourney(state: Pick<LearnerState, "journeys" | "results">, skillOf: (key: string) => string | undefined): JourneyActivity | null {
  let best: JourneyActivity | null = null;
  for (const [key, progress] of Object.entries(state.journeys ?? {})) {
    const skill = skillOf(key);
    if (!skill || journeyDone(progress)) continue;
    let lastAt = progress.startedAt;
    for (const r of state.results) if (r.skill === skill && r.at >= progress.startedAt && r.at > lastAt) lastAt = r.at;
    if (!best || lastAt > best.lastAt) best = { key, progress, lastAt, done: false };
  }
  return best;
}

/** A practice mock, from stored answers: one per session, oldest first (EXAM-005). */
export interface MockSession {
  session: string;
  at: number;
  total: number;
  correct: number;
}

export function mockSessions(results: ItemResult[]): MockSession[] {
  const by = new Map<string, ItemResult[]>();
  for (const r of results.filter((x) => x.mock)) {
    if (!by.has(r.mock!.session)) by.set(r.mock!.session, []);
    by.get(r.mock!.session)!.push(r);
  }
  return [...by.entries()]
    .map(([session, rs]) => ({ session, at: Math.min(...rs.map((r) => r.at)), total: rs[0].mock!.total, correct: rs.filter((r) => r.correct).length }))
    .sort((a, b) => a.at - b.at);
}
