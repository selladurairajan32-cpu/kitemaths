"use client";

import { FilmPlayer } from "@/components/explain/modes/FilmPlayer";
import { StepThrough } from "@/components/explain/modes/StepThrough";
import { ConceptNotesView } from "@/components/journey/ConceptNotes";
import { KeyIdeaCard } from "@/components/journey/JourneyChrome";
import { LearnStage } from "@/components/journey/LearnStage";
import { journeyFor } from "@/topics/kit/journeys";
import { MULTIPLY_SCRIPT as S } from "./multiplyScript";
import { MultiplyStageView } from "./MultiplyStage";
import { MultiplyTry } from "./MultiplyTry";

/** D-050: multiplying fractions in the topic journey: the Learn stage (watch, step through or try it) and the Notes. */

export function MultiplyLearn() {
  const j = journeyFor(S.topicId, S.concept)!;
  return (
    <LearnStage
      minutes={j.minutes}
      keyIdea={<KeyIdeaCard def={j} />}
      modes={{
        watch: <FilmPlayer concept={S.concept} film={S.film} title={S.title} />,
        step: <StepThrough story={S.story} stage={(scene, _caption, still) => <MultiplyStageView scene={scene} still={still} />} voiceBase={`/voice/${S.concept}`} label="Chocolate bar story" />,
        try: <MultiplyTry />,
      }}
    />
  );
}

export function MultiplyNotes() {
  return (
    <ConceptNotesView
      terms={[
        ["Of", "\"{1/3} of\" means × {1/3}: take one third of it."],
        ["Multiplying fractions", "Multiply the tops, multiply the bottoms: {1/2} × {1/3} = {1/6}."],
        ["Smaller, not bigger", "Multiplying by a fraction less than 1 takes part of it, so the answer is smaller."],
        ["Simplify", "Divide the top and bottom by the same number: {2/12} = {1/6}."],
      ]}
      takeaways={["Times a fraction means a fraction of it.", "Multiply the tops, then multiply the bottoms.", "Check: the answer is smaller than both fractions."]}
    />
  );
}
