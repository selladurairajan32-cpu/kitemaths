"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { LessonStep } from "@/lessons/types";
import type { LabStepProps } from "@/topics/types";
import type { KitLab } from "./types";

/**
 * Animated explainers for kit islands (ANIM-001). A lab step names one with `explainer`; a misconception can name one
 * as its "Explain it differently" picture. Each is loaded only when shown, so other pages don't carry the code.
 */
const Loading = () => <div className="min-h-[24rem] animate-pulse rounded-[22px] bg-sunk" aria-hidden />;

const LABS: Record<string, ComponentType<LabStepProps>> = {
  "long-multiplication-watch": dynamic(() => import("@/topics/multiply-divide/explain/LongMultiplicationLab").then((m) => m.LongMultiplicationWatch), { loading: Loading }),
  "long-multiplication-try": dynamic(() => import("@/topics/multiply-divide/explain/LongMultiplicationLab").then((m) => m.LongMultiplicationTry), { loading: Loading }),
  // D-040: a short lesson step that previews and opens the 3D ratio explanation.
  "ratio-3d": dynamic(() => import("@/topics/ratio-algebra/explain/RatioPreview").then((m) => m.RatioPreview), { loading: Loading }),
  // D-041: the lesson step that opens the three-way explanation of adding fractions with different denominators.
  "add-fractions-modes": dynamic(() => import("@/topics/fractions-2/explain/AddDifferentPreview").then((m) => m.AddDifferentPreview), { loading: Loading }),
  // D-039 (Y6.GPS.1): draw a triangle with an on-screen ruler and protractor.
  "triangle-construct": dynamic(() => import("@/topics/shapes-angles/explain/ConstructLab").then((m) => m.ConstructLab), { loading: Loading }),
};

const REMEDIES: Record<string, ComponentType> = {
  "multiply-divide.tens-place": dynamic(() => import("@/topics/multiply-divide/explain/LongMultiplicationLab").then((m) => m.LongMultiplicationRemedy), { loading: Loading }),
};

export function KitLabStep(props: LabStepProps) {
  const Lab = LABS[(props.step as unknown as KitLab).explainer];
  return Lab ? <Lab {...props} /> : null;
}

/** A lab step is done once each of its challenges is complete. */
export function isKitLabDone(step: Extract<LessonStep, { type: "lab" }>, completed: string[]) {
  return ((step as unknown as KitLab).challenges ?? []).every((c) => completed.includes(c));
}

export function KitRemedy({ misconception }: { misconception: string }) {
  const Remedy = REMEDIES[misconception];
  return Remedy ? <Remedy /> : null;
}

/** Names a lab step may use, for content tests. */
export const EXPLAINERS = Object.keys(LABS);
