import type { ItemResult } from "./types";

/**
 * D-043: the topic journey, one concept learned in five stages: Learn (watch, step through or try it), Practise,
 * Apply, Check understanding (the MAST-001 recheck) and Complete. Pure: the screens keep a `JourneyProgress` per concept
 * in the learner's saved state and ask these functions what is open and what is done.
 */

export const JOURNEY_STAGES = ["learn", "practise", "apply", "check", "complete"] as const;
export type JourneyStage = (typeof JOURNEY_STAGES)[number];
export type Strand = "concept" | "application" | "reasoning";

export interface JourneyProgress {
  /** The stage on screen. */
  stage: number;
  /** The furthest stage unlocked; every stage up to it can be revisited. */
  reached: number;
  /** When this journey was started: question seeds, and which answers belong to it. */
  startedAt: number;
  /** Practise and Apply questions finished, in order. */
  practised: number;
  applied: number;
}

export const startJourney = (at: number): JourneyProgress => ({ stage: 0, reached: 0, startedAt: at, practised: 0, applied: 0 });

/** Opens a stage, if it is unlocked. */
export function openStage(p: JourneyProgress, stage: number): JourneyProgress {
  return stage >= 0 && stage <= p.reached ? { ...p, stage } : p;
}

/** Finishes the current stage: unlocks the next and moves to it. */
export function finishStage(p: JourneyProgress): JourneyProgress {
  const next = Math.min(p.stage + 1, JOURNEY_STAGES.length - 1);
  return { ...p, stage: next, reached: Math.max(p.reached, next) };
}

export const countPractised = (p: JourneyProgress) => ({ ...p, practised: p.practised + 1 });
export const countApplied = (p: JourneyProgress) => ({ ...p, applied: p.applied + 1 });

/** The template key of a generated question id, "g:<topic>.<key>:<difficulty>:<seed>". */
export function templateKey(questionId: string): string | null {
  const m = questionId.match(/^g:[^.]+\.([^:]+):/);
  return m ? m[1]! : null;
}

/**
 * How the child did on each strand in this journey: answers since it started, grouped by the strand of the question
 * maker that made them. Right first time without a hint counts as right.
 */
export function strandSummary(results: ItemResult[], skill: string, strands: Record<string, Strand>, since: number): Partial<Record<Strand, { right: number; total: number }>> {
  const out: Partial<Record<Strand, { right: number; total: number }>> = {};
  for (const r of results) {
    if (r.skill !== skill || r.at < since) continue;
    const key = templateKey(r.questionId);
    const strand = key ? strands[key] : undefined;
    if (!strand) continue;
    const s = (out[strand] ??= { right: 0, total: 0 });
    s.total++;
    if (r.correct && r.firstTry && r.hintsUsed === 0) s.right++;
  }
  return out;
}
