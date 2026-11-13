"use client";

import { useState, type ReactNode } from "react";
import { Dock, Dots, LensSwitch, Phase, Say } from "@/components/canvas/Canvas";
import { BarsBoard, FractionBar, piecesMatch, Reveal, TogetherBar, type BarRow } from "@/components/canvas/FractionBars";
import type { CanvasLesson } from "@/components/canvas/lesson";
import { FractionNotation } from "@/components/math/FractionNotation";
import { RichText } from "@/components/math/RichText";
import { Button } from "@/components/ui/Button";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/Icons";
import { playSound } from "@/lib/sound";
import { frac, lcm, partName, type Fraction } from "@/maths/fraction";

/**
 * D-060: adding fractions with different denominators on the lesson canvas, the pilot of the redesign.
 *
 * Discover: the child guesses 1/3 + 1/4 before any teaching, then sees the guess laid beside the real amount. The
 * common wrong guess, 2/7, turns out shorter than 1/3 on its own, which the child can see is impossible.
 * Explore: the child cuts two bars until the pieces match, then joins them. Nothing is told; the model answers back.
 * Understand: the same four steps as a picture (bars), a story (minutes on a clock) and numbers; switching between
 * them keeps the step. One small question checks the renaming idea before moving on.
 */

const SAM = frac(1, 3);
const ZARA = frac(1, 4);
const ROWS: [BarRow, BarRow] = [
  { f: SAM, who: "Sam's", name: "Sam" },
  { f: ZARA, who: "Zara's", name: "Zara" },
];

/* ---------- Discover ---------- */

const GUESSES: { id: string; f?: Fraction; verdict: string }[] = [
  { id: "2/7", f: frac(2, 7), verdict: "Look: {2/7} is shorter than Sam's piece on its own. So adding the tops and adding the bottoms can't be right. Lots of people guess this." },
  { id: "7/12", f: frac(7, 12), verdict: "Your guess is exactly as long as the two pieces. But why twelfths? Let's find out." },
  { id: "2/12", f: frac(2, 12), verdict: "Look: {2/12} is even shorter than Zara's piece. Adding can't make less than you started with." },
  { id: "unsure", verdict: "Good: now you'll find out. Together they reach past half a bar. We can't name the amount yet, because the pieces are different sizes." },
];

function Discover({ guess, onGuess, onDone }: { guess?: string; onGuess: (guess: string) => void; onDone: () => void }) {
  const picked = GUESSES.find((g) => g.id === guess);
  return (
    <Phase id="discover">
      <Say eyebrow="Discover · Step 1 of 6" title="How much chocolate did they eat altogether?" text="Sam ate {1/3} of a bar. Zara ate {1/4} of a bar the same size." />
      <BarsBoard rows={ROWS} cuts={[1, 1]} ruler={false} />
      {!picked ? (
        <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
          <legend className="mb-3 p-0 font-medium text-ink">What do you think? Have a guess.</legend>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {GUESSES.map((g) => (
              <button key={g.id} type="button" onClick={() => { playSound("tap"); onGuess(g.id); }} className="grid min-h-24 place-items-center rounded-2xl border border-line bg-surface p-3 text-body font-medium text-ink transition-colors hover:border-ink-2 hover:bg-sunk">
                {g.f ? <FractionNotation n={g.f.n} d={g.f.d} size="lg" /> : "Not sure yet"}
              </button>
            ))}
          </div>
        </fieldset>
      ) : (
        <Reveal className="flex flex-col gap-4 border-t-2 border-dashed border-line-strong pt-4">
          <div className="flex flex-col gap-2">
            <p className="font-medium text-ink">Together</p>
            <TogetherBar a={SAM} b={ZARA} label="Sam's piece and Zara's piece end to end: more than half a bar" />
          </div>
          {picked.f && (
            <div className="flex flex-col gap-2">
              <p className="flex items-center gap-2.5 font-medium text-ink">
                Your guess <FractionNotation n={picked.f.n} d={picked.f.d} size="md" />
              </p>
              <FractionBar f={picked.f} tone="guess" label={`Your guess: ${picked.f.n} of ${picked.f.d} ${partName(picked.f.d)} shaded`} />
            </div>
          )}
        </Reveal>
      )}
      <Dock action={picked && <Button variant="cta" size="xl" onClick={onDone}>Find out why <ArrowRightIcon size={20} /></Button>}>
        {picked ? <RichText text={picked.verdict} /> : "It's fine not to know yet. Guessing first helps you learn."}
      </Dock>
    </Phase>
  );
}

