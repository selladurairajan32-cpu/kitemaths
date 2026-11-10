"use client";

import { motion } from "motion/react";
import type { KeyboardEvent } from "react";
import { Arrive, Chip, Cube, Flat, JoinRing, NEUTRAL, Rod, type Tone } from "@/components/explain/BaseTen";
import { CountUp } from "@/components/explain/CountUp";
import { APPEAR, MOVE, motionOr } from "@/components/explain/motionTokens";
import type { SceneProps } from "@/components/explain/Stage";
import { useInstant, usePhases } from "@/components/explain/timeline";
import { Button } from "@/components/ui/Button";
import { regroup, rowsAsBlocks, type LongMultiplication } from "@/maths/long-multiplication";
import { toneFor, TOTAL } from "./tones";

/**
 * Chapter 1 · Blocks (concrete). a × b with base-ten blocks, for a 2-digit a and b from 11 to 19 (one ten and some
 * ones). Each row is a: tens rods then ones cubes, so the rows already form the a × b rectangle of Chapter 2.
 * Steps: 0 one row · 1 b rows · 2 split into 10 rows and the rest · 3 ten rods join into hundreds, ten ones into tens ·
 * 4 the child swaps ten ones for a ten (the carry) · 5 everything together.
 */

const U = 12; // one cube
const GX = 5; // space between rods in a row
const SPLIT = 24; // gap that opens between the 10 rows and the rest

function useGeometry(m: LongMultiplication) {
  const tA = Math.floor(m.a / 10);
  const oA = m.a % 10;
  const rodX = (k: number) => k * (10 * U + GX);
  const cubeX = (j: number) => tA * (10 * U + GX) + j * (U + 2);
  const width = cubeX(oA);
  const rowY = (r: number, split: boolean) => r * U + (split && r >= 10 ? SPLIT : 0);
  const bottomEnd = rowY(m.b - 1, true) + U;
  const newRowY = bottomEnd + 12;
  const height = newRowY + U;
  return { tA, oA, rodX, cubeX, width, rowY, newRowY, height };
}

const TOP = toneFor(10);
const BOTTOM = toneFor(4);

/** One row of a: its rods and cubes at a given y, in a tone. */
function Row({ g, y, tone }: { g: ReturnType<typeof useGeometry>; y: number; tone: Tone }) {
  return (
    <g>
      {Array.from({ length: g.tA }, (_, k) => (
        <Rod key={`r${k}`} x={g.rodX(k)} y={y} u={U} tone={tone} />
      ))}
      {Array.from({ length: g.oA }, (_, j) => (
        <Cube key={`c${j}`} x={g.cubeX(j)} y={y} u={U} tone={tone} />
      ))}
    </g>
  );
}

function Frame({ g, children, label }: { g: ReturnType<typeof useGeometry>; children: React.ReactNode; label: string }) {
  return (
    <svg viewBox={`-8 -8 ${g.width + 16} ${g.height + 16}`} className="h-auto w-full max-w-[400px]" role="img" aria-label={label}>
      {children}
    </svg>
  );
}

function Chips({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-10 flex-wrap items-center justify-center gap-2">{children}</div>;
}

/* Step 0: one row. Rods drop in, then cubes. */
function OneRow({ m }: { m: LongMultiplication }) {
  const g = useGeometry(m);
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <svg viewBox={`-6 -20 ${g.width + 12} ${U + 40}`} className="h-auto w-full max-w-[460px]" role="img" aria-label={`One row: ${g.tA} tens and ${g.oA} ones`}>
        {Array.from({ length: g.tA }, (_, k) => (
          <Arrive key={`r${k}`} delay={0.2 + k * 0.35} from={{ y: -18 }}>
            <Rod x={g.rodX(k)} y={0} u={U} tone={NEUTRAL} />
          </Arrive>
        ))}
        {Array.from({ length: g.oA }, (_, j) => (
          <Arrive key={`c${j}`} delay={0.2 + g.tA * 0.35 + j * 0.18} from={{ y: -18 }}>
            <Cube x={g.cubeX(j)} y={0} u={U} tone={NEUTRAL} />
          </Arrive>
        ))}
      </svg>
      <Chips>
        <Chip tone={NEUTRAL} delay={0.9}>
          {g.tA} tens
        </Chip>
        <Chip tone={NEUTRAL} delay={1.1}>
          {g.oA} ones
        </Chip>
        <Chip tone={TOTAL} delay={1.3}>
          = {m.a}
        </Chip>
      </Chips>
    </div>
  );
}

