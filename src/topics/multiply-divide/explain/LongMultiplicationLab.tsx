"use client";

import { useMemo, useState } from "react";
import { Explainer, type ExplainMethod } from "@/components/explain/Explainer";
import { ExplainerPlayer, useStepper } from "@/components/explain/ExplainerPlayer";
import { MethodSwitcher } from "@/components/explain/MethodSwitcher";
import { longMultiplication, type LongMultiplication } from "@/maths/long-multiplication";
import type { LabStepProps } from "@/topics/types";
import type { KitLab } from "@/topics/kit/types";
import { areaCaptions, columnCaptions, hallCaptions, tryItBlanks } from "./captions";
import { AreaScene, ColumnScene, HallScene } from "./scenes";
import { SplitExplorer } from "./SplitExplorer";

/** The three ways to see a × b, concrete → pictorial → abstract (ANIM-001 §1). */
export function longMultiplicationMethods(m: LongMultiplication): ExplainMethod[] {
  return [
    { id: "real", label: "In real life", hint: "Chairs in a hall", captions: hallCaptions(m), Scene: ({ step }) => <HallScene m={m} step={step} /> },
    { id: "picture", label: "Picture it", hint: "An area model", captions: areaCaptions(m), Scene: ({ step }) => <AreaScene m={m} step={step} /> },
    { id: "steps", label: "Step by step", hint: "The column method", captions: columnCaptions(m), Scene: ({ step }) => <ColumnScene m={m} step={step} /> },
  ];
}

/** Lab step for the Long multiplication lesson: watch it three ways, explore a split, then try one. */
export default function LongMultiplicationLab({ step, completed, onChallengeComplete }: LabStepProps) {
  const lab = step as unknown as KitLab & { title: string };
  const [a, b, tryA, tryB] = lab.numbers;
  const watch = useMemo(() => longMultiplication(a!, b!), [a, b]);
  const practice = useMemo(() => longMultiplication(tryA!, tryB!), [tryA, tryB]);
  const methods = useMemo(() => longMultiplicationMethods(watch), [watch]);
  const challenge = lab.challenges[0]!;
  return (
    <Explainer
      methods={methods}
      explore={<SplitExplorer a={a!} b={b!} />}
      tryIt={{ intro: `Now you try. Work out **${tryA} × ${tryB}** one row at a time.`, blanks: tryItBlanks(practice) }}
      done={completed.includes(challenge)}
      onComplete={() => onChallengeComplete(challenge)}
    />
  );
}

/**
 * "Explain it differently" after a practice slip on long multiplication: the same three ways, without the try-it part.
 * Shown by the question player under the feedback for the tens-place misconception.
 */
export function LongMultiplicationRemedy() {
  const m = useMemo(() => longMultiplication(23, 14), []);
  const methods = useMemo(() => longMultiplicationMethods(m), [m]);
  const [methodId, setMethodId] = useState("picture");
  const method = methods.find((x) => x.id === methodId)!;
  const [state, dispatch] = useStepper(method.captions.length);
  const Scene = method.Scene;
  return (
    <div className="space-y-3 rounded-[22px] border border-line-strong bg-surface p-4">
      <p className="text-lg font-bold text-ink">Explain it differently: see how 23 × 14 works</p>
      <MethodSwitcher methods={methods} value={methodId} onChange={setMethodId} idBase="md-remedy" />
      <div role="tabpanel" id="md-remedy-panel" aria-labelledby={`md-remedy-tab-${methodId}`}>
        <ExplainerPlayer state={state} dispatch={dispatch} captions={method.captions} label={`${method.label}: step by step`}>
          <Scene step={state.step} />
        </ExplainerPlayer>
      </div>
    </div>
  );
}
