"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useRef, useState, type ComponentType, type ReactNode } from "react";
import { RichText } from "@/components/math/RichText";
import { ExplainerPlayer, useStepper } from "./ExplainerPlayer";
import { MethodSwitcher } from "./MethodSwitcher";
import { APPEAR, motionOr } from "./motionTokens";
import { TryIt, type TryItBlank } from "./TryIt";

/** One way of explaining the idea: concrete ("In real life"), pictorial ("Picture it") or abstract ("Step by step"). */
export interface ExplainMethod {
  id: string;
  label: string;
  hint: string;
  /** One caption per step; the scene draws the same step. */
  captions: string[];
  Scene: ComponentType<{ step: number }>;
}

/**
 * The reusable animated explanation (ANIM-001): Watch & learn in three ways the learner can switch between at any
 * time, then Try it yourself. Practise follows as the lesson's ordinary check steps. Topic-independent: a topic only
 * supplies the methods (captions and scenes) and the try-it parts.
 */
export function Explainer({
  methods,
  explore,
  tryIt,
  done,
  onComplete,
}: {
  methods: ExplainMethod[];
  /** Optional hands-on model shown before the try-it parts. */
  explore?: ReactNode;
  tryIt: { intro: string; blanks: TryItBlank[] };
  done: boolean;
  onComplete: () => void;
}) {
  const idBase = useId();
  const reduce = useReducedMotion();
  const [methodId, setMethodId] = useState(methods[0]!.id);
  const method = methods.find((m) => m.id === methodId) ?? methods[0]!;
  const [state, dispatch] = useStepper(method.captions.length);
  const watchRef = useRef<HTMLHeadingElement>(null);

  const explainDifferently = () => {
    const i = methods.findIndex((m) => m.id === method.id);
    setMethodId(methods[(i + 1) % methods.length]!.id);
    dispatch({ type: "goto", step: 0 });
    watchRef.current?.scrollIntoView?.({ behavior: reduce ? "auto" : "smooth", block: "start" });
    watchRef.current?.focus();
  };

  const Scene = method.Scene;
  return (
    <div className="space-y-8">
      <section className="space-y-4" aria-labelledby={`${idBase}-watch`}>
        <h2 id={`${idBase}-watch`} ref={watchRef} tabIndex={-1} className="text-title font-extrabold text-ink outline-none">
          Watch and learn
        </h2>
        <MethodSwitcher methods={methods} value={method.id} onChange={setMethodId} idBase={idBase} />
        <div role="tabpanel" id={`${idBase}-panel`} aria-labelledby={`${idBase}-tab-${method.id}`}>
          <ExplainerPlayer state={state} dispatch={dispatch} captions={method.captions} label={`${method.label}: step by step`}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={method.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={motionOr(reduce, APPEAR)}>
                <Scene step={state.step} />
              </motion.div>
            </AnimatePresence>
          </ExplainerPlayer>
        </div>
      </section>

      <section className="space-y-4 border-t-2 border-dashed border-line-strong pt-6" aria-labelledby={`${idBase}-try`}>
        <h2 id={`${idBase}-try`} className="text-title font-extrabold text-ink">
          Try it yourself
        </h2>
        {explore}
        <p className="text-lg text-ink">
          <RichText text={tryIt.intro} />
        </p>
        <TryIt blanks={tryIt.blanks} onComplete={onComplete} onExplainDifferently={explainDifferently} done={done} />
      </section>
    </div>
  );
}
