"use client";

import { FilmPlayer } from "@/components/explain/modes/FilmPlayer";
import { StepThrough } from "@/components/explain/modes/StepThrough";
import { ConceptNotesView } from "@/components/journey/ConceptNotes";
import { KeyIdeaCard } from "@/components/journey/JourneyChrome";
import { LearnStage } from "@/components/journey/LearnStage";
import { journeyFor } from "@/topics/kit/journeys";
import { REMAINDER_SCRIPT as S } from "./remainderScript";
import { RemainderStageView } from "./RemainderStage";
import { RemainderTry } from "./RemainderTry";

/** D-050: remainders in real life in the topic journey: the Learn stage (watch, step through or try it) and the Notes. */

export function RemainderLearn() {
  const j = journeyFor(S.topicId, S.concept)!;
  return (
    <LearnStage
      minutes={j.minutes}
      keyIdea={<KeyIdeaCard def={j} />}
      modes={{
        watch: <FilmPlayer concept={S.concept} film={S.film} title={S.title} />,
        step: <StepThrough story={S.story} stage={(scene, _caption, still) => <RemainderStageView scene={scene} still={still} />} voiceBase={`/voice/${S.concept}`} label="School trip story" />,
        try: <RemainderTry />,
      }}
    />
  );
}

export function RemainderNotes() {
  return (
    <ConceptNotesView
      terms={[
        ["Remainder", "What is left over after dividing: 50 ÷ 12 = 4 remainder 2 (4 r 2)."],
        ["Round up", "When the leftovers still need a place: 50 children need 5 minibuses of 12."],
        ["Round down", "When only full groups count: 50 pens make 4 full packs of 12."],
        ["The remainder is the answer", "When the question asks how many are left over: 2."],
      ]}
      takeaways={["Divide first, then think about the story.", "Ask: does the remainder need a place, or not?", "Check: does your answer make sense in real life?"]}
    />
  );
}
