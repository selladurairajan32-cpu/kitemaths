"use client";

import { useState } from "react";
import { Replay, Stage, type Chapter } from "@/components/explain/Stage";
import { TryIt } from "@/components/explain/TryIt";
import { longMultiplication, type LongMultiplication } from "@/maths/long-multiplication";
import type { KitLab } from "@/topics/kit/types";
import type { LabStepProps } from "@/topics/types";
import { AreaScene } from "./AreaScene";
import { BlocksScene } from "./BlocksScene";
import { blocksSteps, fitsPilot, numbersSteps, pictureSteps, tryItBlanks, type ShowMe } from "./captions";
import { ColumnScene } from "./ColumnScene";

/** The three chapters for a × b: blocks (concrete), picture (area model), numbers (column method). ANIM-001 §1. */
export function longMultiplicationChapters(m: LongMultiplication): Chapter[] {
  if (!fitsPilot(m)) throw new RangeError(`The long-multiplication scenes draw a 2-digit number times 11 to 19 with a carry, not ${m.a} × ${m.b}`);
  return [
    { id: "blocks", label: "Blocks", steps: blocksSteps(m), Scene: (p) => <BlocksScene m={m} {...p} /> },
    { id: "picture", label: "Picture", steps: pictureSteps(m), Scene: (p) => <AreaScene m={m} {...p} /> },
    { id: "numbers", label: "Numbers", steps: numbersSteps(m), Scene: (p) => <ColumnScene m={m} {...p} /> },
  ];
}

const lab = (step: LabStepProps["step"]) => step as unknown as KitLab;

/** One set of chapters per pair of numbers, so each scene keeps the same component identity between renders. */
const cache = new Map<string, Chapter[]>();
export function chaptersFor(a: number, b: number): Chapter[] {
  const key = `${a}x${b}`;
  let chapters = cache.get(key);
  if (!chapters) {
    chapters = longMultiplicationChapters(longMultiplication(a, b));
    cache.set(key, chapters);
  }
  return chapters;
}

/** Lesson step "Watch how it works": the three chapters on one stage. Finishing it completes the step. */
export function LongMultiplicationWatch({ step, completed, onChallengeComplete }: LabStepProps) {
  const { numbers, challenges } = lab(step);
  const [a, b] = numbers as [number, number];
  const chapters = chaptersFor(a, b);
  return <Stage chapters={chapters} completed={completed.includes(challenges[0]!)} onComplete={() => onChallengeComplete(challenges[0]!)} />;
}

/**
 * Lesson step "Try it yourself": numbers[0] × numbers[1] one part at a time. After a slip, "Show me again" replays the
 * matching step of the watch-it explanation (drawn with numbers[2] × numbers[3], the numbers the child watched).
 */
export function LongMultiplicationTry({ step, completed, onChallengeComplete }: LabStepProps) {
  const { numbers, challenges } = lab(step);
  const [a, b, wa, wb] = numbers as [number, number, number, number];
  const chapters = chaptersFor(wa, wb);
  const blanks = tryItBlanks(longMultiplication(a, b));
  const [show, setShow] = useState<ShowMe | null>(null);
  const chapter = show && chapters.find((c) => c.id === show.chapter);
  return (
    <div className="space-y-5">
      <TryIt blanks={blanks} done={completed.includes(challenges[0]!)} onComplete={() => onChallengeComplete(challenges[0]!)} onShowMe={(i) => setShow(blanks[i]!.show)} />
      {chapter && show && (
        <section aria-label="Show me again" className="space-y-2">
          <p className="text-lg font-bold text-ink">
            Here&apos;s how it worked for {wa} × {wb}:
          </p>
          <Replay key={`${show.chapter}-${show.step}`} chapter={chapter} step={show.step} />
        </section>
      )}
    </div>
  );
}

/** "Explain it differently" after a tens-place slip in practice: the digits stepping left for × 10. */
export function LongMultiplicationRemedy() {
  const chapters = chaptersFor(23, 14);
  return (
    <div className="space-y-2">
      <p className="text-lg font-bold text-ink">Watch how times 10 works:</p>
      <Replay chapter={chapters[2]!} step={2} />
    </div>
  );
}
