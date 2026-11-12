"use client";

import { useState, type ComponentType, type KeyboardEvent, type ReactNode } from "react";
import { ExplainShell } from "@/components/explain/modes/ExplainShell";
import { FilmPlayer } from "@/components/explain/modes/FilmPlayer";
import { FinalCheck } from "@/components/explain/modes/FinalCheck";
import { StepThrough } from "@/components/explain/modes/StepThrough";
import { RichText } from "@/components/math/RichText";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/Icons";
import { scaleAmount, shareInRatio } from "@/maths/ratio";
import { topicRoutes } from "@/lib/routes";
import { genId } from "@/topics/kit/define";
import { RATIO_SCRIPT, RECIPE, type RatioScene } from "./ratioStory";
import { RatioSceneSvg } from "./RatioSceneSvg";

/**
 * D-040: the ratio and proportion explanation page. D-041: in the shared three-way shell: *Watch* the ratio film,
 * *Step through* the story stage (3D where the device can, otherwise the 2.5D picture) with a voice, captions and
 * chapter checkpoints, or *Try it* by sharing sweets by hand. Below: step by step, a real-life example and key notes; a
 * side rail with the common mistake, fading hints and why it works; and the final check. Everything the stage shows
 * is also in words.
 */

export type StageProps = { scene: RatioScene; label: string };
const MORE = [
  { id: "steps", label: "Step by step" },
  { id: "real-life", label: "Real-life example" },
  { id: "notes", label: "Key notes" },
] as const;
type MoreId = (typeof MORE)[number]["id"];
const TOPIC = "ratio-algebra";

/** The stage: the 3D scene passed in, or the 2.5D picture. */
function Stage({ scene, label, Stage3D }: StageProps & { Stage3D?: ComponentType<StageProps> }) {
  return (
    <div className="relative overflow-hidden rounded-[24px] bg-linear-to-b from-sky-soft to-brand-soft p-2 sm:p-4">
      {Stage3D ? <Stage3D scene={scene} label={label} /> : <RatioSceneSvg scene={scene} />}
    </div>
  );
}

function StepsPanel() {
  const { onePart, shares, partCount } = shareInRatio(35, [2, 3]);
  const steps = [
    { title: "Add the parts", body: `2 + 3 = **${partCount}** parts altogether.` },
    { title: "Find one part", body: `35 ÷ ${partCount} = **${onePart}**. Each part is ${onePart} sweets.` },
    { title: "Multiply for each share", body: `Blue: 2 × ${onePart} = **${shares[0]}**. Orange: 3 × ${onePart} = **${shares[1]}**.` },
  ];
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-title font-extrabold text-ink">Share 35 sweets in the ratio 2 : 3</h2>
      <ol className="grid gap-3 md:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="flex flex-col gap-2 rounded-[22px] border border-line bg-surface p-4 shadow-[var(--shadow-card)]">
            <span className="grid size-10 place-items-center rounded-full bg-brand text-title font-extrabold text-on-brand">{i + 1}</span>
            <h3 className="text-body font-extrabold text-ink">{s.title}</h3>
            <p className="text-body text-ink-2"><RichText text={s.body} /></p>
          </li>
        ))}
      </ol>
      <p className="rounded-[18px] bg-ok-soft px-4 py-3 text-body font-bold text-ink">Check: {shares[0]} + {shares[1]} = 35, and 14 : 21 simplifies to 2 : 3.</p>
    </div>
  );
}

