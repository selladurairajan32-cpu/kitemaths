"use client";

import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { Button } from "@/components/ui/Button";
import { endPoint, snap, triangleFromSides } from "@/maths/geometry";
import type { KitLab } from "@/topics/kit/types";
import type { LabStepProps } from "@/topics/types";

/**
 * D-039 (Y6.GPS.1): draw a triangle from two sides and the angle between them with an on-screen ruler and protractor,
 * one stage at a time: the base along a ruler, the angle with a protractor, the second side along the ray, then join
 * the ends. Every handle is a slider that works by pointer (mouse or touch) and by keyboard (arrows ±1 step, Shift ±10,
 * Enter to check). Nothing animates, so reduced motion needs no special case.
 */

const U = 32; // pixels per centimetre
const O = { x: 200, y: 258 }; // the corner where the base and the second side meet
const LIMITS = { base: [1, 9, 0.5], angle: [10, 170, 1], side: [1, 7, 0.5] } as const;
type Stage = "base" | "angle" | "side" | "join" | "done";
type Key = keyof typeof LIMITS;

const clamp = (k: Key, v: number) => Math.min(LIMITS[k][1], Math.max(LIMITS[k][0], v));
const cm = (v: number) => `${v.toLocaleString("en-GB")} cm`;
const lab = (step: LabStepProps["step"]) => step as unknown as KitLab;

/** The triangles in a lab step: its numbers taken three at a time as [base cm, side cm, angle °]. */
export function trianglesOf(numbers: number[]): { base: number; side: number; angle: number }[] {
  const out: { base: number; side: number; angle: number }[] = [];
  for (let i = 0; i + 2 < numbers.length; i += 3) out.push({ base: numbers[i]!, side: numbers[i + 1]!, angle: numbers[i + 2]! });
  return out;
}

export function ConstructLab({ step, completed, onChallengeComplete }: LabStepProps) {
  const { numbers, challenges } = lab(step);
  const triangles = trianglesOf(numbers);
  const firstOpen = challenges.findIndex((c) => !completed.includes(c));
  const [index, setIndex] = useState(firstOpen < 0 ? triangles.length - 1 : firstOpen);
  const allDone = challenges.every((c) => completed.includes(c));
  return <Drawing key={index} target={triangles[index]!} number={index + 1} total={triangles.length} startDone={allDone && index === triangles.length - 1} onDrawn={() => onChallengeComplete(challenges[index]!)} onNext={index < triangles.length - 1 ? () => setIndex(index + 1) : undefined} />;
}

