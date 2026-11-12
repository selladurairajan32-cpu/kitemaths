"use client";

import { FilmPlayer } from "@/components/explain/modes/FilmPlayer";
import { StepThrough } from "@/components/explain/modes/StepThrough";
import { ConceptNotesView } from "@/components/journey/ConceptNotes";
import { KeyIdeaCard } from "@/components/journey/JourneyChrome";
import { LearnStage } from "@/components/journey/LearnStage";
import { journeyFor } from "@/topics/kit/journeys";
import { PERCENT_SCRIPT as S } from "./percentScript";
import { PercentStageView } from "./PercentStage";
import { PercentTry } from "./PercentTry";

/** D-050: percentages of amounts in the topic journey: the Learn stage (watch, step through or try it) and the Notes. */

export function PercentLearn() {
  const j = journeyFor(S.topicId, S.concept)!;
  return (
    <LearnStage
      minutes={j.minutes}
      keyIdea={<KeyIdeaCard def={j} />}
      modes={{
        watch: <FilmPlayer concept={S.concept} film={S.film} title={S.title} />,
        step: <StepThrough story={S.story} stage={(scene, _caption, still) => <PercentStageView scene={scene} still={still} />} voiceBase={`/voice/${S.concept}`} label="Percentages story" />,
        try: <PercentTry />,
      }}
    />
  );
}

export function PercentNotes() {
  return (
    <ConceptNotesView
      terms={[
        ["Per cent (%)", "Out of every hundred. 35% means 35 out of every 100."],
        ["100%", "The whole amount. 100% of £80 is £80."],
        ["10%", "One tenth of the amount: divide by 10. 10% of 80 is 8."],
        ["5%", "Half of 10%. 5% of 80 is 4."],
      ]}
      takeaways={["Never divide by the percentage: 80 ÷ 35 is not 35% of 80.", "Find 10% first by dividing by 10.", "Build the rest: 35% = 30% + 5%."]}
    />
  );
}
