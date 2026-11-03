import { createInitialState, hydrateState, hydrateTopic, STATE_VERSION, type AttemptRecord, type LearnerState, type TopicProgress } from "@/engine/progress";
import type { Evaluation, ItemResult } from "@/engine/types";

/**
 * Saved progress from before topics existed (version 1) was all fractions,
 * with bare ids: skills like "compare", questions like "nm-1" or
 * "g:nm-choose:2:123", misconceptions like "part-to-part". Version 2 keeps
 * each topic's progress separately and namespaces every shared id by topic.
 */
export const LEGACY_TOPIC = "fractions";
const P = `${LEGACY_TOPIC}.`;

const skill = (id: string) => (id.startsWith(P) ? id : P + id);
const misconception = skill;
export const legacyQuestionId = (id: string) => {
  if (id.startsWith(`g:${P}`) || id.startsWith(P)) return id;
  return id.startsWith("g:") ? `g:${P}${id.slice(2)}` : P + id;
};

function mapKeys<T>(rec: Record<string, T>, key: (k: string) => string, value: (v: T) => T = (v) => v): Record<string, T> {
  return Object.fromEntries(Object.entries(rec).map(([k, v]) => [key(k), value(v)]));
}

const evaluation = (e: Evaluation): Evaluation => ({ ...e, misconceptions: (e.misconceptions ?? []).map(misconception) });

function attempt<T extends AttemptRecord>(a: T): T {
  return {
    ...a,
    order: a.order.map(legacyQuestionId),
    responses: mapKeys(a.responses ?? {}, legacyQuestionId),
    evaluations: mapKeys(a.evaluations ?? {}, legacyQuestionId, evaluation),
  };
}

function result(r: ItemResult): ItemResult {
  return {
    ...r,
    skill: skill(r.skill),
    questionId: legacyQuestionId(r.questionId),
    misconceptions: (r.misconceptions ?? []).map(misconception),
    ...(r.targets ? { targets: misconception(r.targets) } : {}),
  };
}

function topic(t: TopicProgress): TopicProgress {
  const a = t.assessment;
  return {
    ...t,
    practice: {
      ...t.practice,
      sessionAsked: t.practice.sessionAsked.map(legacyQuestionId),
      current: t.practice.current ? legacyQuestionId(t.practice.current) : null,
      focusSkill: t.practice.focusSkill ? skill(t.practice.focusSkill) : null,
    },
    assessment: {
      ...a,
      order: a.order.map(legacyQuestionId),
      responses: mapKeys(a.responses, legacyQuestionId),
      evaluations: mapKeys(a.evaluations, legacyQuestionId, evaluation),
      ...(a.last ? { last: attempt(a.last) } : {}),
    },
    recheck: t.recheck ? { ...attempt(t.recheck), skill: skill(t.recheck.skill) } : null,
    rechecks: mapKeys(t.rechecks, skill, attempt),
    placement: {
      ...t.placement,
      order: t.placement.order.map(legacyQuestionId),
      correct: t.placement.correct.map(legacyQuestionId),
      wrong: t.placement.wrong.map(legacyQuestionId),
    },
  };
}

/** Turns version-1 saved data into a version-2 learner. Returns null for anything else. */
export function migrateV1(raw: unknown): LearnerState | null {
  if (!raw || typeof raw !== "object" || (raw as { version?: unknown }).version !== 1) return null;
  const data = raw as Record<string, unknown>;
  const fresh = createInitialState();
  const results = Array.isArray(data.results) ? (data.results as ItemResult[]).map(result) : [];
  // Re-run the normal v2 loader so profile and settings get the usual defaults.
  return hydrateState({
    version: STATE_VERSION,
    profile: data.profile ?? fresh.profile,
    settings: data.settings ?? fresh.settings,
    currentTopicId: LEGACY_TOPIC,
    topics: { [LEGACY_TOPIC]: topic(hydrateTopic(data, true)) },
    results,
  });
}