/* ---------- Explore ---------- */

const ROUNDS: { title: string; text: string; rows: [BarRow, BarRow] }[] = [
  { title: "Make every piece the same size", text: "You can only count pieces together when they match. Cut the bars until they do.", rows: ROWS },
  { title: "Now try {1/2} + {2/5}", text: "Ben ran {1/2} of a lap and Mia ran {2/5} of a lap. Match the pieces, then join them.", rows: [{ f: frac(1, 2), who: "Ben's", name: "Ben" }, { f: frac(2, 5), who: "Mia's", name: "Mia" }] },
];

/** What to say while the child is cutting: nothing given away at first, then where to look, then what to do. */
export function exploreCoach(rows: [BarRow, BarRow], cuts: [number, number], moves: number): string {
  if (moves === 0) return "Press + to cut a bar into smaller pieces.";
  const [a, b] = rows;
  const smallest = lcm(a.f.d, b.f.d);
  if (moves >= 7) return `Try this: cut each of ${a.who} pieces into ${smallest / a.f.d}, and each of ${b.who} pieces into ${smallest / b.f.d}.`;
  const bigger = a.f.d * cuts[0] < b.f.d * cuts[1] ? a : b;
  return `${bigger.who} pieces are bigger. Cut ${bigger.who} bar some more.`;
}

function Round({ index, onNext }: { index: number; onNext: () => void }) {
  const round = ROUNDS[index]!;
  const [a, b] = round.rows;
  const [cuts, setCuts] = useState<[number, number]>([1, 1]);
  const [moves, setMoves] = useState(0);
  const [joined, setJoined] = useState(false);
  const same = piecesMatch(a.f, cuts[0], b.f, cuts[1]);
  const d = a.f.d * cuts[0];
  const [an, bn] = [a.f.n * cuts[0], b.f.n * cuts[1]];
  const last = index === ROUNDS.length - 1;
  const onCut = (row: 0 | 1, cut: number) => {
    if (joined) return;
    const next: [number, number] = row === 0 ? [cut, cuts[1]] : [cuts[0], cut];
    setCuts(next);
    setMoves((n) => n + 1);
    playSound(piecesMatch(a.f, next[0], b.f, next[1]) ? "correct" : "tap");
  };
  const smallest = lcm(a.f.d, b.f.d);
  return (
    <>
      <Say eyebrow={`Explore · Step 2 of 6 · Pair ${index + 1} of ${ROUNDS.length}`} title={round.title} text={round.text} />
      <div className="relative">
        <BarsBoard rows={round.rows} cuts={cuts} onCut={joined ? undefined : onCut} together={joined} />
      </div>
      {!same ? (
        <Dock>{exploreCoach(round.rows, cuts, moves)}</Dock>
      ) : !joined ? (
        <Dock tone="ok" action={<Button variant="cta" size="xl" onClick={() => { setJoined(true); playSound("star"); }}>Join them <ArrowRightIcon size={20} /></Button>}>
          Every piece is the same size now: {partName(d)}. Now you can count them together.
        </Dock>
      ) : (
        <Dock tone="ok" action={<Button variant="cta" size="xl" onClick={onNext}>{last ? "See why it works" : "Try another pair"} <ArrowRightIcon size={20} /></Button>}>
          {an} {partName(d)} and {bn} {partName(d)} make {an + bn} {partName(d)}.{d !== smallest ? ` ${partName(smallest)[0]!.toUpperCase()}${partName(smallest).slice(1)} would work too: that is the smallest size that fits both.` : ""}
        </Dock>
      )}
    </>
  );
}

