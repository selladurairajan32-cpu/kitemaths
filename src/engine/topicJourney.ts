import type { ItemResult } from "./types";

/**
 * D-043: the topic journey, one concept learned in five stages: Learn (watch, step through or try it), Practise,
 * Apply, Check understanding (the MAST-001 recheck) and Complete. Pure: the screens keep a `JourneyProgress` per concept
 * in the learner's saved state and ask these functions what is open and what is done.
 */

export const JOURNEY_STAGES = ["learn", "practise", "apply", "check", "complete"] as const;
export type JourneyStage = (typeof JOURNEY_STAGES)[number];
/** What each stage is called on screen: the journey bar, and Continue Learning on Home (D-043 step 3). */
export const STAGE_LABEL: Record<JourneyStage, string> = { learn: "Learn", practise: "Practise", apply: "Apply", check: "Check", complete: "Complete" };
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
  /** D-060 lesson canvas: the step inside Learn (0 Discover, 1 Explore, 2 Understand). Optional: older saves have none. */
  learn?: number;
  /** D-060: the furthest Learn step reached, so going back to an earlier step keeps the later ones open. */
  learnReached?: number;
  /** D-060: what the child guessed in Discover, before any teaching, to look back on at the end. */
  guess?: string;
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

/**
 * D-060: the lesson canvas shows one concept in six phases. They sit on the five saved stages, so a journey started in
 * the older layout carries on in the same place: Learn holds Discover, Explore and Understand (`learn` 0 to 2), then
 * Practise, Apply and Prove (the Check stage). Phase 6 is the summary.
 */
export const CANVAS_PHASES = ["discover", "explore", "understand", "practise", "apply", "prove"] as const;
export type CanvasPhase = (typeof CANVAS_PHASES)[number];
export const CANVAS_LABEL: Record<CanvasPhase, string> = { discover: "Discover", explore: "Explore", understand: "Understand", practise: "Practise", apply: "Apply", prove: "Prove it" };
const LEARN_STEPS = 3;
const clampLearn = (n: number | undefined) => Math.min(Math.max(Math.trunc(n ?? 0) || 0, 0), LEARN_STEPS - 1);

/** The phase on screen, 0 to 5, or 6 for the summary. */
export function canvasPhase(p: JourneyProgress): number {
  return p.stage === 0 ? clampLearn(p.learn) : p.stage + LEARN_STEPS - 1;
}

/** The furthest phase unlocked. A learner past Learn has every Learn step open. */
export function canvasReached(p: JourneyProgress): number {
  return p.reached === 0 ? Math.max(clampLearn(p.learn), clampLearn(p.learnReached)) : p.reached + LEARN_STEPS - 1;
}

/** Opens a phase, if it is unlocked. Inside Learn the furthest step reached is kept. */
export function openCanvasPhase(p: JourneyProgress, phase: number): JourneyProgress {
  if (!Number.isInteger(phase) || phase < 0 || phase > canvasReached(p)) return p;
  if (phase >= LEARN_STEPS) return { ...p, stage: phase - LEARN_STEPS + 1 };
  return { ...p, stage: 0, learn: phase };
}

/** Finishes the phase on screen: the next Learn step, or the next stage. */
export function finishCanvasPhase(p: JourneyProgress): JourneyProgress {
  if (p.stage === 0 && clampLearn(p.learn) < LEARN_STEPS - 1) {
    const learn = clampLearn(p.learn) + 1;
    return { ...p, learn, learnReached: Math.max(learn, clampLearn(p.learnReached)) };
  }
  return finishStage(p);
}

/**
 * D-060, pace by evidence: how many Practise questions count as done after an answer. Two answers in a row right first
 * time without a hint show the level is secure, so the rest of that level's concept questions are passed over. A
 * reasoning or application question is never passed over, and nothing is skipped at the last level, so every child
 * meets the hardest questions and explains the idea at least once.
 */
export function paceAfterAnswer(list: { key: string; level?: string }[], strands: Record<string, Strand>, done: number, streak: number): number {
  const next = done + 1;
  const level = list[done]?.level;
  if (streak < 2 || !level || !list.slice(next).some((q) => q.level !== level)) return Math.min(next, list.length);
  let i = next;
  while (i < list.length && list[i]!.level === level && strands[list[i]!.key] === "concept") i++;
  return i;
}

/** Answers in a row, newest first, that were right first time without a hint: the evidence `paceAfterAnswer` uses. */
export function cleanStreak(results: ItemResult[], skill: string, since: number): number {
  let n = 0;
  for (let i = results.length - 1; i >= 0; i--) {
    const r = results[i]!;
    if (r.skill !== skill || r.context !== "practice") continue;
    if (r.at < since || !(r.correct && r.firstTry && r.hintsUsed === 0)) break;
    n++;
  }
  return n;
}
