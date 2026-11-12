"use client";

import { ExplainShell } from "@/components/explain/modes/ExplainShell";
import { FilmPlayer } from "@/components/explain/modes/FilmPlayer";
import { FinalCheck } from "@/components/explain/modes/FinalCheck";
import { StepThrough } from "@/components/explain/modes/StepThrough";
import { RichText } from "@/components/math/RichText";
import { CheckIcon } from "@/components/ui/Icons";
import { topicRoutes } from "@/lib/routes";
import { genId } from "@/topics/kit/define";
import { ADD_DIFFERENT_SCRIPT as S } from "./addDifferentScript";
import { AddDifferentTry } from "./AddDifferentTry";
import { FracStageView } from "./FracStage";

/**
 * D-041 pilot: adding fractions with different denominators in all three ways to learn (watch, step through, try it),
 * with the same key notes, takeaway and final check underneath.
 */
const NOTES: [string, string][] = [
  ["Denominator", "The bottom number. It says how big the pieces are: quarters are smaller than thirds."],
  ["Common denominator", "A number both denominators go into, like 12 for thirds and quarters. Then the pieces match."],
  ["Equivalent fractions", "The same amount cut differently: {1/3} = {4/12}. Multiply the top and bottom by the same number."],
  ["Adding", "Once the pieces match, add the tops. The bottom stays the same: {4/12} + {3/12} = {7/12}."],
];

export function AddDifferentPage() {
  return (
    <ExplainShell
      title={S.title}
      tile={<RichText text="{1/3}+{1/4}" compact />}
      back={{ href: topicRoutes(S.topicId).island(), label: "Back to Fractions 2" }}
      modes={{
        watch: <FilmPlayer concept={S.concept} film={S.film} title={S.title} />,
        step: <StepThrough story={S.story} stage={(scene, _caption, still) => <FracStageView scene={scene} still={still} />} voiceBase={`/voice/${S.concept}`} label="Fractions story" />,
        try: <AddDifferentTry />,
      }}
    >
      <section aria-labelledby="notes-title" className="flex flex-col gap-3">
        <h2 id="notes-title" className="text-title font-extrabold text-ink">Key notes</h2>
        <dl className="m-0 grid gap-3 sm:grid-cols-2">
          {NOTES.map(([t, d]) => (
            <div key={t} className="rounded-[20px] border border-line bg-surface p-4">
              <dt className="text-body font-extrabold text-ink">{t}</dt>
              <dd className="m-0 text-body text-ink-2"><RichText text={d} /></dd>
            </div>
          ))}
        </dl>
      </section>
      <section aria-labelledby="takeaway-title" className="flex flex-col gap-2 rounded-[24px] bg-ok-soft p-5">
        <h2 id="takeaway-title" className="text-title font-extrabold text-ink">Key takeaway</h2>
        <ul className="m-0 flex flex-col gap-1.5 pl-0">
          {["Never add the bottoms: they say the size of the pieces.", "Cut both into the same size pieces first (multiply the denominators if nothing smaller works).", "Then add or take away the tops, and simplify if you can."].map((t) => (
            <li key={t} className="flex gap-2 text-body font-semibold text-ink"><span className="mt-1 text-ok"><CheckIcon size={18} strokeWidth={3} /></span>{t}</li>
          ))}
        </ul>
      </section>
      <FinalCheck topicId={S.topicId} questionId={genId(S.topicId, "f2-add-diff", 2, 11)} orderKey="add-different-final" />
    </ExplainShell>
  );
}
