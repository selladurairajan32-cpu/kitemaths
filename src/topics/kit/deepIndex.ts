import { FRACTIONS2_DEEP } from "@/topics/fractions-2/deep";
import type { DeepLesson } from "./deep";

/** D-055: every deep sub-topic, by topic. */
const DEEP: Record<string, DeepLesson[]> = { "fractions-2": FRACTIONS2_DEEP };

export const deepFor = (topicId: string, lessonId: string): DeepLesson | undefined => DEEP[topicId]?.find((d) => d.lessonId === lessonId);
