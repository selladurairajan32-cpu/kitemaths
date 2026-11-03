import type { Recommendation } from "@/engine/journey";
import type { SkillStatus } from "@/engine/mastery";
import { routes, topicRoutes } from "@/lib/routes";
import type { IconName } from "@/components/paper/PaperIcon";
import type { TopicModule } from "@/topics/types";

/** Child-facing skill labels: encouraging, short, no jargon. */
export const KID_STATUS: Record<SkillStatus, { label: string; cls: string }> = {
  "not-started": { label: "New", cls: "bg-sunk text-muted" },
  developing: { label: "Growing", cls: "bg-sun-soft text-warn" },
  secure: { label: "Strong", cls: "bg-sky-soft text-den-strong" },
  "passed-check": { label: "Strong", cls: "bg-sky-soft text-den-strong" },
  mastered: { label: "Mastered", cls: "bg-ok-soft text-ok" },
  "needs-review": { label: "Let's revisit", cls: "bg-num-soft text-num-strong" },
};

export interface KidNext {
  icon: IconName;
  /** What kind of thing this is, said plainly (shown as the subline, never as a label above the title). */
  kicker: string;
  title: string;
  line: string;
  cta: string;
  href: string;
}

/** Turns the engine's recommendation into something a child wants to tap. */
export function kidNext(rec: Recommendation, topic: TopicModule): KidNext {
  const links = topicRoutes(rec.topicId);
  switch (rec.kind) {
    case "lesson":
      return {
        icon: topic.lessonLook(rec.lessonId).icon,
        kicker: rec.resume ? "Your lesson so far" : "Your next lesson",
        title: rec.title,
        line: rec.resume ? "You're part of the way through. Pick up where you stopped." : "A short lesson with pictures, a puzzle and a quick question at the end.",
        cta: rec.resume ? "Carry on" : "Start the lesson",
        href: links.lesson(rec.lessonId),
      };
    case "practice":
      return {
        icon: "target",
        kicker: "Practice",
        title: rec.focusSkill ? rec.title.replace(/^(Practise|Strengthen): /, "") : "Mixed practice",
        line: "Ten questions that get harder as you get stronger. Each one earns stars.",
        cta: "Play ten questions",
        href: links.practice(rec.focusSkill),
      };
    case "assessment":
      return {
        icon: "trophy",
        kicker: "The big challenge",
        title: rec.resume ? "Finish the big challenge" : "The big challenge",
        line: "Questions on every skill, on your own, with no hints.",
        cta: rec.resume ? "Carry on" : "Start the challenge",
        href: links.check(),
      };
    case "recheck":
      return {
        icon: "recheck",
        kicker: "A quick recheck",
        title: rec.title.replace(/^(Finish your recheck|Recheck): /, ""),
        line: "Two questions to show you have it now.",
        cta: rec.resume ? "Carry on" : "Start the recheck",
        href: links.recheck(rec.skill),
      };
    case "results":
      return {
        icon: "kite",
        kicker: "Island complete",
        title: `${topic.title}: mastered`,
        line: "Keep your skills sharp with practice, or build in the lab.",
        cta: "See my kites",
        href: routes.badges(),
      };
  }
}
