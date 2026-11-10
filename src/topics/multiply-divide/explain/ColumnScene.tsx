"use client";

import { motion, type PanInfo } from "motion/react";
import { useId, useRef, type ReactNode } from "react";
import { Chip } from "@/components/explain/BaseTen";
import { CountUp } from "@/components/explain/CountUp";
import { APPEAR, MOVE, motionOr } from "@/components/explain/motionTokens";
import type { SceneProps } from "@/components/explain/Stage";
import { useInstant, usePhases } from "@/components/explain/timeline";
import type { LongMultiplication, ShortRow } from "@/maths/long-multiplication";
import { toneFor, TOTAL } from "./tones";

/**
 * Chapter 3 · Numbers (column method), for a 2-digit a and b from 11 to 19. Steps: 0 set out · 1 the ones row, where
 * the ones are drawn as dots and ten of them bundle into the carried 1 · 2 the tens row, where the digits step one
 * place left and the child drops the 0 into the gap · 3 add the rows, with the carry.
 */

const CELL_W = 52; // px; one column
const PLACE = ["O", "T", "H", "Th"];
const digitsOf = (x: number) => String(x).split("").reverse().map(Number); // ones first

/** Text colour for a digit of the second number, matching its row everywhere. */
const inkFor = (place: number) => (place === 0 ? "text-num-strong" : place === 1 ? "text-den-strong" : "text-ok");

function Cell({ children, ring, hole, className = "" }: { children?: ReactNode; ring?: boolean; hole?: boolean; className?: string }) {
  return (
    <div
      className={`relative grid h-14 place-items-center rounded-[12px] text-heading-1 font-extrabold ${ring ? "ring-4 ring-warn-bright" : ""} ${hole ? "border-[3px] border-dashed border-warn-bright bg-warn-soft" : ""} ${className}`}
      style={{ width: CELL_W }}
    >
      {children}
    </div>
  );
}

/** A row of cells, places from the left (biggest) to ones, then an optional tag. */
function Row({ cols, cell, tag, className = "" }: { cols: number; cell: (place: number) => ReactNode; tag?: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex">{Array.from({ length: cols }, (_, i) => cell(cols - 1 - i))}</div>
      <div className="min-w-[7.5rem]">{tag}</div>
    </div>
  );
}

const Rule = ({ cols }: { cols: number }) => <div className="h-1 rounded-full bg-ink" style={{ width: cols * CELL_W }} />;

function Pop({ children, delay = 0, from = { scale: 0.4 } }: { children: ReactNode; delay?: number; from?: Record<string, number> }) {
  const instant = useInstant();
  return (
    <motion.span className="inline-block" initial={instant ? false : { opacity: 0, ...from }} animate={{ opacity: 1, scale: 1, x: 0, y: 0 }} transition={motionOr(instant, { ...MOVE, delay })}>
      {children}
    </motion.span>
  );
}

function Tag({ r, a }: { r: ShortRow; a: number }) {
  return (
    <Chip tone={toneFor(r.multiplier)}>
      {a} × {r.multiplier}
    </Chip>
  );
}

interface BoardState {
  ring?: { row: "a" | "b"; place: number }[];
  ones?: (place: number) => ReactNode | undefined; // override cells of the ones row
  tens?: (place: number) => ReactNode | undefined;
  showOnes: boolean;
  showTens: boolean;
  hole?: number;
  sum?: (place: number) => ReactNode | undefined;
  sumGlow?: boolean;
  onesTag?: boolean;
  tensTag?: boolean;
  places?: boolean;
}

/** The written layout. Rows not yet worked are empty; overrides draw the row being worked. */
function Board({ m, s }: { m: LongMultiplication; s: BoardState }) {
  const cols = Math.max(String(m.total).length, String(m.a).length, String(m.b).length + 1);
  const a = digitsOf(m.a);
  const b = digitsOf(m.b);
  const [onesRow, tensRow] = m.rows as [ShortRow, ShortRow];
  const ringed = (row: "a" | "b", place: number) => !!s.ring?.some((r) => r.row === row && r.place === place);
  const written = (r: ShortRow) => digitsOf(r.product);
  const carryAbove = (r: ShortRow, place: number) => {
    const c = r.columns[place - r.zeros]?.carryIn ?? 0;
    return c > 0 ? <span className={`absolute -top-1 left-1 text-label font-extrabold ${inkFor(0)}`}>{c}</span> : null;
  };
  return (
    <div className="flex flex-col items-start gap-1.5">
      <Row
        cols={cols}
        className={s.places ? "" : "opacity-60"}
        cell={(p) => (
          <div key={p} className={`text-center text-label font-extrabold ${s.places ? "text-ink" : "text-muted"}`} style={{ width: CELL_W }}>
            {PLACE[p]}
          </div>
        )}
      />
      <Row cols={cols} cell={(p) => <Cell key={p} ring={ringed("a", p)}>{a[p] ?? ""}</Cell>} />
      <Row
        cols={cols}
        cell={(p) => (
          <Cell key={p} ring={ringed("b", p)} className={p < b.length ? inkFor(p) : "text-ink-2"}>
            {p < b.length ? b[p] : p === b.length ? "×" : ""}
          </Cell>
        )}
      />
      <Rule cols={cols} />
      <Row
        cols={cols}
        cell={(p) => (
          <Cell key={p} className="text-ink">
            {s.ones?.(p) ?? (s.showOnes && p < written(onesRow).length ? (
              <>
                {carryAbove(onesRow, p)}
                {written(onesRow)[p]}
              </>
            ) : null)}
          </Cell>
        )}
        tag={s.onesTag ? <Tag r={onesRow} a={m.a} /> : null}
      />
      <Row
        cols={cols}
        cell={(p) => (
          <Cell key={p} hole={s.hole === p} className={p === 0 ? inkFor(1) : "text-ink"}>
            {s.tens?.(p) ?? (s.showTens && p < written(tensRow).length ? written(tensRow)[p] : null)}
          </Cell>
        )}
        tag={s.tensTag ? <Tag r={tensRow} a={m.a} /> : null}
      />
      <Rule cols={cols} />
      <Row cols={cols} className={`rounded-[14px] transition-colors ${s.sumGlow ? "bg-ok-soft" : ""}`} cell={(p) => <Cell key={p} className="text-ok">{s.sum?.(p) ?? null}</Cell>} />
    </div>
  );
}