function RealLifePanel({ Stage3D }: { Stage3D?: ComponentType<StageProps> }) {
  const [people, setPeople] = useState(6);
  const scene: RatioScene = { kind: "recipe", people, eggs: scaleAmount(RECIPE.eggs, RECIPE.base, people), milk: scaleAmount(RECIPE.milk, RECIPE.base, people) };
  const times = people / RECIPE.base;
  const caption = `Pancakes for ${people} people: ${scene.kind === "recipe" ? scene.eggs : 0} eggs and ${scene.kind === "recipe" ? scene.milk : 0} ml of milk.`;
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-title font-extrabold text-ink">Scaling a recipe</h2>
      <p className="text-body text-ink-2">Pancakes for {RECIPE.base} people need {RECIPE.eggs} eggs and {RECIPE.milk} ml of milk. Move the slider to cook for more or fewer people: every amount is multiplied by the same number.</p>
      <Stage scene={scene} label={caption} Stage3D={Stage3D} />
      <div className="flex flex-col gap-2 rounded-[18px] bg-surface p-4 shadow-[var(--shadow-card)]">
        <label htmlFor="people" className="text-body font-bold text-ink">
          People: {people} <span className="font-semibold text-ink-2">(× {times.toLocaleString("en-GB")} of the recipe)</span>
        </label>
        <input id="people" type="range" min={2} max={12} step={2} value={people} onChange={(e) => setPeople(Number(e.target.value))} className="h-11 w-full accent-[var(--color-brand)]" aria-valuetext={`${people} people`} />
        <p aria-live="polite" className="text-lg font-bold text-ink">{caption}</p>
      </div>
      <section aria-labelledby="map-title" className="flex flex-col gap-2 rounded-[22px] border border-line bg-surface p-4">
        <h3 id="map-title" className="text-body font-extrabold text-ink">Maps use ratios too</h3>
        <p className="text-body text-ink-2">
          A map scale of <strong>1 : 50,000</strong> means 1 cm on the map is 50,000 cm on the ground. That is 500 m, so 4 cm on the map is 4 × 500 m = <strong>2 km</strong>.
        </p>
      </section>
    </div>
  );
}

const TRY_PROBLEMS = [
  { total: 20, a: 3, b: 1, who: ["Amir", "Bea"] },
  { total: 24, a: 1, b: 2, who: ["Chen", "Dev"] },
  { total: 30, a: 2, b: 3, who: ["Ella", "Finn"] },
] as const;

/** Share sweets in a ratio by hand: say the group size, deal out groups until none are left, then read a share. */
function TryPanel({ Stage3D }: { Stage3D?: ComponentType<StageProps> }) {
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState<"size" | "deal" | "share" | "done">("size");
  const [dealt, setDealt] = useState(0);
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const p = TRY_PROBLEMS[index]!;
  const { onePart, shares, partCount } = shareInRatio(p.total, [p.a, p.b]);
  const left = p.total - dealt * partCount;
  const reset = (i: number) => { setIndex(i); setStage("size"); setDealt(0); setValue(""); setFeedback(null); };
  const submit = () => {
    const n = Number(value);
    if (stage === "size") {
      if (n === partCount) { setStage("deal"); setFeedback(`Yes: ${p.a} + ${p.b} = ${partCount}. Now deal out groups of ${partCount}.`); }
      else setFeedback(`Not quite. A group has ${p.a} for ${p.who[0]} and ${p.b} for ${p.who[1]}: add them.`);
    } else if (stage === "share") {
      if (n === shares[0]) { setStage("done"); setFeedback(`Yes! ${onePart} groups × ${p.a} = ${shares[0]} for ${p.who[0]}, and ${onePart} × ${p.b} = ${shares[1]} for ${p.who[1]}.`); }
      else setFeedback(`Not quite. There were ${onePart} groups, and ${p.who[0]} gets ${p.a} from each.`);
    }
    setValue("");
  };
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-title font-extrabold text-ink">
        Problem {index + 1} of {TRY_PROBLEMS.length}: share {p.total} sweets between {p.who[0]} and {p.who[1]} in the ratio {p.a} : {p.b}
      </h2>
      <Stage scene={{ kind: "deal", total: p.total, a: p.a, b: p.b, dealt }} label={`${left} sweets left; ${p.who[0]} has ${dealt * p.a}; ${p.who[1]} has ${dealt * p.b}.`} Stage3D={Stage3D} />
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { name: "Sweets left", count: left, tone: "bg-sunk" },
          { name: p.who[0], count: dealt * p.a, tone: "bg-brand-soft" },
          { name: p.who[1], count: dealt * p.b, tone: "bg-num-soft" },
        ].map((j) => (
          <div key={j.name} className={`flex flex-col items-center gap-1 rounded-[22px] ${j.tone} p-4`}>
            <span className="text-label font-bold text-ink-2">{j.name}</span>
            <span className="display text-heading-1 tabular-nums text-ink" aria-live="polite">{j.count}</span>
          </div>
        ))}
      </div>
      {stage === "deal" && (
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={() => { const d = dealt + 1; setDealt(d); if (p.total - d * partCount === 0) { setStage("share"); setFeedback(`All shared out in ${d} groups. How many does ${p.who[0]} have?`); } else setFeedback(`${d} group${d === 1 ? "" : "s"} dealt: ${p.a} to ${p.who[0]}, ${p.b} to ${p.who[1]}.`); }}>
            Deal one group of {partCount}
          </Button>
          <span className="text-body font-semibold text-ink-2">{dealt} group{dealt === 1 ? "" : "s"} dealt</span>
        </div>
      )}
      {(stage === "size" || stage === "share") && (
        <form className="flex flex-wrap items-center gap-3" onSubmit={(e) => { e.preventDefault(); if (value) submit(); }}>
          <label htmlFor="try-answer" className="text-body font-bold text-ink">
            {stage === "size" ? "How many sweets are in one group?" : `How many sweets does ${p.who[0]} get?`}
          </label>
          <input id="try-answer" inputMode="numeric" autoComplete="off" value={value} onChange={(e) => setValue(e.target.value.replace(/[^\d]/g, "").slice(0, 3))} className="h-14 w-28 rounded-[14px] border-2 border-line-strong bg-surface px-3 text-center text-title font-extrabold tabular-nums focus:border-brand" />
          <Button type="submit" disabled={!value}>Check</Button>
        </form>
      )}
      {feedback && <p role="status" className={`rounded-[16px] px-4 py-3 text-body font-semibold ${stage === "done" ? "bg-ok-soft text-ink" : "bg-sun-soft text-ink"}`}>{feedback}</p>}
      {stage === "done" && index < TRY_PROBLEMS.length - 1 && <Button onClick={() => reset(index + 1)} className="self-start">Next problem <ArrowRightIcon size={18} /></Button>}
      {stage === "done" && index === TRY_PROBLEMS.length - 1 && <p className="text-body font-bold text-ok">You shared all three. You can do this on any ratio now.</p>}
    </div>
  );
}

