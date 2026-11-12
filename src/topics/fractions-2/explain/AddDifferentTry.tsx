"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { RichText } from "@/components/math/RichText";
import { Button } from "@/components/ui/Button";
import { MOVE, motionOr } from "@/components/explain/motionTokens";

/**
 * D-041 *Try it* for ⅓ + ¼. Two moves, done by hand:
 * 1. Cut the third into rows and the quarter into columns with two sliders, until both have pieces of the same size
 *    (3 × rows = 4 × columns, first at twelfths).
 * 2. Drag the 4 blue and 3 orange twelfths into one whole (or tap or press Enter on each), to make 7/12.
 * Everything moves on springs and follows the finger; with reduced motion every move is instant. Each slider and piece
 * is a real control, and the result of each move is announced.
 */

const SPRING = { type: "spring", stiffness: 380, damping: 26 } as const;
const TILES = ["b", "b", "b", "b", "o", "o", "o"] as const;

function Bar({ kind, cuts, reduce }: { kind: "third" | "quarter"; cuts: number; reduce: boolean }) {
  const blue = kind === "third";
  const spring = motionOr(reduce, SPRING);
  return (
    <div className="relative aspect-[3/2.5] w-full max-w-72 overflow-hidden rounded-[14px] border-4 border-ink bg-surface" aria-hidden>
      <div className={`absolute ${blue ? "inset-y-0 left-0 w-1/3 bg-brand" : "inset-x-0 top-0 h-1/4 bg-num"}`} />
      {blue
        ? [1, 2].map((i) => <div key={`f${i}`} className="absolute inset-y-0 w-1 -translate-x-1/2 bg-ink" style={{ left: `${(i / 3) * 100}%` }} />)
        : [1, 2, 3].map((i) => <div key={`f${i}`} className="absolute inset-x-0 h-1 -translate-y-1/2 bg-ink" style={{ top: `${(i / 4) * 100}%` }} />)}
      {[1, 2, 3, 4, 5].map((i) => {
        const on = i < cuts;
        const pos = `${(i / cuts) * 100}%`;
        return blue ? (
          <motion.div key={i} className="absolute inset-x-0 h-[3px] origin-left -translate-y-1/2 bg-ink" initial={false} animate={{ scaleX: on ? 1 : 0, opacity: on ? 1 : 0, top: on ? pos : "100%" }} transition={spring} />
        ) : (
          <motion.div key={i} className="absolute inset-y-0 w-[3px] origin-top -translate-x-1/2 bg-ink" initial={false} animate={{ scaleY: on ? 1 : 0, opacity: on ? 1 : 0, left: on ? pos : "100%" }} transition={spring} />
        );
      })}
    </div>
  );
}

function Cutter({ kind, value, onChange, reduce }: { kind: "third" | "quarter"; value: number; onChange: (n: number) => void; reduce: boolean }) {
  const blue = kind === "third";
  const pieces = (blue ? 3 : 4) * value;
  const id = `cut-${kind}`;
  return (
    <div className="flex min-w-0 flex-col items-center gap-3">
      <Bar kind={kind} cuts={value} reduce={reduce} />
      <motion.p key={pieces} initial={reduce ? false : { scale: 1.2 }} animate={{ scale: 1 }} transition={motionOr(reduce, SPRING)} className={`text-title font-extrabold ${blue ? "text-brand-strong" : "text-num-strong"}`}>
        {value} of {pieces} pieces shaded
      </motion.p>
      <label htmlFor={id} className="text-body font-bold text-ink">
        {blue ? "Rows across the third" : "Columns down the quarter"}: {value}
      </label>
      <input id={id} type="range" min={1} max={6} step={1} value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-11 w-full max-w-72 cursor-pointer accent-[var(--color-ink)]" aria-valuetext={`${value} ${blue ? "rows" : "columns"}: ${pieces} pieces`} />
    </div>
  );
}

