"use client";

import { CheckIcon } from "@/components/ui/Icons";
import type { LabStepProps } from "@/topics/types";
import { LAB_LIMITS } from "../lab";
import type { FractionsLabStep } from "../lessons";
import { FractionLab } from "./FractionLab";

type FractionsLabStepProps = Omit<LabStepProps, "step"> & { step: LabStepProps["step"] & FractionsLabStep };

/** A lab step inside a lesson: the lab in one mode, with the step's challenges. */
export function FractionsLessonLab({ step, completed, onChallengeComplete }: FractionsLabStepProps) {
  return <FractionLab modes={[step.mode]} challenges={step.challenges} completed={completed} onChallengeComplete={onChallengeComplete} />;
}

export function isFractionsLabStepDone(step: LabStepProps["step"] & Partial<FractionsLabStep>, completed: string[]): boolean {
  return (step.challenges ?? []).every((c) => completed.includes(c.id));
}

export const FREE_LAB_INTRO = `Cut shapes into up to ${LAB_LIMITS.maxParts} equal parts, colour them in, compare, and split parts (up to ${LAB_LIMITS.maxSplit} pieces) to discover equivalent fractions.`;

/** The free-play lab page. */
export function FractionsFreeLab() {
  return (
    <>
      <FractionLab modes={["build", "compare", "equivalent", "line"]} />
      <p className="flex items-center gap-2 text-[0.9375rem] text-muted">
        <CheckIcon size={15} /> Keyboard: Tab to a shape, arrow keys to move between parts, Space to shade.
      </p>
    </>
  );
}
