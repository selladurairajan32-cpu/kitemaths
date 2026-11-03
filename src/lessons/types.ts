import type { Phase } from "@/engine/types";

/**
 * Lesson structure shared by every topic. `V` is the topic's own picture
 * description (rendered by the topic's `Visual` component) and `L` the extra
 * fields its lab steps need (rendered by the topic's `LabStep`).
 */

export interface NumericTrap {
  value: number;
  misconception?: string;
  feedback: string;
}

export interface WorkedBlank<V = unknown> {
  prompt: string;
  answer: number;
  hint: string;
  traps?: NumericTrap[];
  support?: V;
  worked: string;
}

export interface WorkedStep<V = unknown> {
  text: string;
  visual?: V;
  /** When present the learner must supply this value before the step is complete. */
  blank?: WorkedBlank<V>;
}

export type LessonStep<V = unknown, L = unknown> =
  | { type: "explain"; title: string; body: string[]; visual?: V; tip?: string }
  | {
      type: "worked";
      title: string;
      /** full = "watch me", faded = "let's do it together". */
      support: "full" | "faded";
      problem: string;
      visual?: V;
      steps: WorkedStep<V>[];
      conclusion: string;
    }
  | { type: "check"; title: string; questionId: string; intro?: string }
  | ({ type: "lab"; title: string; body: string[] } & L);

export interface Lesson<V = unknown, L = unknown> {
  id: string;
  title: string;
  phase: Phase;
  summary: string;
  minutes: number;
  objectives: string[];
  steps: LessonStep<V, L>[];
}
