import type { ReactNode } from "react";
import { num } from "./evaluate";
import type { KitVisual, PlaceColumn } from "./types";

/** The kit's maths pictures, drawn for the Crystal look: ink outlines, pastel fills, big readable labels. */

const INK = "#1b2559";
const BRAND = "#2563eb";
const CORAL = "#f4623a";
const GREEN = "#22a565";
const TONE = { brand: BRAND, num: CORAL, ok: GREEN } as const;

export const PLACE: Record<PlaceColumn, number> = { M: 1e6, HTh: 1e5, TTh: 1e4, Th: 1e3, H: 100, T: 10, O: 1, t: 0.1, h: 0.01 };
const COLUMN_NAME: Record<PlaceColumn, string> = {
  M: "Millions",
  HTh: "Hundred thousands",
  TTh: "Ten thousands",
  Th: "Thousands",
  H: "Hundreds",
  T: "Tens",
  O: "Ones",
  t: "Tenths",
  h: "Hundredths",
};

/** The digit of `value` in a column, or null for a leading blank. */
export function digitIn(value: number, col: PlaceColumn): number | null {
  const place = PLACE[col];
  const scaled = Math.round(Math.abs(value) * 100);
  const p = Math.round(place * 100);
  if (p >= 100 && scaled < p && col !== "O") return null;
  return Math.floor(scaled / p) % 10;
}

function Frame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <figure className="m-0 flex w-full flex-col items-center" role="img" aria-label={label}>
      {children}
    </figure>
  );
}

function PlaceValueChart({ v }: { v: Extract<KitVisual, { kind: "pv-chart" }> }) {
  const digits = v.columns.map((c) => digitIn(v.value, c));
  return (
    <Frame label={`Place-value chart showing ${num(v.value)}`}>
      <div className="w-full max-w-xl overflow-hidden rounded-[18px] border-2 border-ink" aria-hidden>
        <div className="grid" style={{ gridTemplateColumns: `repeat(${v.columns.length}, minmax(0, 1fr))` }}>
          {v.columns.map((c) => (
            <div key={c} className={`border-b-2 border-r-2 border-ink px-1 py-2 text-center text-[0.9375rem] font-extrabold last:border-r-0 ${c === v.highlight ? "bg-brand text-white" : "bg-tile-blue text-ink"}`}>
              {c}
            </div>
          ))}
          {v.columns.map((c, i) => (
            <div key={c} className={`border-r-2 border-ink py-3 text-center text-[2rem] font-extrabold tabular-nums last:border-r-0 ${c === v.highlight ? "bg-brand-soft text-brand-strong" : "bg-surface text-ink"}`}>
              {v.hideDigits && c === v.highlight ? "?" : (digits[i] ?? "")}
            </div>
          ))}
        </div>
      </div>
      {v.highlight && <figcaption className="mt-2 text-[0.9375rem] font-semibold text-muted">{COLUMN_NAME[v.highlight]} column</figcaption>}
    </Frame>
  );
}

function Blocks({ v }: { v: Extract<KitVisual, { kind: "blocks" }> }) {
  const flats = Array.from({ length: v.hundreds });
  const rods = Array.from({ length: v.tens });
  const cubes = Array.from({ length: v.ones });
  const S = 6; // one cube
  const flatW = S * 10;
  const width = v.hundreds * (flatW + 10) + v.tens * (S + 6) + (v.ones ? Math.ceil(v.ones / 5) * (S + 3) + 12 : 0) + 10;
  return (
    <Frame label={`${v.hundreds} hundreds, ${v.tens} tens and ${v.ones} ones`}>
      <svg viewBox={`0 0 ${Math.max(width, 80)} ${flatW + 6}`} className="h-auto w-full max-w-xl" aria-hidden>
        {flats.map((_, i) => {
          const x = 4 + i * (flatW + 10);
          return (
            <g key={`h${i}`}>
              <rect x={x} y={3} width={flatW} height={flatW} fill="#dbe6ff" stroke={INK} strokeWidth="1.6" rx="2" />
              {Array.from({ length: 9 }, (_, k) => (
                <g key={k} stroke={INK} strokeOpacity=".35" strokeWidth=".6">
                  <line x1={x + (k + 1) * S} y1={3} x2={x + (k + 1) * S} y2={3 + flatW} />
                  <line x1={x} y1={3 + (k + 1) * S} x2={x + flatW} y2={3 + (k + 1) * S} />
                </g>
              ))}
            </g>
          );
        })}
        {rods.map((_, i) => {
          const x = 4 + v.hundreds * (flatW + 10) + i * (S + 6);
          return (
            <g key={`t${i}`}>
              <rect x={x} y={3} width={S} height={flatW} fill="#ffd9c2" stroke={INK} strokeWidth="1.4" rx="1.5" />
              {Array.from({ length: 9 }, (_, k) => (
                <line key={k} x1={x} y1={3 + (k + 1) * S} x2={x + S} y2={3 + (k + 1) * S} stroke={INK} strokeOpacity=".35" strokeWidth=".6" />
              ))}
            </g>
          );
        })}
        {cubes.map((_, i) => {
          const x = 4 + v.hundreds * (flatW + 10) + v.tens * (S + 6) + 8 + Math.floor(i / 5) * (S + 3);
          const y = 3 + flatW - (i % 5) * (S + 3) - S;
          return <rect key={`o${i}`} x={x} y={y} width={S} height={S} fill="#c9f0dc" stroke={INK} strokeWidth="1.2" rx="1" />;
        })}
      </svg>
      <figcaption className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[0.9375rem] font-bold">
        <span className="text-brand-strong">{v.hundreds} hundreds</span>
        <span className="text-num-strong">{v.tens} tens</span>
        <span className="text-ok">{v.ones} ones</span>
      </figcaption>
    </Frame>
  );
}