/* Step 1: the row is stamped down b times. */
function Stamp({ m }: { m: LongMultiplication }) {
  const g = useGeometry(m);
  const instant = useInstant();
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <Frame g={g} label={`${m.b} rows of ${m.a}`}>
        {Array.from({ length: m.b }, (_, r) => (
          <g key={r} transform={`translate(0 ${g.rowY(r, false)})`}>
            <motion.g initial={instant || r === 0 ? false : { y: -U, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={motionOr(instant, { ...MOVE, delay: 0.2 + r * 0.09 })}>
              <Row g={g} y={0} tone={NEUTRAL} />
            </motion.g>
          </g>
        ))}
      </Frame>
      <Chips>
        <Chip tone={TOTAL}>
          <CountUp value={m.b} from={1} seconds={0.8} /> rows of {m.a}
        </Chip>
      </Chips>
    </div>
  );
}

/** The grid after the split, with the top 10 rows' state and the bottom rows' state drawn by the caller. */
function SplitGrid({ m, top, bottom, label, extra }: { m: LongMultiplication; top: React.ReactNode; bottom: React.ReactNode; label: string; extra?: React.ReactNode }) {
  const g = useGeometry(m);
  return (
    <Frame g={g} label={label}>
      {top}
      <g transform={`translate(0 ${SPLIT})`}>{bottom}</g>
      {extra}
    </Frame>
  );
}

const topRows = (g: ReturnType<typeof useGeometry>, tone: Tone) => Array.from({ length: 10 }, (_, r) => <Row key={r} g={g} y={r * U} tone={tone} />);
const bottomRows = (g: ReturnType<typeof useGeometry>, m: LongMultiplication, tone: Tone, cubes = true) =>
  Array.from({ length: m.b - 10 }, (_, i) => (
    <g key={i}>
      {Array.from({ length: g.tA }, (_, k) => (
        <Rod key={`r${k}`} x={g.rodX(k)} y={(10 + i) * U} u={U} tone={tone} />
      ))}
      {cubes &&
        Array.from({ length: g.oA }, (_, j) => (
          <Cube key={`c${j}`} x={g.cubeX(j)} y={(10 + i) * U} u={U} tone={tone} />
        ))}
    </g>
  ));

/* Step 2: the rows split into 10 and the rest, and take their colours. */
function Split({ m }: { m: LongMultiplication }) {
  const g = useGeometry(m);
  const instant = useInstant();
  const rest = m.b - 10;
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <Frame g={g} label={`${m.b} rows split into 10 rows and ${rest} rows`}>
        <motion.g initial={instant ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={motionOr(instant, { ...APPEAR, delay: 0.6 })}>
          {topRows(g, TOP)}
        </motion.g>
        <motion.g initial={instant ? false : { y: 0 }} animate={{ y: SPLIT }} transition={motionOr(instant, { ...MOVE, delay: 0.2 })}>
          <motion.g initial={instant ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={motionOr(instant, { ...APPEAR, delay: 0.8 })}>
            {bottomRows(g, m, BOTTOM)}
          </motion.g>
        </motion.g>
      </Frame>
      <Chips>
        <Chip tone={TOP} delay={0.9}>
          10 rows
        </Chip>
        <Chip tone={BOTTOM} delay={1.1}>
          {rest} rows
        </Chip>
      </Chips>
    </div>
  );
}

/** The top 10 rows with `flats` rod columns joined into hundreds and, if `rods`, the cube columns joined into tens. */
function TopFused({ g, flats, rods }: { g: ReturnType<typeof useGeometry>; flats: number; rods: boolean }) {
  return (
    <g>
      {Array.from({ length: g.tA }, (_, k) =>
        k < flats ? (
          <g key={`f${k}`}>
            <Flat x={g.rodX(k)} y={0} w={10 * U} h={10 * U} tone={TOP} />
            <JoinRing x={g.rodX(k)} y={0} w={10 * U} h={10 * U} tone={TOP} />
          </g>
        ) : (
          <g key={`f${k}`}>
            {Array.from({ length: 10 }, (_, r) => (
              <Rod key={r} x={g.rodX(k)} y={r * U} u={U} tone={TOP} />
            ))}
          </g>
        ),
      )}
      {Array.from({ length: g.oA }, (_, j) =>
        rods ? (
          <g key={`v${j}`}>
            <Rod x={g.cubeX(j)} y={0} u={U} tone={TOP} vertical fused />
            <JoinRing x={g.cubeX(j)} y={0} w={U} h={10 * U} tone={TOP} />
          </g>
        ) : (
          <g key={`v${j}`}>
            {Array.from({ length: 10 }, (_, r) => (
              <Cube key={r} x={g.cubeX(j)} y={r * U} u={U} tone={TOP} />
            ))}
          </g>
        ),
      )}
    </g>
  );
}

/* Step 3: in the 10 rows, each column of ten rods joins into a hundred, and each column of ten ones into a ten. */
function JoinTop({ m }: { m: LongMultiplication }) {
  const g = useGeometry(m);
  const top = regroup(rowsAsBlocks(m.a, 10)).result;
  const beats = [...Array.from({ length: g.tA }, () => 750), 900, 500];
  const phase = usePhases(beats);
  const flats = Math.min(phase, g.tA);
  const rods = phase > g.tA;
  const done = phase >= g.tA + 2;
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <SplitGrid m={m} label={`10 rows of ${m.a} make ${top.hundreds} hundreds and ${top.tens} tens`} top={<TopFused g={g} flats={flats} rods={rods} />} bottom={bottomRows(g, m, BOTTOM)} />
      <Chips>
        {flats > 0 && (
          <Chip key={`h${flats}`} tone={TOP}>
            {flats} hundred{flats === 1 ? "" : "s"}
          </Chip>
        )}
        {rods && <Chip tone={TOP}>{top.tens} tens</Chip>}
        {done && (
          <Chip tone={TOTAL}>
            = <CountUp value={m.a * 10} seconds={0.6} />
          </Chip>
        )}
      </Chips>
    </div>
  );
}

/* Step 4: the other rows have too many ones. The child swaps ten of them for a ten. */
function Swap({ m, done, onTaskDone }: { m: LongMultiplication; done: boolean; onTaskDone: () => void }) {
  const g = useGeometry(m);
  const rest = m.b - 10;
  const raw = rowsAsBlocks(m.a, rest);
  const after = regroup(raw);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onTaskDone();
    }
  };
  return (
    <div className="flex w-full flex-col items-center gap-3">
      {done ? (
        <Gathered m={m} />
      ) : (
        <SplitGrid
          m={m}
          label={`${rest} rows of ${m.a}: ${raw.tens} tens and ${raw.ones} ones`}
          top={<TopFused g={g} flats={g.tA} rods />}
          bottom={
            <g>
              {bottomRows(g, m, BOTTOM, false)}
              <WobblingCubes m={m} />
              {/* The ones can be tapped too; the button below does the same for everyone. */}
              <rect
                x={g.cubeX(0) - 4}
                y={10 * U - 4}
                width={g.oA * (U + 2) + 6}
                height={rest * U + 8}
                rx={8}
                className="cursor-pointer fill-transparent stroke-warn-bright"
                strokeWidth={2.5}
                strokeDasharray="5 4"
                role="button"
                tabIndex={0}
                aria-label={`Swap 10 ones for a ten`}
                onClick={onTaskDone}
                onKeyDown={onKey}
              />
            </g>
          }
        />
      )}
      <Chips>
        {done ? (
          <>
            <Chip tone={BOTTOM} delay={1.4}>
              {after.result.tens} tens
            </Chip>
            <Chip tone={BOTTOM} delay={1.5}>
              {after.result.ones} ones
            </Chip>
            <Chip tone={TOTAL} delay={1.6}>
              = {m.a * rest}
            </Chip>
          </>
        ) : (
          <>
            <Chip tone={BOTTOM}>{raw.tens} tens</Chip>
            <Chip tone={{ ...BOTTOM, chip: "bg-warn-soft text-warn" }}>{raw.ones} ones: too many!</Chip>
          </>
        )}
      </Chips>
      {!done && (
        <Button size="lg" onClick={onTaskDone}>
          Swap 10 ones for a ten
        </Button>
      )}
    </div>
  );
}

