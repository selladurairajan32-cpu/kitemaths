"use client";

import { motion, useReducedMotion } from "motion/react";
import { APPEAR, motionOr } from "@/components/explain/motionTokens";
import { shareInRatio } from "@/maths/ratio";
import type { RatioScene } from "./ratioStory";

/**
 * The 2.5D picture of a ratio scene (D-040): isometric cubes, jars, a bar model and a recipe, drawn in SVG with the
 * design tokens. It is the fallback when WebGL is unavailable or motion is reduced, and the Step view's frames. The
 * caption beside it says everything the picture shows, so the picture itself is hidden from screen readers.
 */

type Tone = "blue" | "orange";
const FACE: Record<Tone, { top: string; front: string; side: string }> = {
  blue: { top: "fill-sky", front: "fill-brand", side: "fill-brand-strong" },
  orange: { top: "fill-num-soft", front: "fill-num", side: "fill-num-strong" },
};

/** An isometric cube with its front-bottom-left corner at (x, y). */
function Cube({ x, y, s, tone }: { x: number; y: number; s: number; tone: Tone }) {
  const d = s * 0.42;
  const f = FACE[tone];
  return (
    <g>
      <path d={`M${x} ${y - s} l${d} ${-d} h${s} l${-d} ${d} z`} className={f.top} />
      <path d={`M${x + s} ${y} l${d} ${-d} v${-s} l${-d} ${d} z`} className={f.side} />
      <rect x={x} y={y - s} width={s} height={s} className={f.front} />
    </g>
  );
}

function Appear({ children, i, reduce }: { children: React.ReactNode; i: number; reduce: boolean }) {
  return (
    <motion.g initial={reduce ? false : { opacity: 0, y: -24 }} animate={{ opacity: 1, y: 0 }} transition={motionOr(reduce, { ...APPEAR, delay: i * 0.15 })}>
      {children}
    </motion.g>
  );
}

function Label({ x, y, children, size = 22, anchor = "middle" }: { x: number; y: number; children: React.ReactNode; size?: number; anchor?: "start" | "middle" | "end" }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} className="fill-ink font-extrabold">
      {children}
    </text>
  );
}

function Groups({ v, reduce }: { v: Extract<RatioScene, { kind: "groups" }>; reduce: boolean }) {
  const s = 30;
  const w = 600 / Math.max(3, v.groups);
  return (
    <>
      {Array.from({ length: v.groups }, (_, g) => {
        const cx = w * g + w / 2;
        return (
          <Appear key={g} i={g} reduce={reduce}>
            <rect x={cx - 92} y={196} width={184} height={22} rx={11} className="fill-sunk" />
            {Array.from({ length: v.a }, (_, i) => <Cube key={`a${i}`} x={cx - 84 + i * (s + 6)} y={200} s={s} tone="blue" />)}
            {Array.from({ length: v.b }, (_, i) => <Cube key={`b${i}`} x={cx - 84 + (v.a + i) * (s + 6) + 8} y={200} s={s} tone="orange" />)}
            <Label x={cx} y={250} size={18}>Group {g + 1}</Label>
          </Appear>
        );
      })}
      <rect x={225} y={18} width={150} height={52} rx={26} className="fill-surface stroke-line-strong" strokeWidth={2} />
      <Label x={300} y={53} size={30}>{v.a} : {v.b}</Label>
      {v.count && (
        <Label x={300} y={310} size={22}>
          {v.groups * v.a} blue : {v.groups * v.b} orange
        </Label>
      )}
    </>
  );
}

function Jar({ x, count, tone, label }: { x: number; count: number; tone: Tone; label: string }) {
  const per = 7;
  return (
    <g>
      <path d={`M${x} 120 h140 v10 q-10 6 -10 20 v120 q0 22 -22 22 h-76 q-22 0 -22 -22 v-120 q0 -14 -10 -20 z`} className="fill-surface stroke-ink-2" strokeWidth={3} />
      {Array.from({ length: count }, (_, i) => (
        <circle key={i} cx={x + 34 + (i % per) * 12} cy={280 - Math.floor(i / per) * 13} r={6} className={tone === "blue" ? "fill-brand" : "fill-num"} />
      ))}
      <Label x={x + 70} y={330} size={20}>
        {label}: {count}
      </Label>
    </g>
  );
}

