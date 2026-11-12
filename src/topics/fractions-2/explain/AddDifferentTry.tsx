"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { RichText } from "@/components/math/RichText";
import { Button } from "@/components/ui/Button";
import { MOVE, motionOr } from "@/components/explain/motionTokens";
import { sliceMid, slicePath } from "./pizza";

/**
 * D-041 *Try it* for ⅓ + ¼, with pizzas for D-043. Two moves, done by hand:
 * 1. Two pizza cutters (sliders): cut each slice of Sam's third-pizza into more pieces, and each slice of Zara's
 *    quarter-pizza, until the slices are the same size (3 × a = 4 × b, first at twelfths).
 * 2. Drag the 4 + 3 matching slices onto one empty pizza (or tap, or press Enter, on each) to make 7/12.
 * Everything moves on springs and follows the finger; with reduced motion every move is instant. Each slider and slice
 * is a real control, and the result of each move is announced.
 */

const SPRING = { type: "spring", stiffness: 380, damping: 26 } as const;
const TILES = ["b", "b", "b", "b", "o", "o", "o"] as const;
const SIZE = 200;
const C = SIZE / 2;
const R = 88;

/** A pizza cut into `n` slices with the first `shaded` there. */
function Pizza({ n, shaded, outline, label }: { n: number; shaded: number; outline: string; label: string }) {
  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-auto w-full max-w-56" role="img" aria-label={label}>
      {Array.from({ length: n }, (_, k) => (
        <motion.path key={`${n}-${k}`} d={slicePath(C, C, R, n, k)} initial={false} animate={{ opacity: 1 }} fill={k < shaded ? "var(--color-sun)" : "var(--color-surface)"} stroke={k < shaded ? outline : "var(--color-line-strong)"} strokeWidth={k < shaded ? 3 : 1.5} strokeLinejoin="round" />
      ))}
      <circle cx={C} cy={C} r={R} fill="none" stroke="var(--color-ink)" strokeWidth={4} />
    </svg>
  );
}

function Cutter({ who, base, value, onChange, reduce }: { who: "Sam" | "Zara"; base: 3 | 4; value: number; onChange: (n: number) => void; reduce: boolean }) {
  const blue = who === "Sam";
  const slices = base * value;
  const id = `cut-${who.toLowerCase()}`;
  return (
    <div className="flex min-w-0 flex-col items-center gap-3">
      <p className={`text-title font-extrabold ${blue ? "text-brand-strong" : "text-num-strong"}`}>
        {who}: <RichText text={`{1/${base}}`} />
      </p>
      <Pizza n={slices} shaded={value} outline={blue ? "var(--color-brand)" : "var(--color-num)"} label={`${who}'s pizza: ${value} of ${slices} slices`} />
      <motion.p key={slices} initial={reduce ? false : { scale: 1.2 }} animate={{ scale: 1 }} transition={motionOr(reduce, SPRING)} className="text-body font-extrabold text-ink">
        {value} of {slices} slices
      </motion.p>
      <label htmlFor={id} className="text-body font-bold text-ink">
        {who}&apos;s cutter: cut each slice into {value}
      </label>
      <input id={id} type="range" min={1} max={6} step={1} value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-11 w-full max-w-60 cursor-pointer accent-[var(--color-ink)]" aria-valuetext={`${value}: ${slices} slices`} />
    </div>
  );
}

/** A slice as a small picture, for the slices still to place. */
function Wedge({ blue }: { blue: boolean }) {
  return (
    <svg viewBox="0 0 60 60" className="size-12" aria-hidden>
      <path d={slicePath(30, 52, 46, 12, 11)} transform="rotate(15 30 52)" fill="var(--color-sun)" stroke={blue ? "var(--color-brand)" : "var(--color-num)"} strokeWidth={3} strokeLinejoin="round" />
    </svg>
  );
}

