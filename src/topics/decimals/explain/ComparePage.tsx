"use client";

import { FilmPlayer } from "@/components/explain/modes/FilmPlayer";
import { StepThrough } from "@/components/explain/modes/StepThrough";
import { KeyIdeaCard } from "@/components/journey/JourneyChrome";
import { LearnStage } from "@/components/journey/LearnStage";
import { ConceptNotesView } from "@/components/journey/ConceptNotes";
import { journeyFor } from "@/topics/kit/journeys";
import { COMPARE_SCRIPT as S } from "./compareScript";
import { CompareStageView } from "./CompareStage";
import { CompareTry } from "./CompareTry";

/** D-050: comparing decimals in the topic journey: the Learn stage (watch, step through or try it) and the Notes. */

export function CompareLearn() {
  const j = journeyFor(S.topicId, S.concept)!;
  return (
    <LearnStage
      minutes={j.minutes}
      keyIdea={<KeyIdeaCard def={j} />}
      modes={{
        watch: <FilmPlayer concept={S.concept} film={S.film} title={S.title} />,
        step: <StepThrough story={S.story} stage={(scene, _caption, still) => <CompareStageView scene={scene} still={still} />} voiceBase={`/voice/${S.concept}`} label="Decimals story" />,
        try: <CompareTry />,
      }}
    />
  );
}

export function CompareNotes() {
  return (
    <ConceptNotesView
      terms={[
        ["Tenths", "The first place after the decimal point. 0.4 is 4 tenths."],
        ["Hundredths", "The second place after the point. 0.35 is 3 tenths and 5 hundredths: 35 hundredths."],
        ["Filling the gap", "Adding a zero after the last digit doesn't change a decimal: 0.4 = 0.40."],
        ["Comparing", "Line up the points and compare from the left: the tenths first, then the hundredths."],
      ]}
      takeaways={["A longer decimal isn't always bigger: 0.4 > 0.35.", "Give both the same number of places: 0.40 and 0.35.", "Compare the tenths first, then the hundredths."]}
    />
  );
}