function Share({ v, reduce }: { v: Extract<RatioScene, { kind: "share" }>; reduce: boolean }) {
  const { onePart, shares, partCount } = shareInRatio(v.total, [v.a, v.b]);
  if (v.stage === "pile") {
    return (
      <>
        {Array.from({ length: v.total }, (_, i) => {
          const row = Math.floor(Math.sqrt(2 * i + 0.25) - 0.5);
          const inRow = i - (row * (row + 1)) / 2;
          return <circle key={i} cx={300 - row * 9 + inRow * 18} cy={90 + row * 20} r={8} className={i % 2 ? "fill-num" : "fill-brand"} />;
        })}
        <Label x={300} y={330}>{v.total} sweets</Label>
      </>
    );
  }
  if (v.stage === "groups") {
    return (
      <>
        {Array.from({ length: onePart }, (_, g) => {
          const x = 30 + (g % 4) * 140;
          const y = 70 + Math.floor(g / 4) * 120;
          return (
            <Appear key={g} i={g} reduce={reduce}>
              <rect x={x} y={y} width={124} height={44} rx={22} className="fill-sunk" />
              {Array.from({ length: partCount }, (_, i) => <circle key={i} cx={x + 22 + i * 20} cy={y + 22} r={8} className={i < v.a ? "fill-brand" : "fill-num"} />)}
            </Appear>
          );
        })}
        <Label x={300} y={330}>
          {v.total} ÷ {partCount} = {onePart} groups
        </Label>
      </>
    );
  }
  if (v.stage === "jars") {
    return (
      <>
        <Jar x={110} count={shares[0]!} tone="blue" label="Blue" />
        <Jar x={350} count={shares[1]!} tone="orange" label="Orange" />
      </>
    );
  }
  const unit = 96;
  return (
    <>
      {Array.from({ length: partCount }, (_, i) => (
        <Appear key={i} i={i} reduce={reduce}>
          <Cube x={60 + i * unit} y={200} s={unit - 22} tone={i < v.a ? "blue" : "orange"} />
          <Label x={60 + i * unit + (unit - 22) / 2} y={175} size={26}>
            {onePart}
          </Label>
        </Appear>
      ))}
      <path d={`M60 230 v12 h${v.a * unit - 22} v-12`} fill="none" className="stroke-ink" strokeWidth={3} />
      <path d={`M${60 + v.a * unit} 230 v12 h${v.b * unit - 22} v-12`} fill="none" className="stroke-ink" strokeWidth={3} />
      <Label x={60 + (v.a * unit - 22) / 2} y={272}>Blue {shares[0]}</Label>
      <Label x={60 + v.a * unit + (v.b * unit - 22) / 2} y={272}>Orange {shares[1]}</Label>
      <Label x={300} y={322} size={20}>
        {shares[0]} + {shares[1]} = {v.total}
      </Label>
    </>
  );
}

function Recipe({ v, reduce }: { v: Extract<RatioScene, { kind: "recipe" }>; reduce: boolean }) {
  const jug = Math.min(1, v.milk / 900);
  return (
    <>
      <rect x={24} y={24} width={180} height={52} rx={26} className="fill-surface stroke-line-strong" strokeWidth={2} />
      <Label x={114} y={58} size={22}>For {v.people} people</Label>
      {Array.from({ length: v.eggs }, (_, i) => (
        <Appear key={`e${i}`} i={i} reduce={reduce}>
          <ellipse cx={70 + (i % 3) * 64} cy={180 + Math.floor(i / 3) * 70} rx={24} ry={30} className="fill-sun-soft stroke-sun-strong" strokeWidth={3} />
        </Appear>
      ))}
      <Label x={134} y={322}>{v.eggs} eggs</Label>
      <path d="M380 110 h130 l-10 190 q-2 16 -18 16 h-74 q-16 0 -18 -16 z" className="fill-surface stroke-ink-2" strokeWidth={3} />
      <motion.rect x={392} width={106} rx={6} className="fill-sky-soft" initial={false} animate={{ y: 300 - 180 * jug, height: 180 * jug }} transition={motionOr(reduce, APPEAR)} />
      <path d="M510 140 q34 0 34 40 q0 40 -40 40" fill="none" className="stroke-ink-2" strokeWidth={6} />
      <Label x={445} y={346} size={22}>{v.milk} ml milk</Label>
    </>
  );
}

function Deal({ v }: { v: Extract<RatioScene, { kind: "deal" }> }) {
  const left = v.total - v.dealt * (v.a + v.b);
  return (
    <>
      {Array.from({ length: left }, (_, i) => <circle key={i} cx={40 + (i % 6) * 18} cy={290 - Math.floor(i / 6) * 18} r={8} className="fill-ink-2" />)}
      <Label x={85} y={334} size={18}>Left: {left}</Label>
      <Jar x={200} count={v.dealt * v.a} tone="blue" label="Jar A" />
      <Jar x={400} count={v.dealt * v.b} tone="orange" label="Jar B" />
    </>
  );
}

export function RatioSceneSvg({ scene, compact = false }: { scene: RatioScene; compact?: boolean }) {
  const reduce = !!useReducedMotion();
  return (
    <svg viewBox="0 0 600 360" className={`h-auto w-full ${compact ? "max-w-[18rem]" : ""}`} aria-hidden>
      {scene.kind === "groups" && <Groups v={scene} reduce={reduce} />}
      {scene.kind === "share" && <Share v={scene} reduce={reduce} />}
      {scene.kind === "recipe" && <Recipe v={scene} reduce={reduce} />}
      {scene.kind === "deal" && <Deal v={scene} />}
    </svg>
  );
}