export function AddDifferentTry() {
  const reduce = !!useReducedMotion();
  const [a, setA] = useState(1);
  const [b, setB] = useState(1);
  const matched = 3 * a === 4 * b;
  const [placed, setPlaced] = useState<number[]>([]);
  const [note, setNote] = useState("");
  const target = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  const done = placed.length === TILES.length;

  const cutNote = matched ? "" : a === 1 && b === 1 ? "Slide the cutters to cut more slices." : 3 * a > 4 * b ? `${3 * a} slices and ${4 * b} slices: not the same size yet. Cut Zara's pizza more.` : `${3 * a} slices and ${4 * b} slices: not the same size yet. Cut Sam's pizza more.`;
  const place = (i: number) => {
    if (placed.includes(i)) return;
    const next = [...placed, i];
    setPlaced(next);
    setNote(next.length === TILES.length ? "Four twelfths and three twelfths make seven twelfths." : `${next.length} slice${next.length > 1 ? "s" : ""} on the pizza.`);
  };
  const reset = () => { setPlaced([]); setNote(""); };

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="try-cut" className="flex flex-col gap-4">
        <h2 id="try-cut" className="text-title font-extrabold text-ink">1. Cut both pizzas until the slices are the same size</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <Cutter who="Sam" base={3} value={a} onChange={setA} reduce={reduce} />
          <Cutter who="Zara" base={4} value={b} onChange={setB} reduce={reduce} />
        </div>
        <p role="status" className={`min-h-12 rounded-[16px] px-4 py-3 text-body font-bold ${matched ? "bg-ok-soft text-ink" : "bg-sunk text-ink-2"}`}>
          {matched ? `Same size slices: both pizzas have ${3 * a} slices (twelfths). Sam's third is ${a} twelfths and Zara's quarter is ${b} twelfths.` : cutNote}
        </p>
      </section>

      <AnimatePresence initial={false}>
        {matched && (
          <motion.section key="build" aria-labelledby="try-build" initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={motionOr(reduce, MOVE)} className="flex flex-col gap-4">
            <h2 id="try-build" className="text-title font-extrabold text-ink">2. Now add them: put all the slices on one pizza</h2>
            <p className="text-body text-ink-2">Drag each slice onto the pizza, or tap it (or press Enter) to send it there.</p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              <div ref={target} className="w-full max-w-60" role="img" aria-label={`The whole pizza: ${placed.length} of 12 slices`}>
                <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-auto w-full" aria-hidden>
                  {Array.from({ length: 12 }, (_, k) => {
                    const tile = placed[k];
                    return (
                      <path key={k} d={slicePath(C, C, R, 12, k)} fill={tile !== undefined ? "var(--color-sun)" : k === placed.length && !done ? "var(--color-ok-soft)" : "var(--color-surface)"} stroke={tile !== undefined ? (TILES[tile] === "b" ? "var(--color-brand)" : "var(--color-num)") : "var(--color-line-strong)"} strokeWidth={tile !== undefined ? 3 : 1.5} strokeLinejoin="round" />
                    );
                  })}
                  <circle cx={C} cy={C} r={R} fill="none" stroke="var(--color-ink)" strokeWidth={4} />
                  {placed.map((_, k) => { const [x, y] = sliceMid(C, C, R, 12, k, 0.66); return <circle key={k} cx={x} cy={y} r={5} fill="var(--color-kite-red)" />; })}
                </svg>
              </div>
              {!done && (
                <div role="group" className="grid grid-cols-4 gap-3" aria-label="Slices to place">
                  {TILES.map((c, i) =>
                    placed.includes(i) ? (
                      <span key={i} className="size-16" aria-hidden />
                    ) : (
                      <motion.button
                        key={i}
                        type="button"
                        drag={!reduce}
                        dragSnapToOrigin
                        dragElastic={0.6}
                        whileHover={reduce ? undefined : { scale: 1.08 }}
                        whileDrag={{ scale: 1.15, rotate: -6, zIndex: 20 }}
                        transition={SPRING}
                        onDragStart={() => { dragged.current = true; }}
                        onDragEnd={(_, info) => {
                          const r = target.current?.getBoundingClientRect();
                          const x = info.point.x - window.scrollX;
                          const y = info.point.y - window.scrollY;
                          if (r && x > r.left && x < r.right && y > r.top && y < r.bottom) place(i);
                          else setNote("Drop it on the pizza.");
                          setTimeout(() => { dragged.current = false; }, 0);
                        }}
                        onClick={() => { if (!dragged.current) place(i); }}
                        className="grid size-16 cursor-grab touch-none place-items-center rounded-[16px] border-2 border-line bg-surface shadow-[var(--shadow-card)] active:cursor-grabbing"
                        aria-label={`${c === "b" ? "Sam's" : "Zara's"} slice, one twelfth: put it on the pizza`}
                      >
                        <Wedge blue={c === "b"} />
                      </motion.button>
                    ),
                  )}
                </div>
              )}
            </div>
            <p role="status" className={`min-h-12 rounded-[16px] px-4 py-3 text-body font-bold ${done ? "bg-ok-soft text-ink" : "bg-sunk text-ink-2"}`}>
              {note || "7 slices to place."}
            </p>
            {done && (
              <motion.div initial={reduce ? false : { scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={motionOr(reduce, SPRING)} className="flex flex-col items-center gap-3">
                <p className="display text-center text-heading-2">
                  <RichText text="{4/12} + {3/12} = **{7/12}**" />
                </p>
                <p className="text-center text-body font-bold text-ok">So one third plus one quarter is seven twelfths. You did it with your own hands!</p>
                <Button variant="secondary" onClick={reset}>Do it again</Button>
              </motion.div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