function WobblingCubes({ m }: { m: LongMultiplication }) {
  const g = useGeometry(m);
  const instant = useInstant();
  return (
    <motion.g
      initial={{ rotate: 0 }}
      animate={instant ? { rotate: 0 } : { rotate: [0, -3, 3, -2, 0] }}
      transition={{ duration: 0.4, delay: 0.8 }}
      style={{ transformBox: "fill-box", transformOrigin: "center" }}
    >
      {Array.from({ length: m.b - 10 }, (_, i) =>
        Array.from({ length: g.oA }, (_, j) => <Cube key={`${i}-${j}`} x={g.cubeX(j)} y={(10 + i) * U} u={U} tone={BOTTOM} />),
      )}
    </motion.g>
  );
}

/** After the swap: ten cubes slide into a line under the tens and join into one rod; the rest stay as ones. */
function Gathered({ m }: { m: LongMultiplication }) {
  const g = useGeometry(m);
  const instant = useInstant();
  const phase = usePhases([200, 900]);
  const rest = m.b - 10;
  const cubes = Array.from({ length: rest }, (_, i) => Array.from({ length: g.oA }, (_, j) => ({ i, j }))).flat();
  const lineY = g.newRowY - SPLIT;
  return (
    <SplitGrid
      m={m}
      label={`Ten ones joined into a ten under the other tens`}
      top={<TopFused g={g} flats={g.tA} rods />}
      bottom={
        <g>
          {bottomRows(g, m, BOTTOM, false)}
          {cubes.map(({ i, j }, n) => {
            const from = { x: g.cubeX(j), y: (10 + i) * U };
            const moving = n < 10;
            if (moving && phase >= 2) return null;
            const to = moving && phase >= 1 ? { x: n * U, y: lineY } : from;
            return (
              <motion.g key={`${i}-${j}`} initial={false} animate={{ x: to.x - from.x, y: to.y - from.y }} transition={motionOr(instant, { ...MOVE, delay: moving ? n * 0.05 : 0 })}>
                <Cube x={from.x} y={from.y} u={U} tone={BOTTOM} />
              </motion.g>
            );
          })}
          {phase >= 2 && (
            <g>
              <Rod x={0} y={lineY} u={U} tone={BOTTOM} fused />
              <JoinRing x={0} y={lineY} w={10 * U} h={U} tone={BOTTOM} />
            </g>
          )}
        </g>
      }
    />
  );
}