function NotesPanel() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-title font-extrabold text-ink">Key notes</h2>
      <dl className="grid gap-3 sm:grid-cols-2">
        {[
          ["Ratio", "Compares amounts. 2 : 3 means for every 2 of one, there are 3 of the other."],
          ["Part", "One share of a group. In 2 : 3 there are 5 parts in each group."],
          ["Sharing in a ratio", "Add the parts, divide the total by them to find one part, then multiply."],
          ["Scaling", "Multiply every amount by the same number, as in a recipe or a map scale."],
        ].map(([t, d]) => (
          <div key={t} className="rounded-[20px] border border-line bg-surface p-4">
            <dt className="text-body font-extrabold text-ink">{t}</dt>
            <dd className="m-0 text-body text-ink-2">{d}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const HINTS = ["Add the parts of the ratio first.", "Divide the total by the number of parts to find one part.", "Multiply one part by each number in the ratio."];

function Rail() {
  const [hints, setHints] = useState(1);
  return (
    <aside className="flex flex-col gap-4" aria-label="Help">
      <section aria-labelledby="mistake-title" className="flex flex-col gap-2 rounded-[22px] border border-line bg-surface p-4 shadow-[var(--shadow-card)]">
        <h2 id="mistake-title" className="text-body font-extrabold text-ink">Common mistake</h2>
        <p className="text-body text-ink-2">
          <RichText text="**2 : 3 of 35 is not {2/3} of 35.** The ratio has 5 parts, so blue gets {2/5} of 35 = 14." />
        </p>
      </section>
      <section aria-labelledby="hint-title" className="flex flex-col gap-2 rounded-[22px] bg-sun-soft p-4">
        <h2 id="hint-title" className="text-body font-extrabold text-ink">Hints</h2>
        <ol className="m-0 flex list-decimal flex-col gap-1 pl-5 text-body font-semibold text-ink">
          {HINTS.slice(0, hints).map((h) => <li key={h}>{h}</li>)}
        </ol>
        {hints < HINTS.length && (
          <button type="button" onClick={() => setHints((n) => n + 1)} className="min-h-11 self-start font-bold text-brand-strong underline underline-offset-4">
            Another hint
          </button>
        )}
      </section>
      <section aria-labelledby="why-title" className="flex flex-col gap-2 rounded-[22px] border border-line bg-surface p-4">
        <h2 id="why-title" className="text-body font-extrabold text-ink">Why this works</h2>
        <ul className="m-0 flex flex-col gap-1.5 pl-0">
          {["Every group has the same 2 blue and 3 orange, so the ratio never changes.", "Dividing by the number of parts tells you how many groups fit.", "Each share is that many groups of its own part."].map((w) => (
            <li key={w} className="flex gap-2 text-body text-ink-2"><span className="mt-1 text-ok"><CheckIcon size={18} strokeWidth={3} /></span>{w}</li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

/** More about ratio: plain tabs (the address keeps the way to learn, so these don't change it). */
function More({ Stage3D }: { Stage3D?: ComponentType<StageProps> }) {
  const [tab, setTab] = useState<MoreId>("steps");
  const onTabKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? MORE.length - 1 : null;
    if (n === null) return;
    e.preventDefault();
    const next = MORE[(n + MORE.length) % MORE.length]!;
    setTab(next.id);
    document.getElementById(`more-${next.id}`)?.focus();
  };
  const panels: Record<MoreId, ReactNode> = { steps: <StepsPanel />, "real-life": <RealLifePanel Stage3D={Stage3D} />, notes: <NotesPanel /> };
  return (
    <section aria-labelledby="more-title" className="flex flex-col gap-3">
      <h2 id="more-title" className="text-title font-extrabold text-ink">More about ratio</h2>
      <div role="tablist" aria-labelledby="more-title" className="flex gap-2 overflow-x-auto pb-1">
        {MORE.map((t, i) => (
          <button
            key={t.id}
            id={`more-${t.id}`}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            aria-controls={`more-panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            onKeyDown={(e) => onTabKey(e, i)}
            className={`min-h-12 shrink-0 whitespace-nowrap rounded-full px-5 text-body font-bold ${tab === t.id ? "bg-brand text-on-brand shadow-[var(--shadow-card)]" : "border border-line bg-surface text-ink hover:bg-sunk"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`more-panel-${tab}`} aria-labelledby={`more-${tab}`} className="min-w-0 rounded-[28px] border border-line bg-surface p-4 shadow-[var(--shadow-card)] sm:p-6">
        {panels[tab]}
      </div>
    </section>
  );
}

export function RatioExplanation({ Stage3D }: { Stage3D?: ComponentType<StageProps> }) {
  const S = RATIO_SCRIPT;
  return (
    <ExplainShell
      title={S.title}
      tile="a : b"
      back={{ href: topicRoutes(TOPIC).island(), label: "Back to Ratio and algebra" }}
      modes={{
        watch: <FilmPlayer concept={S.concept} film={S.film} title={S.title} />,
        step: <StepThrough story={S.story} stage={(scene, label, still) => (Stage3D && !still ? <Stage3D scene={scene} label={label} /> : <RatioSceneSvg scene={scene} />)} voiceBase={`/voice/${S.concept}`} label="Ratio story" />,
        try: <TryPanel Stage3D={Stage3D} />,
      }}
      rail={<Rail />}
    >
      <More Stage3D={Stage3D} />
      <section aria-labelledby="takeaway-title" className="flex flex-col gap-2 rounded-[24px] bg-ok-soft p-5">
        <h2 id="takeaway-title" className="text-title font-extrabold text-ink">Key takeaway</h2>
        <ul className="m-0 flex flex-col gap-1.5 pl-0">
          {["Add the parts to find how many in each group.", "Divide the total by that to find one part.", "Multiply one part by each number in the ratio."].map((t) => (
            <li key={t} className="flex gap-2 text-body font-semibold text-ink"><span className="mt-1 text-ok"><CheckIcon size={18} strokeWidth={3} /></span>{t}</li>
          ))}
        </ul>
      </section>
      <FinalCheck topicId={TOPIC} questionId={genId(TOPIC, "ra-ratio", 2, 4)} orderKey="ratio-final" />
    </ExplainShell>
  );
}
