/**
 * The weekly learning plan (PARENT-003). Pure: built from stored evidence and the grown-up's chosen workload.
 *
 * Each day mixes, from the evidence: spaced review (skills the latest check flagged, facts due again), new learning (the
 * next lesson), times-table facts, mental maths and application. No day goes over the minutes chosen. Lesson minutes
 * come from the lessons themselves; practice sessions use the estimates below, which are stated as estimates.
 */
import { factStates } from "@/engine/facts";
import { recommendNext, reviewSkills } from "@/engine/journey";
import { topicLearner, type LearnerState } from "@/engine/progress";
import { topicRoutes } from "@/lib/routes";
import { topicById } from "./index";
import { activeTopic, startedTopics } from "./recommend";

/** Estimated minutes for a practice session (not measured; for planning only). */
export const ESTIMATED_MINUTES = { practice: 8, facts: 5, mental: 8, application: 10 } as const;
export const PLAN_LIMITS = { days: [3, 7], minutes: [10, 30] } as const;

export type PlanKind = "review" | "new" | "facts" | "mental" | "application";
export interface PlanItem {
  kind: PlanKind;
  title: string;
  minutes: number;
  href: string;
  /** The evidence behind the choice, in words a grown-up can check. */
  why: string;
}
export interface PlanDay {
  label: string;
  items: PlanItem[];
  minutes: number;
}

export const PLAN_KIND_LABEL: Record<PlanKind, string> = {
  review: "Review",
  new: "New learning",
  facts: "Times tables",
  mental: "Mental maths",
  application: "Problem solving",
};

/** The candidate activities for the week, from the evidence, most needed first. */
export function planCandidates(state: LearnerState, now: number): PlanItem[] {
  const items: PlanItem[] = [];
  for (const t of startedTopics(state)) {
    const tl = topicLearner(state, t.id);
    for (const skill of reviewSkills(t, tl).slice(0, 2)) {
      items.push({
        kind: "review",
        title: `Practise ${t.skillById(skill).title}`,
        minutes: ESTIMATED_MINUTES.practice,
        href: topicRoutes(t.id).practice(skill),
        why: `The latest check on ${t.title} showed this skill needs another look.`,
      });
    }
  }
  const active = activeTopic(state);
  const rec = recommendNext(active, topicLearner(state, active.id));
  if (rec.kind === "lesson") {
    const lesson = active.lessons.find((l) => l.id === rec.lessonId)!;
    items.push({ kind: "new", title: `${active.title}: ${lesson.title}`, minutes: lesson.minutes, href: topicRoutes(active.id).lesson(lesson.id), why: rec.parentReason });
  } else if (rec.kind === "practice") {
    items.push({ kind: "new", title: `${active.title}: ${rec.title}`, minutes: ESTIMATED_MINUTES.practice, href: topicRoutes(active.id).practice(rec.focusSkill), why: rec.parentReason });
  }
  const facts = factStates(state.results);
  const due = facts.filter((f) => f.status !== "unseen" && f.dueAt !== null && f.dueAt <= now).length;
  const notKnown = facts.filter((f) => f.status !== "known").length;
  if (notKnown > 0 || due > 0) {
    items.push({
      kind: "facts",
      title: "Times-table facts",
      minutes: ESTIMATED_MINUTES.facts,
      href: topicRoutes("times-tables").factsRun("practice"),
      why: due > 0 ? `${due} known fact${due === 1 ? " is" : "s are"} due for review, and ${notKnown} of 66 facts aren't known yet.` : `${notKnown} of 66 facts aren't known yet.`,
    });
  }
  if (topicById("mental-maths")) {
    items.push({ kind: "mental", title: "Mental maths practice", minutes: ESTIMATED_MINUTES.mental, href: topicRoutes("mental-maths").practice(), why: "Mental strategies support every other area; a little often keeps them ready." });
  }
  const year = state.profile.year;
  const mock = year !== null && year >= 5 && topicById("mock-exams");
  items.push(
    mock
      ? { kind: "application", title: "A short practice mock", minutes: ESTIMATED_MINUTES.application, href: topicRoutes("mock-exams").mock(), why: `In Year ${year}, a short mock practises using skills together under exam-style conditions.` }
      : { kind: "application", title: "Problem solving", minutes: ESTIMATED_MINUTES.application, href: topicRoutes("problem-solving").practice(), why: "Applying skills to word problems and several steps at once." },
  );
  return items;
}

/**
 * PARENT-003: spreads the candidates over the chosen days. Review goes first on each day it appears; the other kinds
 * take turns so the week has a mix. A day never goes over `minutes`; an item longer than a whole day is skipped.
 */
export function weeklyPlan(state: LearnerState, now: number, days: number, minutes: number): PlanDay[] {
  const d = Math.min(PLAN_LIMITS.days[1], Math.max(PLAN_LIMITS.days[0], Math.round(days)));
  const m = Math.min(PLAN_LIMITS.minutes[1], Math.max(PLAN_LIMITS.minutes[0], Math.round(minutes)));
  const candidates = planCandidates(state, now).filter((c) => c.minutes <= m);
  const review = candidates.filter((c) => c.kind === "review");
  const others = candidates.filter((c) => c.kind !== "review");
  const out: PlanDay[] = [];
  let turn = 0;
  for (let i = 0; i < d; i++) {
    const items: PlanItem[] = [];
    let used = 0;
    const add = (c: PlanItem) => {
      if (used + c.minutes > m || items.includes(c)) return false;
      items.push(c);
      used += c.minutes;
      return true;
    };
    // Spaced review: on alternate days, so a flagged skill comes back more than once in the week.
    if (review.length && i % 2 === 0) add(review[(i / 2) % review.length]);
    for (let tries = 0; tries < others.length; tries++) {
      add(others[(turn + tries) % others.length]);
      if (used >= m) break;
    }
    turn = (turn + 1) % Math.max(1, others.length);
    out.push({ label: `Day ${i + 1}`, items, minutes: used });
  }
  return out;
}

export interface WeekSummary {
  daysActive: number;
  answers: number;
  /** Minutes on questions, from each answer's recorded time (question shown to last answer); null if none recorded. */
  minutesOnQuestions: number | null;
  /** How many of the answers had a recorded time. */
  timedAnswers: number;
  islands: string[];
  /** Skills the latest check flagged, as "Island: skill". */
  support: string[];
}

/**
 * PARENT-002: the last 7 days. Activity and time come only from stored answers; time spent reading lessons isn't
 * recorded, so it isn't counted. No ranking and no prediction.
 */
export function weekSummary(state: LearnerState, now: number): WeekSummary {
  const from = now - 7 * 86_400_000;
  const week = state.results.filter((r) => r.at >= from && r.at < now && r.context !== "followup");
  const timed = week.filter((r) => typeof r.durationMs === "number");
  const ms = timed.reduce((n, r) => n + (r.durationMs ?? 0), 0);
  const day = (t: number) => new Date(t).toISOString().slice(0, 10);
  const islands = [...new Set(week.map((r) => r.skill.split(".")[0]))].map((id) => topicById(id)?.title ?? id);
  const support = startedTopics(state).flatMap((t) => reviewSkills(t, topicLearner(state, t.id)).map((s) => `${t.title}: ${t.skillById(s).title}`));
  return {
    daysActive: new Set(week.map((r) => day(r.at))).size,
    answers: week.length,
    minutesOnQuestions: timed.length ? Math.round(ms / 60_000) : null,
    timedAnswers: timed.length,
    islands,
    support,
  };
}