function Explore({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0);
  return (
    <Phase id={`explore-${index}`}>
      <Round key={index} index={index} onNext={() => (index + 1 < ROUNDS.length ? setIndex(index + 1) : onDone())} />
    </Phase>
  );
}

/* ---------- Understand ---------- */

const LENSES = [
  { id: "picture", label: "Picture" },
  { id: "story", label: "Story" },
  { id: "numbers", label: "Numbers" },
];

const STEPS: { title: string; picture: string; story: string; numbers: string }[] = [
  {
    title: "Different sizes can't be counted together",
    picture: "A third is bigger than a quarter. One third and one quarter are not two of anything yet.",
    story: "Mia reads for {1/3} of an hour, then draws for {1/4} of an hour. How long is that? Thirds and quarters of an hour are different sizes.",
    numbers: "The bottom numbers are different, so the pieces are different sizes. The tops can't be added yet.",
  },
  {
    title: "Find a piece size that fits both",
    picture: "Cut each third into 4 and each quarter into 3. Now every piece is a twelfth.",
    story: "A clock face has 12 five-minute slices. Twelve slices fit thirds and quarters of an hour.",
    numbers: "Look for a number in both times tables. 12 is the first one in the 3s and the 4s.",
  },
  {
    title: "Rename each fraction",
    picture: "The shaded amount has not changed. It just has a new name: {1/3} = {4/12} and {1/4} = {3/12}.",
    story: "{1/3} of an hour is 4 slices: 20 minutes. {1/4} of an hour is 3 slices: 15 minutes.",
    numbers: "Multiply the top and the bottom by the same number. The amount stays the same.",
  },
  {
    title: "Add the tops. The bottom stays",
    picture: "4 twelfths and 3 twelfths make 7 twelfths. The bottom is the size of the pieces, and that has not changed.",
    story: "4 slices and 3 slices make 7 slices: 35 minutes, which is {7/12} of an hour.",
    numbers: "Count the pieces: 4 + 3 = 7. They are still twelfths, so the answer is {7/12}.",
  },
];

/** A clock as 12 five-minute slices: 4 for a third of an hour, then 3 for a quarter. */
function Clock({ step }: { step: number }) {
  const C = 120;
  const R = 92;
  const at = (deg: number, r = R) => `${C + r * Math.sin((deg * Math.PI) / 180)} ${C - r * Math.cos((deg * Math.PI) / 180)}`;
  const wedge = (from: number, to: number) => `M${C} ${C} L${at(from)} A${R} ${R} 0 ${to - from > 180 ? 1 : 0} 1 ${at(to)} Z`;
  return (
    <svg viewBox="0 0 240 240" role="img" aria-label={step === 0 ? "A clock with a third of an hour and then a quarter of an hour shaded" : "A clock in 12 five-minute slices: 4 slices shaded for a third of an hour, then 3 for a quarter"} className="mx-auto block w-full max-w-64">
      <circle cx={C} cy={C} r={R} className="fill-surface" />
      <path d={wedge(0, 120)} className="fill-den" />
      <path d={wedge(120, 210)} className="fill-num" />
      {step >= 1 && Array.from({ length: 12 }, (_, i) => <line key={i} x1={C} y1={C} x2={at(i * 30).split(" ")[0]} y2={at(i * 30).split(" ")[1]} strokeWidth={1.5} className="stroke-ink" opacity={0.7} />)}
      {step === 0 && [0, 120, 210].map((deg) => <line key={deg} x1={C} y1={C} x2={at(deg).split(" ")[0]} y2={at(deg).split(" ")[1]} strokeWidth={3} className="stroke-ink" />)}
      <circle cx={C} cy={C} r={R} fill="none" strokeWidth={4} className="stroke-ink" />
      <circle cx={C} cy={C} r={5} className="fill-ink" />
      {step >= 1 && [12, 3, 6, 9].map((n) => {
        const [x, y] = at(n * 30, R + 15).split(" ").map(Number);
        return <text key={n} x={x} y={y! + 6} textAnchor="middle" className="fill-ink text-label font-semibold">{n}</text>;
      })}
    </svg>
  );
}