/* Step 5: everything sorted into hundreds, tens and ones; ten tens join into one more hundred. */
function Together({ m }: { m: LongMultiplication }) {
  const instant = useInstant();
  const top = regroup(rowsAsBlocks(m.a, 10)).result;
  const bottom = regroup(rowsAsBlocks(m.a, m.b - 10)).result;
  const raw = { hundreds: top.hundreds + bottom.hundreds, tens: top.tens + bottom.tens, ones: top.ones + bottom.ones };
  const final = regroup(raw);
  const phase = usePhases([700, 800, 700, 400]);
  const swap = final.tensToHundreds > 0;
  const tensLeft = swap && phase >= 3 ? final.result.tens : raw.tens;
  const flats = swap && phase >= 3 ? final.result.hundreds : raw.hundreds;
  const H = { x: 0, w: 128 };
  const T = { x: 140, w: 170 };
  const O = { x: 322, w: 60 };
  const rodX = (k: number, tight: boolean) => T.x + 8 + k * (tight ? 5 : 13);
  const toneOfRod = (k: number) => (k < top.tens ? TOP : BOTTOM);
  return (
    <div className="flex w-full flex-col items-center gap-3">
      <svg viewBox="-4 -4 392 134" className="h-auto w-full max-w-[460px]" role="img" aria-label={`${final.result.hundreds} hundreds, ${final.result.tens} tens and ${final.result.ones} ones`}>
        {[
          { ...H, name: "Hundreds" },
          { ...T, name: "Tens" },
          { ...O, name: "Ones" },
        ].map((b) => (
          <g key={b.name}>
            <rect x={b.x} y={0} width={b.w} height={96} rx={12} className="fill-raised stroke-line-strong" strokeWidth={2} />
            <text x={b.x + b.w / 2} y={120} textAnchor="middle" fontSize={15} className="fill-ink font-extrabold">
              {b.name}
            </text>
          </g>
        ))}
        {Array.from({ length: flats }, (_, k) => {
          const isNew = k >= raw.hundreds;
          return (
            <motion.g key={`f${k}`} initial={instant || !isNew ? false : { x: T.x - (H.x + 6 + k * 40), opacity: 0.6 }} animate={{ x: 0, opacity: 1 }} transition={motionOr(instant, MOVE)}>
              <Flat x={H.x + 6 + (k % 3) * 40} y={10 + Math.floor(k / 3) * 40} w={36} h={36} tone={k < top.hundreds ? TOP : BOTTOM} />
            </motion.g>
          );
        })}
        {Array.from({ length: tensLeft }, (_, k) => {
          const moved = swap && phase >= 3;
          const index = moved ? k + 10 : k;
          const tight = swap && phase === 2 && index < 10;
          return (
            <motion.g key={`t${index}`} initial={false} animate={{ x: (moved ? rodX(k, false) : rodX(index, tight)) - rodX(index, false) }} transition={motionOr(instant, MOVE)}>
              <Rod x={rodX(index, false)} y={18} u={4.4} tone={toneOfRod(index)} vertical fused={tight} />
            </motion.g>
          );
        })}
        {swap && phase === 1 && <JoinRing x={T.x + 4} y={14} w={10 * 13 - 4} h={52} tone={TOTAL} />}
        {Array.from({ length: raw.ones }, (_, k) => (
          <rect key={`o${k}`} x={O.x + 12 + k * 14} y={40} width={10} height={10} rx={2} className={`${BOTTOM.soft} ${BOTTOM.edge}`} strokeWidth={1.5} />
        ))}
      </svg>
      <Chips>
        {phase >= 4 && (
          <>
            <Chip tone={TOTAL}>
              {final.result.hundreds} hundreds, {final.result.tens} tens, {final.result.ones} ones
            </Chip>
            <Chip tone={TOTAL}>
              = <CountUp value={m.total} seconds={0.8} />
            </Chip>
          </>
        )}
      </Chips>
    </div>
  );
}

export function BlocksScene({ m, step, done, onTaskDone }: SceneProps & { m: LongMultiplication }) {
  switch (step) {
    case 0:
      return <OneRow m={m} />;
    case 1:
      return <Stamp m={m} />;
    case 2:
      return <Split m={m} />;
    case 3:
      return <JoinTop m={m} />;
    case 4:
      return <Swap m={m} done={done} onTaskDone={onTaskDone} />;
    default:
      return <Together m={m} />;
  }
}
