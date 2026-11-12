"use client";

import { FilmPlayer } from "@/components/explain/modes/FilmPlayer";
import { StepThrough } from "@/components/explain/modes/StepThrough";
import { KeyIdeaCard } from "@/components/journey/JourneyChrome";
import { LearnStage } from "@/components/journey/LearnStage";
import { RichText } from "@/components/math/RichText";
import { CheckIcon } from "@/components/ui/Icons";
import { journeyFor } from "@/topics/kit/journeys";
import { ADD_DIFFERENT_SCRIPT as S } from "./addDifferentScript";
import { AddDifferentTry } from "./AddDifferentTry";
import { FracStageView } from "./FracStage";

/**
 * D-043: adding fractions with different denominators in the topic journey. `AddDifferentLearn` is stage 1 (watch,
 * step through or try it); `AddDifferentNotes` is what the Notes button opens at any stage.
 */
const NOTES: [string, string][] = [
  ["Denominator", "The bottom number. It says how big the slices are: quarters are smaller than thirds."],
  ["Common denominator", "A number both denominators go into, like 12 for thirds and quarters. Then the slices match."],
  ["Equivalent fractions", "The same amount cut differently: {1/3} = {4/12}. Multiply the top and bottom by the same number."],
  ["Adding", "Once the slices match, add the tops. The bottom stays the same: {4/12} + {3/12} = {7/12}."],
];

export function AddDifferentLearn() {
  const j = journeyFor(S.topicId, S.concept)!;
  return (
    <LearnStage
      minutes={j.minutes}
      keyIdea={<KeyIdeaCard def={j} />}
      modes={{
        watch: <FilmPlayer concept={S.concept} film={S.film} title={S.title} />,
        step: <StepThrough story={S.story} stage={(scene, _caption, still) => <FracStageView scene={scene} still={still} />} voiceBase={`/voice/${S.concept}`} label="Fractions story" />,
        try: <AddDifferentTry />,
      }}
    />
  );
}

export function AddDifferentNotes() {
  return (
    <div className="flex flex-col gap-4">
      <dl className="m-0 grid gap-3">
        {NOTES.map(([t, d]) => (
          <div key={t} className="rounded-[20px] border border-line bg-surface p-4">
            <dt className="text-body font-extrabold text-ink">{t}</dt>
            <dd className="m-0 text-body text-ink-2"><RichText text={d} /></dd>
          </div>
        ))}
      </dl>
      <section aria-labelledby="takeaway-title" className="flex flex-col gap-2 rounded-[20px] bg-ok-soft p-4">
        <h3 id="takeaway-title" className="text-body font-extrabold text-ink">Key takeaway</h3>
        <ul className="m-0 flex flex-col gap-1.5 pl-0">
          {["Never add the bottoms: they say the size of the slices.", "Cut both into the same size slices first.", "Then add or take away the tops, and simplify if you can."].map((t) => (
            <li key={t} className="flex gap-2 text-body font-semibold text-ink"><span className="mt-1 text-ok"><CheckIcon size={18} strokeWidth={3} /></span>{t}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