const Big = ({ children }: { children: ReactNode }) => <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3 text-heading-1 font-semibold text-ink">{children}</div>;
const Times = ({ k }: { k: number }) => <span className="rounded-full bg-sunk px-3 py-1 text-label font-medium text-ink-2">× {k} top and bottom</span>;

function Numbers({ step }: { step: number }) {
  const table = (n: number) => (
    <p className="flex flex-wrap items-center gap-2 text-title font-bold text-ink-2">
      <span className="w-28 text-label font-medium text-muted">{n} times table</span>
      {[1, 2, 3, 4].slice(0, 12 / n).map((k) => (
        <span key={k} className={`grid size-12 place-items-center rounded-full ${n * k === 12 ? "bg-ink font-semibold text-white" : "bg-sunk"}`}>{n * k}</span>
      ))}
    </p>
  );
  return (
    <div className="flex flex-col items-center gap-6 py-2">
      <Big>
        <FractionNotation n={1} d={3} size="lg" /> + <FractionNotation n={1} d={4} size="lg" />
      </Big>
      {step === 1 && <div className="flex flex-col gap-3">{table(3)}{table(4)}</div>}
      {step >= 2 && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            <Times k={4} />
            <Times k={3} />
          </div>
          <Big>
            = <FractionNotation n={4} d={12} size="lg" /> + <FractionNotation n={3} d={12} size="lg" />
          </Big>
        </div>
      )}
      {step >= 3 && (
        <Big>
          = <FractionNotation n={7} d={12} size="lg" />
        </Big>
      )}
    </div>
  );
}

/** One question on a new pair of numbers, so it checks the idea of renaming and not the example just shown. */
const TURN = {
  options: [1, 2, 6],
  answer: 6,
  wrong: { 1: "The pieces are smaller now, so there must be more of them, not the same number.", 2: "Each half is cut into 6 twelfths, so multiply the top by 6 too." } as Record<number, string>,
};

