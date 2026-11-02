import type { Recommendation } from "@/engine/journey";
import type { SkillStatus } from "@/engine/mastery";
import { routes } from "@/lib/routes";

/** Child-facing skill labels: encouraging, short, no jargon. */
export const KID_STATUS: Record<SkillStatus, { label: string; cls: string }> = {
  "not-started": { label: "New", cls: "bg-sunk text-muted" },
  developing: { label: "Growing", cls: "bg-sun-soft text-warn" },
  secure: { label: "Strong", cls: "bg-sky-soft text-den-strong" },
  "passed-check": { label: "Strong", cls: "bg-sky-soft text-den-strong" },
  mastered: { label: "Mastered", cls: "bg-ok-soft text-ok" },
  "needs-review": { label: "Let's revisit", cls: "bg-num-soft text-num-strong" },
};

/** A look for each lesson on the sky map. */
export const LESSON_LOOK: Record<string, { emoji: string; color: string; soft: string }> = {
  wholes: { emoji: "🍕", color: "#ff6a45", soft: "#ffe7df" },
  naming: { emoji: "🔢", color: "#2f74ff", soft: "#e2ecff" },
  lab: { emoji: "🎨", color: "#ff4f9a", soft: "#ffe3f0" },
  comparing: { emoji: "⚖️", color: "#6a4cff", soft: "#ece7ff" },
  equivalent: { emoji: "🧩", color: "#1fbfae", soft: "#d8f7f3" },
  "number-line": { emoji: "📏", color: "#f0a800", soft: "#fff5cf" },
  amounts: { emoji: "🍬", color: "#22c174", soft: "#d9f7e8" },
  reasoning: { emoji: "🕵️", color: "#7a4ff0", soft: "#efe8ff" },
};

export const lessonLook = (id: string) => LESSON_LOOK[id] ?? { emoji: "⭐", color: "#6a4cff", soft: "#ece7ff" };

export interface KidNext {
  emoji: string;
  kicker: string;
  title: string;
  line: string;
  cta: string;
  href: string;
}

/** Turns the engine's recommendation into something a child wants to tap. */
export function kidNext(rec: Recommendation): KidNext {
  switch (rec.kind) {
    case "lesson":
      return {
        emoji: lessonLook(rec.lessonId).emoji,
        kicker: rec.resume ? "Keep going" : "Next adventure",
        title: rec.title,
        line: rec.resume ? "You're part-way through — let's finish it!" : "A short lesson with pictures, puzzles and a quick challenge.",
        cta: rec.resume ? "Keep going" : "Let's go!",
        href: routes.lesson(rec.lessonId),
      };
    case "practice":
      return {
        emoji: "🎯",
        kicker: "Practice time",
        title: rec.focusSkill ? rec.title.replace(/^(Practise|Strengthen): /, "Power up: ") : "Fraction challenge",
        line: "10 questions that get trickier as you get stronger. Collect stars!",
        cta: "Play",
        href: routes.practice(rec.focusSkill),
      };
    case "assessment":
      return {
        emoji: "🏆",
        kicker: "Big challenge",
        title: rec.resume ? "Finish your big challenge" : "Show what you know!",
        line: "Answer on your own — no hints. Do your best thinking!",
        cta: rec.resume ? "Carry on" : "I'm ready",
        href: routes.assessment(),
      };
    case "recheck":
      return {
        emoji: "🔁",
        kicker: "Quick recheck",
        title: rec.title.replace(/^(Finish your recheck|Recheck): /, ""),
        line: "Two quick questions to show you've got it now.",
        cta: rec.resume ? "Carry on" : "Try it",
        href: routes.recheck(rec.skill),
      };
    case "results":
      return {
        emoji: "🌈",
        kicker: "Amazing!",
        title: "You've mastered fractions foundations!",
        line: "Keep your skills sharp with practice, or play in the lab.",
        cta: "See my badges",
        href: routes.badges(),
      };
  }
}