function NumberLineVisual({ v }: { v: Extract<KitVisual, { kind: "line" }> }) {
  const W = 640;
  const pad = 30;
  const y = 70;
  const count = Math.round((v.max - v.min) / v.step);
  const x = (value: number) => pad + ((value - v.min) / (v.max - v.min)) * (W - pad * 2);
  const every = v.labelEvery ?? (count > 12 ? Math.ceil(count / 10) : 1);
  const ticks = Array.from({ length: count + 1 }, (_, i) => v.min + i * v.step);
  // Label round values (multiples of step × every, counted from zero), wherever the line starts.
  const labelled = (t: number) => Math.round(t / v.step) % every === 0 || t === v.min || t === v.max;
  return (
    <Frame label={`Number line from ${num(v.min)} to ${num(v.max)}`}>
      <svg viewBox={`0 0 ${W} 112`} className="h-auto w-full max-w-2xl" aria-hidden>
        {(v.jumps ?? []).map((j, i) => {
          const a = x(j.from);
          const b = x(j.to);
          const mid = (a + b) / 2;
          const h = Math.min(42, Math.max(18, Math.abs(b - a) / 2));
          return (
            <g key={i}>
              <path d={`M ${a} ${y - 4} Q ${mid} ${y - 4 - h * 1.6} ${b} ${y - 4}`} fill="none" stroke={BRAND} strokeWidth="2.5" />
              <path d={`M ${b} ${y - 4} l ${a < b ? -7 : 7} -5 M ${b} ${y - 4} l ${a < b ? -2 : 2} -8`} stroke={BRAND} strokeWidth="2.5" strokeLinecap="round" fill="none" />
              {j.label && (
                <text x={mid} y={y - 10 - h} textAnchor="middle" fontSize="15" fontWeight="800" fill={BRAND}>
                  {j.label}
                </text>
              )}
            </g>
          );
        })}
        <line x1={pad - 10} y1={y} x2={W - pad + 10} y2={y} stroke={INK} strokeWidth="3" strokeLinecap="round" />
        {ticks.map((t) => (
          <g key={t}>
            <line x1={x(t)} y1={y - (labelled(t) ? 10 : 6)} x2={x(t)} y2={y + (labelled(t) ? 10 : 6)} stroke={INK} strokeWidth={labelled(t) ? 2.5 : 1.5} />
            {labelled(t) && (
              <text x={x(t)} y={y + 30} textAnchor="middle" fontSize="16" fontWeight="700" fill={INK}>
                {num(t)}
              </text>
            )}
          </g>
        ))}
        {(v.points ?? []).map((p, i) => (
          <g key={i}>
            <circle cx={x(p.value)} cy={y} r="8" fill={TONE[p.tone ?? "num"]} stroke="#fff" strokeWidth="2.5" />
            {p.label && (
              <text x={x(p.value)} y={y - 18} textAnchor="middle" fontSize="16" fontWeight="800" fill={TONE[p.tone ?? "num"]}>
                {p.label}
              </text>
            )}
          </g>
        ))}
        {v.unknown !== undefined && (
          <g>
            <line x1={x(v.unknown)} y1={y - 26} x2={x(v.unknown)} y2={y - 8} stroke={CORAL} strokeWidth="3" />
            <circle cx={x(v.unknown)} cy={y - 40} r="15" fill={CORAL} />
            <text x={x(v.unknown)} y={y - 34} textAnchor="middle" fontSize="18" fontWeight="800" fill="#fff">
              ?
            </text>
          </g>
        )}
      </svg>
    </Frame>
  );
}