function Understand({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [lens, setLens] = useState("picture");
  const [turn, setTurn] = useState<number | null>(null);
  const s = STEPS[step]!;
  const last = step === STEPS.length - 1;
  const asking = step === 2 && turn !== TURN.answer;
  return (
    <Phase id="understand">
      <Say eyebrow={`Understand · Step 3 of 6 · Part ${step + 1} of ${STEPS.length}`} title={s.title} />
      <LensSwitch lenses={LENSES} lens={lens} onLens={setLens} />
      <div role="tabpanel" id="lens-panel" aria-labelledby={`lens-${lens}`} className="flex flex-col gap-5">
        {lens === "picture" && <BarsBoard rows={ROWS} cuts={step === 0 ? [1, 1] : [4, 3]} renamed={step >= 2} together={step >= 3} />}
        {lens === "story" && <Clock step={step} />}
        {lens === "numbers" && <Numbers step={step} />}
        <p className="max-w-reading text-body-lg font-semibold text-ink">
          <RichText text={s[lens as "picture" | "story" | "numbers"]} />
        </p>
      </div>
      {step === 2 && (
        <fieldset className="m-0 flex flex-col gap-3 rounded-2xl bg-paper p-4 sm:p-5">
          <legend className="flex items-center gap-2.5 px-2 font-medium text-ink">
            Your turn: <FractionNotation n={1} d={2} size="md" /> = <FractionNotation n="?" d={12} size="md" />
          </legend>
          <div className="flex flex-wrap gap-3">
            {TURN.options.map((o) => (
              <button key={o} type="button" aria-pressed={turn === o} onClick={() => { setTurn(o); playSound(o === TURN.answer ? "correct" : "tryAgain"); }} className={`grid size-14 place-items-center rounded-xl border text-title font-medium transition-colors ${turn === o ? (o === TURN.answer ? "border-ok bg-ok-soft text-ok" : "border-warn bg-warn-soft text-warn") : "border-line-strong bg-surface text-ink hover:border-ink"}`}>
                {o}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      <Dock
        tone={step === 2 && turn !== null ? (turn === TURN.answer ? "ok" : "warn") : "plain"}
        action={
          <>
            {step > 0 && (
              <Button variant="soft" size="xl" onClick={() => setStep(step - 1)} aria-label="Back a step">
                <ArrowLeftIcon size={20} />
              </Button>
            )}
            <Button variant="cta" size="xl" disabled={asking} onClick={() => (last ? onDone() : setStep(step + 1))}>
              {last ? "Start practising" : "Next"} <ArrowRightIcon size={20} />
            </Button>
          </>
        }
      >
        {step === 2 && turn !== null ? (
          turn === TURN.answer ? "Yes: each half is cut into 6, so 1 half is 6 twelfths." : `Not quite. ${TURN.wrong[turn]} Try again.`
        ) : step === 2 ? (
          "Answer the question to go on."
        ) : (
          <span className="flex flex-wrap items-center gap-3">
            <Dots count={STEPS.length} at={step} label={`Step ${step + 1} of ${STEPS.length}`} />
            <span className="text-body text-ink-2">Change the view any time. You stay on this step.</span>
          </span>
        )}
      </Dock>
    </Phase>
  );
}

/* ---------- Help while practising ---------- */

/** The question makers whose two fractions the bars can model; only plain additions get the joined bar. */
const MODELLED = new Set(["f2-add-diff", "f2-add-diff-stretch", "f2-diff-common", "f2-diff-subtract", "f2-diff-apply"]);
const ADDITIONS = new Set(["f2-add-diff", "f2-add-diff-stretch"]);

/** The first two proper fractions with different denominators in a prompt. */
export function fractionsIn(prompt: string): [Fraction, Fraction] | null {
  const all = [...prompt.matchAll(/\{(\d+)\/(\d+)\}/g)].map((m) => frac(Number(m[1]), Number(m[2]))).filter((f) => f.n > 0 && f.n < f.d && f.d <= 12);
  const first = all[0];
  const second = all.find((f) => f.d !== first?.d);
  return first && second ? [first, second] : null;
}

function Aid({ templateKey, prompt, open, labelled }: { templateKey: string; prompt: string; open: boolean; labelled: boolean }) {
  const pair = MODELLED.has(templateKey) ? fractionsIn(prompt) : null;
  const [shown, setShown] = useState(open);
  const [cuts, setCuts] = useState<[number, number]>([1, 1]);
  if (!pair) return null;
  const rows: [BarRow, BarRow] = [
    { f: pair[0], who: "the first", name: "First" },
    { f: pair[1], who: "the second", name: "Second" },
  ];
  return (
    <section aria-label="Fraction bars" className="flex flex-col gap-3">
      <button type="button" aria-expanded={shown} onClick={() => setShown(!shown)} className="inline-flex min-h-11 items-center gap-2.5 self-start rounded-full bg-sunk px-4 text-label font-extrabold text-ink hover:bg-line">
        <span className="flex gap-0.5" aria-hidden>
          <span className="h-3 w-4 rounded-l-sm bg-den" />
          <span className="h-3 w-3 rounded-r-sm bg-num" />
        </span>
        {shown ? "Hide the bars" : "Work it out with bars"}
      </button>
      {shown && <BarsBoard rows={rows} cuts={cuts} onCut={(row, cut) => setCuts(row === 0 ? [cut, cuts[1]] : [cuts[0], cut])} renamed={labelled} together={ADDITIONS.has(templateKey)} togetherLabel={false} slim />}
    </section>
  );
}

const SUM = "{1/3} + {1/4} = {7/12}";
const LOOK_BACK: Record<string, string> = {
  "2/7": `At the start you guessed {2/7}. Now you know the pieces must be the same size first: ${SUM}.`,
  "2/12": `At the start you guessed {2/12}. Now you know to rename both fractions, then add the tops: ${SUM}.`,
  "7/12": `At the start you guessed {7/12}, and you were right. Now you can show why: ${SUM}.`,
  unsure: `At the start you weren't sure. Now you can work it out: ${SUM}.`,
};

export const ADD_DIFFERENT_LESSON: CanvasLesson = {
  Discover,
  Explore,
  Understand,
  Aid,
  lookBack: (guess) => (guess ? (LOOK_BACK[guess] ?? null) : null),
};