export function AddDifferentTry() {
  const reduce = !!useReducedMotion();
  const [rows, setRows] = useState(1);
  const [cols, setCols] = useState(1);
  const matched = 3 * rows === 4 * cols;
  const [placed, setPlaced] = useState<number[]>([]);
  const [note, setNote] = useState("");
  const target = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  const done = placed.length === TILES.length;

  const cutNote = matched ? "" : rows === 1 && cols === 1 ? "Slide to cut." : 3 * rows > 4 * cols ? `${3 * rows} pieces and ${4 * cols} pieces: not the same size yet. Try more columns on the quarter.` : `${3 * rows} pieces and ${4 * cols} pieces: not the same size yet. Try more rows on the third.`;
  const place = (i: number) => {
    if (placed.includes(i)) return;
    const next = [...placed, i];
    setPlaced(next);
    setNote(next.length === TILES.length ? "Four twelfths and three twelfths make seven twelfths." : `${next.length} twelfth${next.length > 1 ? "s" : ""} placed.`);
  };
  const reset = () => { setPlaced([]); setNote(""); };

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="try-cut" className="flex flex-col gap-4">
        <h2 id="try-cut" className="text-title font-extrabold text-ink">1. Cut both until the pieces are the same size</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <Cutter kind="third" value={rows} onChange={setRows} reduce={reduce} />
          <Cutter kind="quarter" value={cols} onChange={setCols} reduce={reduce} />
        </div>
        <p role="status" className={`min-h-12 rounded-[16px] px-4 py-3 text-body font-bold ${matched ? "bg-ok-soft text-ink" : "bg-sunk text-ink-2"}`}>
          {matched ? `Same size pieces: both wholes have ${3 * rows} equal pieces (twelfths). One third is ${rows} twelfths and one quarter is ${cols} twelfths.` : cutNote}
        </p>
      </section>

      <AnimatePresence initial={false}>
        {matched && (
          <motion.section key="build" aria-labelledby="try-build" initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={motionOr(reduce, MOVE)} className="flex flex-col gap-4">
            <h2 id="try-build" className="text-title font-extrabold text-ink">2. Now add them: put the pieces into one whole</h2>
            <p className="text-body text-ink-2">Drag each piece onto the grid, or tap it (or press Enter) to send it there.</p>
            <div className="flex flex-wrap items-start justify-center gap-6">
              <div ref={target} className="grid w-full max-w-72 grid-cols-3 grid-rows-4 overflow-hidden rounded-[14px] border-4 border-ink bg-surface" style={{ aspectRatio: "3 / 2.5" }} aria-label={`The whole: ${placed.length} of 12 twelfths filled`} role="img">
                {Array.from({ length: 12 }, (_, k) => {
                  const tile = placed[k];
                  return (
                    <div key={k} className={`relative border-ink ${k % 3 !== 2 ? "border-r-[3px]" : ""} ${k < 9 ? "border-b-[3px]" : ""} ${k === placed.length && !done ? "bg-ok-soft" : ""}`}>
                      {tile !== undefined && <motion.div layoutId={reduce ? undefined : `tile-${tile}`} transition={SPRING} className={`absolute inset-0 ${TILES[tile] === "b" ? "bg-brand" : "bg-num"}`} />}
                    </div>
                  );
                })}
              </div>
              {!done && <div role="group" className="grid grid-cols-2 gap-3" aria-label="Pieces to place">
                {TILES.map((c, i) =>
                  placed.includes(i) ? (
                    <span key={i} className="h-12 w-20" aria-hidden />
                  ) : (
                    <motion.button
                      key={i}
                      type="button"
                      layoutId={reduce ? undefined : `tile-${i}`}
                      drag={!reduce}
                      dragSnapToOrigin
                      dragElastic={0.6}
                      whileHover={reduce ? undefined : { scale: 1.06 }}
                      whileDrag={{ scale: 1.12, rotate: -3, zIndex: 20 }}
                      transition={SPRING}
                      onDragStart={() => { dragged.current = true; }}
                      onDragEnd={(_, info) => {
                        const r = target.current?.getBoundingClientRect();
                        const x = info.point.x - window.scrollX;
                        const y = info.point.y - window.scrollY;
                        if (r && x > r.left && x < r.right && y > r.top && y < r.bottom) place(i);
                        else setNote("Drop it on the grid.");
                        setTimeout(() => { dragged.current = false; }, 0);
                      }}
                      onClick={() => { if (!dragged.current) place(i); }}
                      className={`h-12 w-20 cursor-grab touch-none rounded-[10px] text-label font-extrabold text-on-brand shadow-[var(--shadow-card)] active:cursor-grabbing ${c === "b" ? "bg-brand" : "bg-num-strong"}`}
                      aria-label={`${c === "b" ? "Blue" : "Orange"} twelfth: place it in the whole`}
                    >
                      1/12
                    </motion.button>
                  ),
                )}
              </div>}
            </div>
            <p role="status" className={`min-h-12 rounded-[16px] px-4 py-3 text-body font-bold ${done ? "bg-ok-soft text-ink" : "bg-sunk text-ink-2"}`}>
              {note || "7 pieces to place."}
            </p>
            {done && (
              <motion.div initial={reduce ? false : { scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={motionOr(reduce, SPRING)} className="flex flex-col items-center gap-3">
                <p className="display text-center text-heading-2">
                  <RichText text="{4/12} + {3/12} = **{7/12}**" />
                </p>
                <p className="text-center text-body font-bold text-ok"><RichText text="So {1/3} + {1/4} = {7/12}. You did it with your own hands!" /></p>
                <Button variant="secondary" onClick={reset}>Do it again</Button>
              </motion.div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
