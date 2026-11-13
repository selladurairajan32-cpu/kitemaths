"use client";

import type { CanvasLesson } from "@/components/canvas/lesson";
import { ADD_DIFFERENT_LESSON } from "@/topics/fractions-2/canvas/AddDifferentLesson";

/** D-060: the concepts taught on the lesson canvas, keyed "<topic>/<concept>" (those with `canvas` in `journeys.ts`). */
const LESSONS: Record<string, CanvasLesson> = {
  "fractions-2/add-different": ADD_DIFFERENT_LESSON,
};

export const canvasLessonFor = (topicId: string, concept: string): CanvasLesson | undefined => LESSONS[`${topicId}/${concept}`];