function ArrayVisual({ v }: { v: Extract<KitVisual, { kind: "array" }> }) {
  const g = 26;
  return (
    <Frame label={`An array of ${v.rows} rows of ${v.cols}`}>
      <svg viewBox={`0 0 ${v.cols * g + 8} ${v.rows * g + 8}`} className="h-auto w-full" style={{ maxWidth: Math.min(420, v.cols * 34 + 10) }} aria-hidden>
        {Array.from({ length: v.rows }, (_, r) =>
          Array.from({ length: v.cols }, (_, c) => <circle key={`${r}-${c}`} cx={4 + c * g + g / 2} cy={4 + r * g + g / 2} r={g * 0.36} fill={r % 2 ? "#ffb58f" : CORAL} stroke={INK} strokeWidth="1.4" />),
        )}
      </svg>
      <figcaption className="mt-2 text-[0.9375rem] font-bold text-ink-2">
        {v.rows} rows of {v.cols}
      </figcaption>
    </Frame>
  );
}

function GroupsVisual({ v }: { v: Extract<KitVisual, { kind: "groups" }> }) {
  const per = Math.ceil(Math.sqrt(v.each));
  const cell = 18;
  const box = per * cell + 16;
  return (
    <Frame label={v.label ?? `${v.groups} groups of ${v.each}`}>
      <div className="flex flex-wrap justify-center gap-3" aria-hidden>
        {Array.from({ length: v.groups }, (_, gi) => (
          <svg key={gi} width={box} height={box} viewBox={`0 0 ${box} ${box}`}>
            <rect x="1.5" y="1.5" width={box - 3} height={box - 3} rx="14" fill="#e8f0ff" stroke={BRAND} strokeWidth="2" />
            {Array.from({ length: v.each }, (_, k) => (
              <circle key={k} cx={8 + (k % per) * cell + cell / 2} cy={8 + Math.floor(k / per) * cell + cell / 2} r="6.5" fill={CORAL} stroke={INK} strokeWidth="1.2" />
            ))}
          </svg>
        ))}
      </div>
      <figcaption className="mt-2 text-[0.9375rem] font-bold text-ink-2">{v.label ?? `${v.groups} groups of ${v.each}`}</figcaption>
    </Frame>
  );
}

function BarModel({ v }: { v: Extract<KitVisual, { kind: "bar" }> }) {
  const total = v.parts.reduce((s, p) => s + (p.size ?? 1), 0);
  const fill = { brand: "#dbe6ff", num: "#ffe1d6", ok: "#d6f3e3", plain: "#ffffff" } as const;
  return (
    <Frame label={`Bar model: ${v.parts.map((p) => p.label).join(", ")}${v.total ? `, total ${v.total}` : ""}`}>
      <div className="w-full max-w-xl" aria-hidden>
        {v.total && (
          <div className="mb-2 flex items-center gap-2 text-center text-[0.9375rem] font-extrabold text-brand-strong">
            <span className="h-0.5 flex-1 bg-brand" />
            {v.total}
            <span className="h-0.5 flex-1 bg-brand" />
          </div>
        )}
        <div className="flex h-16 overflow-hidden rounded-[14px] border-[3px] border-ink">
          {v.parts.map((p, i) => (
            <div
              key={i}
              className="grid place-items-center border-r-[3px] border-ink px-1 text-center text-lg font-extrabold text-ink last:border-r-0"
              style={{ flex: p.size ?? 1, background: fill[p.tone ?? (i % 2 ? "num" : "brand")] }}
            >
              {p.label}
            </div>
          ))}
        </div>
        <p className="sr-only">{total}</p>
      </div>
    </Frame>
  );
}