/* Step 0: set out the sum. */
function SetOut({ m }: { m: LongMultiplication }) {
  return <Board m={m} s={{ showOnes: false, showTens: false, places: true }} />;
}

/* Step 1: multiply by the ones digit. The ones are dots; ten of them bundle into the carried 1. */
function OnesRow({ m }: { m: LongMultiplication }) {
  const instant = useInstant();
  const r = m.rows[0]!;
  const aOnes = m.a % 10;
  const aTens = Math.floor(m.a / 10) % 10;
  const dots = aOnes * r.digit;
  const bundles = Math.floor(dots / 10);
  const tensValue = aTens * r.digit;
  const carry = r.columns[1]?.carryIn ?? 0;
  const phase = usePhases([500, 700, 1100, 700, 800, 900, 400]);
  const ring = phase >= 5 ? [{ row: "a" as const, place: 1 }, { row: "b" as const, place: 0 }] : phase >= 1 ? [{ row: "a" as const, place: 0 }, { row: "b" as const, place: 0 }] : [];

  const onesCell = () => {
    if (phase < 2) return undefined;
    if (phase >= 4) return <Pop>{r.columns[0]!.written}</Pop>;
    return (
      <span className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${aOnes}, 7px)` }} aria-label={`${dots} ones`}>
        {Array.from({ length: dots }, (_, i) => {
          const bundled = phase >= 3 && i < bundles * 10;
          return (
            <motion.span
              key={i}
              className={`block size-[7px] rounded-full ${bundled ? "bg-warn-bright" : "bg-num"}`}
              initial={instant ? false : { scale: 0 }}
              animate={bundled ? { scale: [1, 1.3, 0], x: -CELL_W * 0.7, y: -18 } : { scale: 1 }}
              transition={motionOr(instant, bundled ? { duration: 0.8, ease: "easeInOut" } : { ...MOVE, delay: i * 0.04 })}
            />
          );
        })}
      </span>
    );
  };
  const tensCell = () => {
    if (phase < 3 || (phase < 5 && carry === 0)) return undefined;
    return (
      <>
        {carry > 0 && phase >= 3 && (
          <motion.span
            className={`absolute -top-1 left-1 text-label font-extrabold ${inkFor(0)}`}
            initial={instant ? false : { x: CELL_W * 0.7, y: 20, scale: 1.8, opacity: 0 }}
            animate={{ x: 0, y: 0, scale: 1, opacity: phase >= 6 ? 0.55 : 1 }}
            transition={motionOr(instant, { ...MOVE, delay: 0.5 })}
          >
            {carry}
          </motion.span>
        )}
        {phase >= 5 && <Pop>{phase >= 6 ? <CountUp from={tensValue} value={tensValue + carry} seconds={0.6} /> : tensValue}</Pop>}
      </>
    );
  };
  return (
    <div className="flex flex-col items-center gap-3">
      <Board m={m} s={{ showOnes: false, showTens: false, ring, ones: (p) => (p === 0 ? onesCell() : p === 1 ? tensCell() : undefined), onesTag: phase >= 7 }} />
      <div className="flex min-h-10 flex-wrap justify-center gap-2">
        {phase >= 2 && phase < 5 && (
          <Chip tone={toneFor(1)}>
            {aOnes} × {r.digit} = {dots} ones{bundles > 0 && phase >= 3 ? `: ${bundles * 10} make a ten` : ""}
          </Chip>
        )}
        {phase >= 5 && phase < 7 && (
          <Chip tone={toneFor(1)}>
            {aTens} × {r.digit} = {tensValue} tens{carry ? `, + ${carry} = ${tensValue + carry}` : ""}
          </Chip>
        )}
        {phase >= 7 && <Chip tone={TOTAL}>= {r.product}</Chip>}
      </div>
    </div>
  );
}

/* Step 2: multiply by the ten. The digits step one place left; the child drops the 0 into the gap. */
function TensRow({ m, done, onTaskDone }: { m: LongMultiplication; done: boolean; onTaskDone: () => void }) {
  const instant = useInstant();
  const zeroId = useId();
  const hole = useRef<HTMLDivElement>(null);
  const phase = usePhases([400, 900, 700]);
  const a = digitsOf(m.a);
  const placed = done && phase >= 3;
  const ready = phase >= 3;

  const tensCell = (p: number) => {
    if (phase < 1) return undefined;
    const stepped = phase >= 2;
    if (p === 0) {
      return placed ? (
        <motion.span layoutId={zeroId} className={`inline-block ${inkFor(1)}`} transition={motionOr(instant, MOVE)}>
          0
        </motion.span>
      ) : (
        <span ref={hole} className="block size-full" aria-label="Empty ones place" />
      );
    }
    const digit = stepped ? a[p - 1] : undefined;
    if (digit === undefined) return undefined;
    return (
      <motion.span className="inline-block" initial={instant ? false : { x: CELL_W, opacity: 1 }} animate={{ x: 0 }} transition={motionOr(instant, { ...MOVE, delay: (a.length - p) * 0.12 })}>
        {digit}
      </motion.span>
    );
  };
  const copied = (p: number) => (phase === 1 && p < a.length ? <Pop from={{ y: -60, scale: 1 }}>{a[p]}</Pop> : undefined);
  const onDragEnd = (_: unknown, info: PanInfo) => {
    const box = hole.current?.getBoundingClientRect();
    if (!box) return;
    const x = info.point.x - window.scrollX;
    const y = info.point.y - window.scrollY;
    if (x >= box.left - 20 && x <= box.right + 20 && y >= box.top - 20 && y <= box.bottom + 20) onTaskDone();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Board
        m={m}
        s={{
          showOnes: true,
          showTens: false,
          places: true,
          onesTag: true,
          ring: phase >= 1 && !placed ? [{ row: "b", place: 1 }] : [],
          hole: phase >= 2 && !placed ? 0 : undefined,
          tens: (p) => (phase === 1 ? copied(p) : tensCell(p)),
          tensTag: placed,
        }}
      />
      <div className="flex min-h-14 flex-wrap items-center justify-center gap-3">
        {ready && !placed && (
          <>
            <motion.button
              type="button"
              layoutId={zeroId}
              drag={!instant}
              dragSnapToOrigin
              whileDrag={{ scale: 1.15 }}
              onDragEnd={onDragEnd}
              onClick={onTaskDone}
              aria-label="Put a 0 in the ones place"
              className="grid size-14 cursor-grab touch-none place-items-center rounded-[14px] border-2 border-den bg-den-soft text-heading-1 font-extrabold text-den-strong shadow-[var(--shadow-card)]"
            >
              0
            </motion.button>
            <span className="text-lg font-bold text-ink-2">Drag the 0 into the gap, or tap it.</span>
          </>
        )}
        {placed && (
          <Chip tone={toneFor(10)} delay={0.3}>
            Digits moved one place: {m.a} × 10 = {m.a * 10}
          </Chip>
        )}
      </div>
    </div>
  );
}

/* Step 3: add the two rows, column by column, with the carry. */
function AddRows({ m }: { m: LongMultiplication }) {
  const instant = useInstant();
  const phase = usePhases([...m.sum.map(() => 800), 500]);
  const sumCell = (p: number) => {
    const col = m.sum[p];
    if (!col || phase < p + 1) return undefined;
    return (
      <>
        {col.carryIn > 0 && (
          <motion.span className="absolute -top-1 left-1 text-label font-extrabold text-ok" initial={instant ? false : { x: CELL_W * 0.7, y: 18, scale: 1.6, opacity: 0 }} animate={{ x: 0, y: 0, scale: 1, opacity: 1 }} transition={motionOr(instant, MOVE)}>
            {col.carryIn}
          </motion.span>
        )}
        <Pop delay={col.carryIn ? 0.3 : 0}>{col.written}</Pop>
      </>
    );
  };
  const glow = phase > m.sum.length;
  return (
    <div className="flex flex-col items-center gap-3">
      <Board m={m} s={{ showOnes: true, showTens: true, onesTag: true, tensTag: true, sum: sumCell, sumGlow: glow }} />
      <div className="flex min-h-10 justify-center">
        {glow && (
          <motion.div initial={instant ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={motionOr(instant, APPEAR)}>
            <Chip tone={TOTAL}>
              {m.a} × {m.b} = {m.total}
            </Chip>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export function ColumnScene({ m, step, done, onTaskDone }: SceneProps & { m: LongMultiplication }) {
  switch (step) {
    case 0:
      return <SetOut m={m} />;
    case 1:
      return <OnesRow m={m} />;
    case 2:
      return <TensRow m={m} done={done} onTaskDone={onTaskDone} />;
    default:
      return <AddRows m={m} />;
  }
}
