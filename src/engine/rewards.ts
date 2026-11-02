import { skillMastery } from "./mastery";
import type { LearnerState } from "./progress";
import type { ItemResult, Skill } from "./types";

/**
 * Rewards are derived from the learner's history, never stored. That keeps
 * them honest (no double-awarding), and old saved progress earns its stars too.
 *
 * Stars reward effort as well as accuracy: getting there with help still earns
 * stars, so children are never punished for asking for a hint.
 */
export function starsForResult(r: ItemResult): number {
  switch (r.context) {
    case "practice":
    case "lesson":
      return r.correct ? (r.firstTry ? 3 : 2) : 1;
    case "followup":
      return r.correct ? 1 : 0;
    case "assessment":
    case "recheck":
      return r.correct ? 2 : 1;
    case "placement":
      return r.correct ? 1 : 0;
  }
}

export const STARS = { lesson: 10, lab: 5, check: 20 } as const;

export function totalStars(state: LearnerState): number {
  const answers = state.results.reduce((n, r) => n + starsForResult(r), 0);
  const lessons = Object.values(state.lessons).filter((l) => l.completed && !l.placedOut).length * STARS.lesson;
  const lab = state.labChallenges.length * STARS.lab;
  const checks = state.assessment.timesCompleted * STARS.check;
  return answers + lessons + lab + checks;
}

export interface Level {
  level: number;
  /** Stars earned inside the current level. */
  into: number;
  /** Stars this level needs in total. */
  needed: number;
  title: string;
}

const LEVEL_TITLES = ["Ground crew", "Breeze rider", "Cloud hopper", "Sky climber", "Wind whisperer", "Rainbow flyer", "Star chaser", "Sky captain"];

/** Each level needs a few more stars than the last: 40, 60, 80… */
export function levelFor(stars: number): Level {
  let level = 1;
  let needed = 40;
  let left = stars;
  while (left >= needed) {
    left -= needed;
    level++;
    needed += 20;
  }
  return { level, into: left, needed, title: LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length) - 1] };
}

export function dayKey(at: number): string {
  const d = new Date(at);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function shiftDay(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number);
  return dayKey(new Date(y, m - 1, d + days, 12).getTime());
}

export function activeDays(state: LearnerState): Set<string> {
  const days = new Set<string>();
  for (const r of state.results) if (r.at > 0) days.add(dayKey(r.at));
  for (const l of Object.values(state.lessons)) if (l.completedAt && !l.placedOut) days.add(dayKey(l.completedAt));
  return days;
}

export interface Streak {
  /** Consecutive days learning, ending today (or yesterday, if today isn't done yet). */
  current: number;
  best: number;
  activeToday: boolean;
}

export function streakFor(state: LearnerState, now: number): Streak {
  const days = activeDays(state);
  const today = dayKey(now);
  const activeToday = days.has(today);
  let cursor = activeToday ? today : shiftDay(today, -1);
  let current = 0;
  while (days.has(cursor)) {
    current++;
    cursor = shiftDay(cursor, -1);
  }
  let best = 0;
  for (const d of days) {
    if (days.has(shiftDay(d, -1))) continue;
    let run = 0;
    let c = d;
    while (days.has(c)) {
      run++;
      c = shiftDay(c, 1);
    }
    best = Math.max(best, run);
  }
  return { current, best, activeToday };
}

export const DAILY_GOAL = 10;

/** Questions answered today (quick follow-up checks don't count separately). */
export function answeredToday(state: LearnerState, now: number): number {
  const today = dayKey(now);
  return state.results.filter((r) => r.context !== "followup" && r.at > 0 && dayKey(r.at) === today).length;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  /** 0–1 progress towards the badge, for ones not yet earned. */
  progress: number;
}

function longestFirstTryRun(results: ItemResult[]): number {
  let best = 0;
  let run = 0;
  for (const r of results) {
    if (r.context !== "practice" && r.context !== "lesson") continue;
    run = r.correct && r.firstTry ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return best;
}

export function badgesFor(state: LearnerState, skills: Skill[], lessonCount: number, now: number): Badge[] {
  const answered = state.results.filter((r) => r.context !== "followup").length;
  const lessonsDone = Object.values(state.lessons).filter((l) => l.completed).length;
  const streak = streakFor(state, now);
  const run = longestFirstTryRun(state.results);
  const comeback = state.results.some(
    (r) => (r.context === "practice" || r.context === "lesson") && r.correct && !r.firstTry && r.attempts > 1,
  ) || state.results.some((r) => r.context === "followup" && r.correct);
  const days = activeDays(state);
  const goalDays = [...days].filter((d) => state.results.filter((r) => r.context !== "followup" && dayKey(r.at) === d).length >= DAILY_GOAL).length;
  const ratio = (n: number, of: number) => Math.min(1, n / of);

  const badges: Omit<Badge, "earned">[] = [
    { id: "first-flight", title: "First flight", description: "Answer your first question.", icon: "🪁", progress: ratio(answered, 1) },
    { id: "lesson-1", title: "Lesson learner", description: "Finish a lesson.", icon: "📘", progress: ratio(lessonsDone, 1) },
    { id: "comeback", title: "Never give up", description: "Fix a mistake and get it right.", icon: "💪", progress: comeback ? 1 : 0 },
    { id: "hot-streak", title: "Hot streak", description: "Get 5 right first time in a row.", icon: "🔥", progress: ratio(run, 5) },
    { id: "goal", title: "Daily hero", description: `Answer ${DAILY_GOAL} questions in one day.`, icon: "🎯", progress: goalDays ? 1 : ratio(answeredToday(state, now), DAILY_GOAL) },
    { id: "streak-3", title: "Three in a row", description: "Learn 3 days in a row.", icon: "📅", progress: ratio(streak.best, 3) },
    { id: "lab", title: "Lab explorer", description: "Complete 3 lab challenges.", icon: "🧪", progress: ratio(state.labChallenges.length, 3) },
    { id: "century", title: "Century", description: "Answer 100 questions.", icon: "💯", progress: ratio(answered, 100) },
    { id: "all-lessons", title: "Sky scholar", description: "Finish every lesson.", icon: "🎓", progress: ratio(lessonsDone, lessonCount) },
    { id: "streak-7", title: "Super week", description: "Learn 7 days in a row.", icon: "🌈", progress: ratio(streak.best, 7) },
    { id: "check", title: "Show what you know", description: "Complete the big check.", icon: "🏆", progress: state.assessment.timesCompleted > 0 ? 1 : 0 },
    ...skills.map((s) => {
      const status = skillMastery(s.id, state.results).status;
      const p = status === "mastered" ? 1 : status === "passed-check" || status === "secure" ? 0.66 : status === "developing" ? 0.33 : 0;
      return { id: `skill:${s.id}`, title: `${s.title} star`, description: `Master “${s.title}”.`, icon: "⭐", progress: p };
    }),
  ];
  return badges.map((b) => ({ ...b, earned: b.progress >= 1 }));
}