function ColumnSum({ v }: { v: Extract<KitVisual, { kind: "column" }> }) {
  const width = Math.max(String(v.a).length, String(v.b).length, v.result !== undefined ? String(v.result).length : 0) + 1;
  const row = (n: number | null, sign = "") => {
    const s = n === null ? "" : String(n);
    const cells = Array.from({ length: width }, (_, i) => s[s.length - width + i] ?? "");
    return (
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${width + 1}, 2.25rem)` }}>
        <span className="text-center text-[1.75rem] font-extrabold text-brand-strong">{sign}</span>
        {cells.map((d, i) => (
          <span key={i} className="text-center text-[1.75rem] font-extrabold tabular-nums text-ink">
            {d}
          </span>
        ))}
      </div>
    );
  };
  return (
    <Frame label={`${num(v.a)} ${v.op === "+" ? "plus" : "minus"} ${num(v.b)}, written in columns`}>
      <div className="rounded-[18px] bg-surface px-5 py-4" aria-hidden>
        {row(v.a)}
        {row(v.b, v.op)}
        <div className="my-1 h-[3px] rounded-full bg-ink" />
        {v.result !== undefined ? (
          row(v.result)
        ) : (
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${width + 1}, 2.25rem)` }}>
            <span />
            {Array.from({ length: width }, (_, i) => (
              <span key={i} className="mx-auto h-9 w-8 rounded-[8px] border-2 border-dashed border-line-strong" />
            ))}
          </div>
        )}
      </div>
    </Frame>
  );
}

function Thermometer({ v }: { v: Extract<KitVisual, { kind: "thermo" }> }) {
  const step = v.step ?? (v.max - v.min > 20 ? 5 : 2);
  const H = 260;
  const top = 16;
  const bottom = H - 50;
  const yOf = (t: number) => bottom - ((t - v.min) / (v.max - v.min)) * (bottom - top);
  const ticks: number[] = [];
  for (let t = Math.ceil(v.min / step) * step; t <= v.max; t += step) ticks.push(t);
  return (
    <Frame label={`Thermometer reading ${num(v.value)} degrees`}>
      <svg viewBox={`0 0 160 ${H}`} className="h-64 w-auto" aria-hidden>
        <rect x="58" y={top - 8} width="26" height={bottom - top + 24} rx="13" fill="#fff" stroke={INK} strokeWidth="3" />
        <rect x="64" y={yOf(v.value)} width="14" height={bottom - yOf(v.value) + 14} rx="7" fill="#e8343f" />
        <circle cx="71" cy={bottom + 26} r="20" fill="#e8343f" stroke={INK} strokeWidth="3" />
        {ticks.map((t) => (
          <g key={t}>
            <line x1="84" y1={yOf(t)} x2={t === 0 ? 104 : 96} y2={yOf(t)} stroke={INK} strokeWidth={t === 0 ? 3 : 2} />
            <text x="110" y={yOf(t) + 5} fontSize="15" fontWeight={t === 0 ? 900 : 700} fill={INK}>
              {num(t)}
            </text>
          </g>
        ))}
        <path d={`M 34 ${yOf(v.value) - 8} L 50 ${yOf(v.value)} L 34 ${yOf(v.value) + 8} Z`} fill="#e8343f" />
      </svg>
    </Frame>
  );
}

function TimesRow({ v }: { v: Extract<KitVisual, { kind: "times-row" }> }) {
  return (
    <Frame label={`Counting in ${v.table}s`}>
      <ol className="m-0 flex list-none flex-wrap justify-center gap-2 p-0" aria-hidden>
        {Array.from({ length: v.upTo }, (_, i) => {
          const n = (i + 1) * v.table;
          const gap = v.gap === i + 1;
          return (
            <li key={i} className={`grid h-14 min-w-14 place-items-center rounded-[16px] px-2 text-xl font-extrabold tabular-nums ${gap ? "border-2 border-dashed border-num bg-num-soft text-num-strong" : "bg-tile-blue text-ink"}`}>
              {gap ? "?" : num(n)}
            </li>
          );
        })}
      </ol>
    </Frame>
  );
}

export function MathVisual({ spec }: { spec: unknown }) {
  const v = spec as KitVisual;
  switch (v.kind) {
    case "pv-chart":
      return <PlaceValueChart v={v} />;
    case "blocks":
      return <Blocks v={v} />;
    case "line":
      return <NumberLineVisual v={v} />;
    case "array":
      return <ArrayVisual v={v} />;
    case "groups":
      return <GroupsVisual v={v} />;
    case "bar":
      return <BarModel v={v} />;
    case "column":
      return <ColumnSum v={v} />;
    case "thermo":
      return <Thermometer v={v} />;
    case "times-row":
      return <TimesRow v={v} />;
    default:
      return null;
  }
}
