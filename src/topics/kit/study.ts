import type { Lesson } from "@/lessons/types";
import type { SkillId } from "@/engine/types";

/**
 * D-054 pilot: the topic learning page. A topic is read as a list of sub-topics (its lessons, in teaching order), with a
 * practice stop after every few, and one topic test at the end. Pure data: the screen decides how to show it.
 */

export type StudyItem =
  | { kind: "sub"; part: string; lesson: Lesson; skill: SkillId | null; number: number }
  | { kind: "practice"; part: string; number: number; lessons: Lesson[]; skills: SkillId[] }
  | { kind: "test"; part: "test" };

/** Teaching order and practice stops, per topic. Only the pilot topic has a plan so far. */
const GROUPS: Record<string, string[][]> = {
  "fractions-2": [
    ["simplify", "mixed"],
    ["add-same", "add-related", "add-different"],
    ["multiply", "times-fractions", "divide-fractions"],
  ],
};

export const hasStudyPlan = (topicId: string) => topicId in GROUPS;

interface StudyTopic {
  id: string;
  lessons: Lesson[];
  skills: { id: SkillId; lessonId?: string }[];
}

/** The sub-topics, practice stops and test of a topic, in order; empty if the topic has no plan yet. */
export function studyPlan(topic: StudyTopic): StudyItem[] {
  const groups = GROUPS[topic.id];
  if (!groups) return [];
  const items: StudyItem[] = [];
  let number = 0;
  groups.forEach((group, g) => {
    const lessons = group.map((id) => {
      const lesson = topic.lessons.find((l) => l.id === id);
      if (!lesson) throw new Error(`Study plan for ${topic.id} names an unknown lesson ${id}`);
      return lesson;
    });
    const skills: SkillId[] = [];
    for (const lesson of lessons) {
      const skill = topic.skills.find((s) => s.lessonId === lesson.id)?.id ?? null;
      if (skill) skills.push(skill);
      items.push({ kind: "sub", part: lesson.id, lesson, skill, number: ++number });
    }
    items.push({ kind: "practice", part: `practice-${g + 1}`, number: g + 1, lessons, skills });
  });
  items.push({ kind: "test", part: "test" });
  return items;
}

/** A sub-topic's pages: one per lesson step, then a summary. */
export function studyPages(lesson: Lesson): { label: string; step: number | null }[] {
  const label = (type: Lesson["steps"][number]["type"], i: number) => {
    if (type === "explain") return "Understand";
    if (type === "lab") return "See it";
    if (type === "worked") return lesson.steps.slice(0, i).some((s) => s.type === "worked") ? "Together" : "Example";
    return lesson.steps.slice(0, i).some((s) => s.type === "check") ? "One more" : "Your turn";
  };
  return [...lesson.steps.map((s, i) => ({ label: label(s.type, i), step: i })), { label: "Remember", step: null }];
}
