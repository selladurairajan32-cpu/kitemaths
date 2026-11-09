"use client";

import { useState } from "react";
import { ScreenHero } from "@/components/kid/ScreenHero";
import { MathVisual } from "@/topics/kit/visuals";

const NUMS = Array.from({ length: 12 }, (_, i) => i + 1);

/**
 * TT-007: the times-table explorer. Choose any fact 1 × 1 to 12 × 12 to see it as an array, as jumps on a number line
 * and as its fact family; highlight the multiples of any number to see the patterns. Every view is computed from the
 * chosen numbers, so it is right for every value in the grid.
 */
export function FactExplorerScreen() {
  const [pick, setPick] = useState({ a: 7, b: 8 });
  const [multiple, setMultiple] = useState<number | null>(null);
  const { a, b } = pick;
  const p = a * b;
  const multiples = multiple ? NUMS.flatMap((x) => NUMS.map((y) => x * y)).filter((v) => v % multiple === 0).length : 0;

  return (
    <div className="space-y-8">
      <ScreenHero pic="times" titleId="explore-title" title="Explore the tables" line="Tap a fact to see it in three ways. Light up the multiples of a number to find its pattern." />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section aria-labelledby="grid-title" className="card min-w-0 space-y-4 p-4 sm:p-6">
          <h2 id="grid-title" className="text-title font-extrabold">
            Choose a fact
          </h2>
          <div className="overflow-x-auto">
            <table className="mx-auto border-separate border-spacing-0.5 text-label tabular-nums">
              <caption className="sr-only">Times table grid from 1 × 1 to 12 × 12</caption>
              <thead>
                <tr>
                  <th scope="col" className="size-8 text-muted">
                    <span aria-hidden>×</span>
                    <span className="sr-only">Times</span>
                  </th>
                  {NUMS.map((n) => (
                    <th key={n} scope="col" className={`size-8 font-bold ${n === b ? "text-brand-strong" : "text-ink-2"}`}>
                      {n}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {NUMS.map((x) => (
                  <tr key={x}>
                    <th scope="row" className={`size-8 font-bold ${x === a ? "text-brand-strong" : "text-ink-2"}`}>
                      {x}
                    </th>
                    {NUMS.map((y) => {
                      const v = x * y;
                      const chosen = x === a && y === b;
                      const lit = multiple !== null && v % multiple === 0;
                      const inLine = x === a || y === b;
                      return (
                        <td key={y} className="p-0">
                          <button
                            type="button"
                            onClick={() => setPick({ a: x, b: y })}
                            aria-pressed={chosen}
                            aria-label={`${x} × ${y} = ${v}${lit ? `, a multiple of ${multiple}` : ""}`}
                            className={`grid size-8 min-w-8 place-items-center rounded-[8px] font-semibold ${
                              chosen ? "bg-brand text-on-brand" : lit ? "border-2 border-sun-strong bg-sun-soft text-ink" : inLine ? "bg-brand-soft text-ink" : "bg-sunk text-ink-2 hover:bg-line"
                            }`}
                          >
                            {v}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <fieldset>
            <legend className="text-label font-bold text-ink">Light up the multiples of</legend>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {NUMS.map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={multiple === n}
                  onClick={() => setMultiple(multiple === n ? null : n)}
                  className={`min-h-11 min-w-11 rounded-full text-body font-bold ${multiple === n ? "bg-sun-strong text-ink" : "bg-sunk text-ink hover:bg-line"}`}
                >
                  {n}
                </button>
              ))}
            </div>
            {multiple !== null && (
              <p className="mt-2 text-label text-ink-2" aria-live="polite">
                {multiples} of the 144 squares are multiples of {multiple}. Look for the pattern in rows and columns.
              </p>
            )}
          </fieldset>
        </section>

        <section aria-labelledby="fact-title" className="card min-w-0 space-y-5 p-4 sm:p-6" aria-live="polite">
          <h2 id="fact-title" className="text-heading-2 font-extrabold tabular-nums">
            {a} × {b} = {p}
          </h2>
          <div>
            <h3 className="text-label font-bold text-muted">As an array: {a} rows of {b}</h3>
            <div className="mt-2 max-w-full overflow-x-auto">
              <MathVisual spec={{ kind: "array", rows: a, cols: b }} />
            </div>
          </div>
          <div>
            <h3 className="text-label font-bold text-muted">As jumps: {a} jumps of {b}</h3>
            <div className="mt-2 max-w-full overflow-x-auto">
              <MathVisual spec={{ kind: "line", min: 0, max: p, step: b, labelEvery: a > 8 ? 2 : 1, jumps: NUMS.slice(0, a).map((i) => ({ from: (i - 1) * b, to: i * b })) }} />
            </div>
          </div>
          <div>
            <h3 className="text-label font-bold text-muted">The fact family</h3>
            {/* A square number's family has two facts, not four: 7 × 7 = 49 and 49 ÷ 7 = 7. */}
            <ul className="mt-2 grid grid-cols-2 gap-2 text-body font-bold tabular-nums">
              {[...new Set([`${a} × ${b} = ${p}`, `${b} × ${a} = ${p}`, `${p} ÷ ${a} = ${b}`, `${p} ÷ ${b} = ${a}`])].map((f) => (
                <li key={f} className="rounded-[14px] bg-sunk px-3 py-2">
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