function Drawing({ target, number, total, startDone, onDrawn, onNext }: { target: { base: number; side: number; angle: number }; number: number; total: number; startDone: boolean; onDrawn: () => void; onNext?: () => void }) {
  const [stage, setStage] = useState<Stage>(startDone ? "done" : "base");
  const [value, setValue] = useState<Record<Key, number>>(startDone ? { ...target } : { base: 3, angle: 30, side: 2 });
  const [misses, setMisses] = useState(0);
  const [nudge, setNudge] = useState<string | null>(null);
  const [dragging, setDragging] = useState<Key | null>(null);

  const set = (k: Key, v: number) => setValue((old) => ({ ...old, [k]: clamp(k, snap(v, LIMITS[k][2])) }));
  const next: Record<Key, Stage> = { base: "angle", angle: "side", side: "join" };
  const unit = (k: Key, v: number) => (k === "angle" ? `${v}°` : cm(v));

  const check = (k: Key) => {
    if (value[k] === target[k]) {
      setStage(next[k]);
      setMisses(0);
      setNudge(null);
      return;
    }
    setMisses((m) => m + 1);
    setNudge(`That's ${unit(k, value[k])}. You need ${unit(k, target[k])}.`);
  };
  const doItForMe = (k: Key) => {
    setValue((old) => ({ ...old, [k]: target[k] }));
    setStage(next[k]);
    setMisses(0);
    setNudge(null);
  };
  const join = () => {
    setStage("done");
    onDrawn();
  };

  /** A point in the drawing's own coordinates from a pointer position. */
  const local = (e: PointerEvent<SVGGElement>) => {
    const ctm = e.currentTarget.ownerSVGElement?.getScreenCTM();
    if (!ctm) return null;
    return { x: (e.clientX - ctm.e) / ctm.a, y: (e.clientY - ctm.f) / ctm.d };
  };
  const fromPointer = (k: Key, e: PointerEvent<SVGGElement>) => {
    const p = local(e);
    if (!p) return;
    if (k === "base") set("base", (p.x - O.x) / U);
    else if (k === "angle") set("angle", (Math.atan2(O.y - p.y, p.x - O.x) * 180) / Math.PI);
    else {
      const t = (Math.PI * value.angle) / 180;
      set("side", ((p.x - O.x) * Math.cos(t) - (p.y - O.y) * Math.sin(t)) / U);
    }
  };
  const handlers = (k: Key) => ({
    onPointerDown: (e: PointerEvent<SVGGElement>) => {
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      setDragging(k);
      fromPointer(k, e);
    },
    onPointerMove: (e: PointerEvent<SVGGElement>) => dragging === k && fromPointer(k, e),
    onPointerUp: (e: PointerEvent<SVGGElement>) => {
      if (dragging !== k) return;
      setDragging(null);
      fromPointer(k, e);
    },
    onKeyDown: (e: KeyboardEvent<SVGGElement>) => {
      const stepBy = LIMITS[k][2] * (e.shiftKey ? 10 : 1);
      if (e.key === "ArrowRight" || e.key === "ArrowUp") set(k, value[k] + stepBy);
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown") set(k, value[k] - stepBy);
      else if (e.key === "Enter" || e.key === " ") check(k);
      else return;
      e.preventDefault();
    },
  });

  const B = { x: O.x + value.base * U, y: O.y };
  const C = endPoint(O, value.side * U, value.angle);
  const ray = endPoint(O, LIMITS.side[1] * U + 12, value.angle);
  const showAngle = stage !== "base";
  const showSide = stage === "side" || stage === "join" || stage === "done";
  const result = triangleFromSides(target.base, target.side, target.angle);
  const label: Record<Key, string> = { base: "Ruler: length of the base", angle: "Protractor: the angle at the left end", side: "Ruler: length of the second side" };
  const instruction: Record<Stage, string> = {
    base: `Drag the end of the line along the ruler to ${cm(target.base)}, then press Check.`,
    angle: `Turn the line round the protractor to ${target.angle}°, then press Check.`,
    side: `Drag along the new line to ${cm(target.side)}, then press Check.`,
    join: "Now join the two ends with a ruler.",
    done: `Done: ${cm(target.base)}, ${cm(target.side)} and ${target.angle}° between them. The third side measures about ${cm(Math.round(result.c * 10) / 10)}.`,
  };
  const active: Key | null = stage === "base" || stage === "angle" || stage === "side" ? stage : null;

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <p className="text-lg font-bold text-ink">
        Triangle {number} of {total}: sides {cm(target.base)} and {cm(target.side)} with {target.angle}° between them.
      </p>
      <svg viewBox="0 0 520 300" className="h-auto w-full max-w-[520px] touch-none select-none" aria-label={`Drawing a triangle with a ruler and protractor: base ${cm(value.base)}${showAngle ? `, angle ${value.angle}°` : ""}${showSide ? `, second side ${cm(value.side)}` : ""}`}>
        {/* Centimetre grid. */}
        {Array.from({ length: 17 }, (_, i) => <line key={`v${i}`} x1={8 + i * U} y1={0} x2={8 + i * U} y2={300} className="stroke-line" strokeWidth={1} />)}
        {Array.from({ length: 10 }, (_, i) => <line key={`h${i}`} x1={0} y1={O.y - i * U} x2={520} y2={O.y - i * U} className="stroke-line" strokeWidth={1} />)}

        {stage === "done" && <polygon points={`${O.x},${O.y} ${B.x},${B.y} ${C.x},${C.y}`} className="fill-ok-soft stroke-ok" strokeWidth={4} strokeLinejoin="round" />}

        {/* Ruler along the base while it is being measured. */}
        {stage === "base" && (
          <g aria-hidden>
            <rect x={O.x - 6} y={O.y + 4} width={LIMITS.base[1] * U + 12} height={30} rx={4} className="fill-surface stroke-line-strong" strokeWidth={2} />
            {Array.from({ length: LIMITS.base[1] * 2 + 1 }, (_, i) => (
              <line key={i} x1={O.x + (i * U) / 2} y1={O.y + 4} x2={O.x + (i * U) / 2} y2={O.y + (i % 2 ? 12 : 18)} className="stroke-ink" strokeWidth={1.5} />
            ))}
            {Array.from({ length: LIMITS.base[1] + 1 }, (_, i) => (
              <text key={i} x={O.x + i * U} y={O.y + 30} textAnchor="middle" fontSize={11} className="fill-ink font-bold">
                {i}
              </text>
            ))}
          </g>
        )}

        {/* Protractor at the left end while the angle is being set. */}
        {stage === "angle" && (
          <g aria-hidden>
            <path d={`M ${O.x - 110} ${O.y} A 110 110 0 0 1 ${O.x + 110} ${O.y} Z`} className="fill-surface stroke-line-strong" strokeWidth={2} opacity={0.92} />
            {Array.from({ length: 19 }, (_, i) => {
              const a = endPoint(O, 110, i * 10);
              const b = endPoint(O, i % 3 === 0 ? 92 : 100, i * 10);
              const t = endPoint(O, 80, i * 10);
              return (
                <g key={i}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="stroke-ink" strokeWidth={1.5} />
                  {i % 3 === 0 && (
                    <text x={t.x} y={t.y + 4} textAnchor="middle" fontSize={11} className="fill-ink font-bold">
                      {i * 10}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        )}

        {/* Ruler along the second side while it is being measured. */}
        {stage === "side" && (
          <g aria-hidden transform={`rotate(${-value.angle} ${O.x} ${O.y})`}>
            <rect x={O.x - 6} y={O.y - 34} width={LIMITS.side[1] * U + 12} height={30} rx={4} className="fill-surface stroke-line-strong" strokeWidth={2} opacity={0.92} />
            {Array.from({ length: LIMITS.side[1] * 2 + 1 }, (_, i) => (
              <line key={i} x1={O.x + (i * U) / 2} y1={O.y - 4} x2={O.x + (i * U) / 2} y2={O.y - (i % 2 ? 12 : 18)} className="stroke-ink" strokeWidth={1.5} />
            ))}
            {Array.from({ length: LIMITS.side[1] + 1 }, (_, i) => (
              <text key={i} x={O.x + i * U} y={O.y - 22} textAnchor="middle" fontSize={11} className="fill-ink font-bold">
                {i}
              </text>
            ))}
          </g>
        )}

        {/* The base. */}
        <line x1={O.x} y1={O.y} x2={B.x} y2={B.y} className="stroke-ink" strokeWidth={4} strokeLinecap="round" />
        {/* The second line: a long guide while turning, then the measured side. */}
        {stage === "angle" && <line x1={O.x} y1={O.y} x2={ray.x} y2={ray.y} className="stroke-brand" strokeWidth={3} strokeDasharray="8 6" />}
        {showSide && <line x1={O.x} y1={O.y} x2={C.x} y2={C.y} className="stroke-ink" strokeWidth={4} strokeLinecap="round" />}
        {stage === "join" && <line x1={B.x} y1={B.y} x2={C.x} y2={C.y} className="stroke-brand" strokeWidth={3} strokeDasharray="8 6" />}
        <circle cx={O.x} cy={O.y} r={5} className="fill-ink" />

        {/* The handle for the current stage. */}
        {active && (
          <g
            role="slider"
            tabIndex={0}
            aria-label={label[active]}
            aria-valuemin={LIMITS[active][0]}
            aria-valuemax={LIMITS[active][1]}
            aria-valuenow={value[active]}
            aria-valuetext={active === "angle" ? `${value.angle} degrees` : `${value[active]} centimetres`}
            {...handlers(active)}
            className="cursor-grab outline-none focus-visible:[&>circle]:stroke-focus"
          >
            {(() => {
              const h = active === "base" ? B : active === "side" ? C : endPoint(O, 140, value.angle);
              const good = value[active] === target[active];
              return (
                <>
                  <circle cx={h.x} cy={h.y} r={16} className={good ? "fill-ok-soft stroke-ok" : "fill-warn-soft stroke-warn-bright"} strokeWidth={3} />
                  <circle cx={h.x} cy={h.y} r={30} fill="transparent" />
                </>
              );
            })()}
          </g>
        )}

        {/* Live readings. */}
        <text x={(O.x + B.x) / 2} y={O.y + (stage === "base" ? 52 : 26)} textAnchor="middle" fontSize={17} className="fill-ink font-extrabold">
          {cm(value.base)}
        </text>
        {showAngle && (
          <text x={endPoint(O, 50, value.angle / 2).x + 6} y={endPoint(O, 50, value.angle / 2).y} fontSize={16} className="fill-ink font-extrabold">
            {value.angle}°
          </text>
        )}
        {showSide && (
          <text x={endPoint(O, (value.side * U) / 2, value.angle).x - 14} y={endPoint(O, (value.side * U) / 2, value.angle).y - 8} textAnchor="end" fontSize={17} className="fill-ink font-extrabold">
            {cm(value.side)}
          </text>
        )}
      </svg>

      <p aria-live="polite" className={`min-h-7 text-center text-lg font-bold ${nudge ? "text-warn" : "text-ink-2"}`}>
        {nudge ?? instruction[stage]}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {active && <Button onClick={() => check(active)}>Check</Button>}
        {active && misses >= 2 && (
          <Button variant="secondary" onClick={() => doItForMe(active)}>
            Do this step for me
          </Button>
        )}
        {stage === "join" && <Button onClick={join}>Join the ends</Button>}
        {stage === "done" && onNext && <Button onClick={onNext}>Draw the next triangle</Button>}
      </div>
    </div>
  );
}
