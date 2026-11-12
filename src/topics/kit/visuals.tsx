import { ExtraVisual } from "./visuals-extra";
import { num } from "./evaluate";
import { BRAND, CORAL, Frame, INK, TONE } from "./frame";
import { ShapeVisual } from "./visuals-shape";
import { digitIn } from "@/maths/place-value";
import type { KitVisual, PlaceColumn, RectSide } from "./types";

/** The kit's maths pictures, drawn for the Crystal look: ink outlines, pastel fills, big readable labels. */

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


function PlaceValueChart({ v }: { v: Extract<KitVisual, { kind: "pv-chart" }> }) {
  const digits = v.columns.map((c) => digitIn(v.value, c));
  return (
    <Frame label={`Place-value chart showing ${num(v.value)}`}>
      <div className="w-full max-w-xl overflow-hidden rounded-[18px] border-2 border-ink" aria-hidden>
        <div className="grid" style={{ gridTemplateColumns: `repeat(${v.columns.length}, minmax(0, 1fr))` }}>
          {v.columns.map((c, i) => (
            <div key={c} className={`border-b-2 border-ink px-1 py-2 text-center text-label font-extrabold ${i < v.columns.length - 1 ? "border-r-2" : ""} ${c === v.highlight ? "bg-brand text-white" : "bg-tile-blue text-ink"}`}>
              {c}
            </div>
          ))}
          {v.columns.map((c, i) => (
            <div key={c} className={`relative border-ink py-3 text-center text-[2rem] font-extrabold tabular-nums ${i < v.columns.length - 1 ? "border-r-2" : ""} ${c === v.highlight ? "bg-brand-soft text-brand-strong" : "bg-surface text-ink"}`}>
              {v.hideDigits && c === v.highlight ? "?" : (digits[i] ?? "")}
              {/* The decimal point sits on the line between ones and tenths. */}
              {c === "O" && v.columns[i + 1] === "t" && <span className="absolute -right-[8px] bottom-4 z-10 size-[14px] rounded-full bg-num ring-2 ring-white" />}
            </div>
          ))}
        </div>
      </div>
      {v.highlight && <figcaption className="mt-2 text-label font-semibold text-muted">{COLUMN_NAME[v.highlight]} column</figcaption>}
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
      <figcaption className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-label font-bold">
        <span className="text-brand-strong">{v.hundreds} hundreds</span>
        <span className="text-num-strong">{v.tens} tens</span>
        <span className="text-ok">{v.ones} ones</span>
      </figcaption>
    </Frame>
  );
}

/** A number line, drawn twice: wide for bigger screens, and narrower with bigger text for phones. */
function NumberLineVisual({ v }: { v: Extract<KitVisual, { kind: "line" }> }) {
  return (
    <Frame label={`Number line from ${v.labels?.[0]?.text ?? num(v.min)} to ${v.labels?.[v.labels.length - 1]?.text ?? num(v.max)}`}>
      <LineSvg v={v} W={640} font={16} className="hidden w-full max-w-2xl sm:block" />
      <LineSvg v={v} W={340} font={19} className="w-full sm:hidden" />
    </Frame>
  );
}

function LineSvg({ v, W, font, className }: { v: Extract<KitVisual, { kind: "line" }>; W: number; font: number; className: string }) {
  const pad = W > 400 ? 30 : 22;
  const y = 70;
  const count = Math.round((v.max - v.min) / v.step);
  const x = (value: number) => pad + ((value - v.min) / (v.max - v.min)) * (W - pad * 2);
  const base = v.labelEvery ?? (count > 12 ? Math.ceil(count / 10) : 1);
  // On the narrow line, keep labels at least ~44 units apart.
  const gap = (W - pad * 2) / count;
  const every = base * Math.max(1, Math.ceil(44 / (gap * base)));
  const ticks = Array.from({ length: count + 1 }, (_, i) => Math.round((v.min + i * v.step) * 1e6) / 1e6);
  // Label round values (multiples of step × every, counted from zero), wherever the line starts.
  const labelled = (t: number) => (v.labels ? v.labels.some((l) => Math.abs(l.value - t) < 1e-9) : Math.round(t / v.step) % every === 0 || t === v.min || t === v.max);
  const text = (t: number) => v.labels?.find((l) => Math.abs(l.value - t) < 1e-9)?.text ?? num(t);
  return (
    <svg viewBox={`0 0 ${W} 116`} className={`h-auto ${className}`} aria-hidden>
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
              <text x={mid} y={y - 10 - h} textAnchor="middle" fontSize={font - 1} fontWeight="800" fill={BRAND}>
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
            <text x={x(t)} y={y + 30} textAnchor="middle" fontSize={font} fontWeight="700" fill={INK}>
              {text(t)}
            </text>
          )}
        </g>
      ))}
      {(v.points ?? []).map((p, i) => (
        <g key={i}>
          <circle cx={x(p.value)} cy={y} r="8" fill={TONE[p.tone ?? "num"]} stroke="#fff" strokeWidth="2.5" />
          {p.label && (
            <text x={x(p.value)} y={y - 18} textAnchor="middle" fontSize={font} fontWeight="800" fill={TONE[p.tone ?? "num"]}>
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
      <figcaption className="mt-2 text-label font-bold text-ink-2">
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
      <figcaption className="mt-2 text-label font-bold text-ink-2">{v.label ?? `${v.groups} groups of ${v.each}`}</figcaption>
    </Frame>
  );
}

function BarModel({ v }: { v: Extract<KitVisual, { kind: "bar" }> }) {
  const total = v.parts.reduce((s, p) => s + (p.size ?? 1), 0);
  const fill = { brand: "#dbe6ff", num: "#ffe1d6", ok: "#d6f3e3", plain: "#ffffff" } as const;
  return (
    <Frame label={`Bar model: ${v.parts.map((p) => p.label).filter(Boolean).join(", ")}${v.total ? `, total ${v.total}` : ""}${v.note ? `. ${v.note}` : ""}`}>
      <div className="w-full max-w-xl" aria-hidden>
        {v.total && (
          <div className="mb-2 flex items-center gap-2 text-center text-label font-extrabold text-brand-strong">
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
      {v.note && <figcaption className="mt-2 text-label font-semibold text-muted">{v.note}</figcaption>}
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

function FractionPicture({ v }: { v: Extract<KitVisual, { kind: "fraction" }> }) {
  const wholes = v.wholes ?? 1;
  const shape = v.shape ?? "bar";
  const items = Array.from({ length: wholes }, (_, w) => Math.max(0, Math.min(v.parts, v.shaded - w * v.parts)));
  return (
    <Frame label={v.label ?? `${v.shaded} of ${v.parts * wholes} equal parts shaded`}>
      <div className="flex flex-wrap items-center justify-center gap-4" aria-hidden>
        {items.map((shaded, w) =>
          shape === "circle" ? (
            <svg key={w} width="132" height="132" viewBox="-66 -66 132 132">
              {Array.from({ length: v.parts }, (_, i) => {
                const a0 = (i / v.parts) * Math.PI * 2 - Math.PI / 2;
                const a1 = ((i + 1) / v.parts) * Math.PI * 2 - Math.PI / 2;
                const R = 60;
                const d = v.parts === 1 ? `M 0 -${R} A ${R} ${R} 0 1 1 -0.01 -${R} Z` : `M 0 0 L ${R * Math.cos(a0)} ${R * Math.sin(a0)} A ${R} ${R} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${R * Math.cos(a1)} ${R * Math.sin(a1)} Z`;
                return <path key={i} d={d} fill={i < shaded ? CORAL : "#fff"} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />;
              })}
            </svg>
          ) : (
            <div key={w} className="flex h-14 w-[min(28rem,70vw)] overflow-hidden rounded-[12px] border-[3px] border-ink">
              {Array.from({ length: v.parts }, (_, i) => (
                <span key={i} className="flex-1 border-r-[3px] border-ink last:border-r-0" style={{ background: i < shaded ? CORAL : "#fff" }} />
              ))}
            </div>
          ),
        )}
      </div>
      {v.label && <figcaption className="mt-2 text-label font-bold text-ink-2">{v.label}</figcaption>}
    </Frame>
  );
}

function HundredSquare({ v }: { v: Extract<KitVisual, { kind: "grid100" }> }) {
  const c = 22;
  return (
    <Frame label={`A hundred square with ${v.shaded} of 100 squares shaded`}>
      <svg viewBox={`0 0 ${c * 10 + 6} ${c * 10 + 6}`} className="h-auto w-full max-w-[16rem]" aria-hidden>
        {Array.from({ length: 100 }, (_, i) => (
          <rect key={i} x={3 + (i % 10) * c} y={3 + Math.floor(i / 10) * c} width={c} height={c} fill={i < v.shaded ? CORAL : "#fff"} stroke={INK} strokeWidth={1} strokeOpacity={0.55} />
        ))}
        <rect x="3" y="3" width={c * 10} height={c * 10} fill="none" stroke={INK} strokeWidth="3" rx="3" />
      </svg>
      <figcaption className="mt-2 text-label font-bold text-ink-2">{v.shaded} out of 100 shaded</figcaption>
    </Frame>
  );
}

function ClockFace({ v }: { v: Extract<KitVisual, { kind: "clock" }> }) {
  const h12 = v.hours % 12;
  const hourAngle = (h12 + v.minutes / 60) * 30;
  const minuteAngle = v.minutes * 6;
  const at = (deg: number, r: number) => [Math.sin((deg * Math.PI) / 180) * r, -Math.cos((deg * Math.PI) / 180) * r] as const;
  // Hands stop short of the numbers so every number stays readable.
  const [hx, hy] = at(hourAngle, 36);
  const [mx, my] = at(minuteAngle, 53);
  const digits = `${v.hours}:${String(v.minutes).padStart(2, "0")}`;
  return (
    <Frame label={`A clock showing ${h12 === 0 ? 12 : h12}:${String(v.minutes).padStart(2, "0")}`}>
      <svg viewBox="-110 -110 220 220" className="h-auto w-full max-w-[13rem]" aria-hidden>
        <circle r="102" fill="#fff" stroke={INK} strokeWidth="5" />
        {Array.from({ length: 60 }, (_, i) => {
          const big = i % 5 === 0;
          const [x1, y1] = at(i * 6, big ? 84 : 90);
          const [x2, y2] = at(i * 6, 96);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={big ? 3 : 1.4} strokeOpacity={big ? 1 : 0.6} />;
        })}
        {Array.from({ length: 12 }, (_, i) => {
          const [x, y] = at((i + 1) * 30, 69);
          return (
            <text key={i} x={x} y={y + 7} textAnchor="middle" fontSize="20" fontWeight="800" fill={INK}>
              {i + 1}
            </text>
          );
        })}
        <line x1="0" y1="0" x2={hx} y2={hy} stroke={INK} strokeWidth="9" strokeLinecap="round" />
        <line x1="0" y1="0" x2={mx} y2={my} stroke={BRAND} strokeWidth="6" strokeLinecap="round" />
        <circle r="8" fill={CORAL} stroke="#fff" strokeWidth="2.5" />
      </svg>
      {v.digital && <figcaption className="mt-2 rounded-[12px] bg-ink px-4 py-1 font-mono text-2xl font-bold tracking-wider text-white tabular-nums">{digits}</figcaption>}
    </Frame>
  );
}

const COIN: Record<number, { label: string; size: number; sides: number; fill: string; rim?: string }> = {
  1: { label: "1p", size: 46, sides: 0, fill: "#e0a172" },
  2: { label: "2p", size: 56, sides: 0, fill: "#e0a172" },
  5: { label: "5p", size: 42, sides: 0, fill: "#d9dfea" },
  10: { label: "10p", size: 54, sides: 0, fill: "#d9dfea" },
  20: { label: "20p", size: 50, sides: 7, fill: "#d9dfea" },
  50: { label: "50p", size: 60, sides: 7, fill: "#d9dfea" },
  100: { label: "£1", size: 56, sides: 12, fill: "#f5cf5a", rim: "#d9dfea" },
  200: { label: "£2", size: 62, sides: 0, fill: "#d9dfea", rim: "#f5cf5a" },
};
const NOTE: Record<number, { label: string; fill: string }> = { 500: { label: "£5", fill: "#9fdccb" }, 1000: { label: "£10", fill: "#f6b98a" }, 2000: { label: "£20", fill: "#c7b5f0" } };

function polygon(sides: number, r: number): string {
  return Array.from({ length: sides }, (_, i) => {
    const a = (i / sides) * Math.PI * 2 - Math.PI / 2;
    return `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`;
  }).join(" ");
}

function CoinsVisual({ v }: { v: Extract<KitVisual, { kind: "coins" }> }) {
  const names = v.pence.map((p) => COIN[p]?.label ?? NOTE[p]?.label ?? `${p}p`);
  return (
    <Frame label={`Money: ${names.join(", ")}`}>
      <ul className="m-0 flex list-none flex-wrap items-center justify-center gap-3 p-0" aria-hidden>
        {v.pence.map((p, i) => {
          const note = NOTE[p];
          if (note)
            return (
              <li key={i}>
                <svg width="118" height="62" viewBox="0 0 118 62">
                  <rect x="2" y="2" width="114" height="58" rx="8" fill={note.fill} stroke={INK} strokeWidth="2.5" />
                  <rect x="9" y="9" width="100" height="44" rx="5" fill="none" stroke={INK} strokeOpacity="0.35" strokeWidth="1.5" />
                  <text x="59" y="40" textAnchor="middle" fontSize="22" fontWeight="900" fill={INK}>
                    {note.label}
                  </text>
                </svg>
              </li>
            );
          const c = COIN[p];
          const r = c.size / 2 - 2;
          return (
            <li key={i}>
              <svg width={c.size} height={c.size} viewBox={`${-c.size / 2} ${-c.size / 2} ${c.size} ${c.size}`}>
                {c.sides ? <polygon points={polygon(c.sides, r)} fill={c.rim ?? c.fill} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" /> : <circle r={r} fill={c.rim ?? c.fill} stroke={INK} strokeWidth="2.5" />}
                {c.rim && <circle r={r * 0.68} fill={c.fill} stroke={INK} strokeOpacity="0.4" strokeWidth="1.5" />}
                <text y={c.size > 50 ? 7 : 6} textAnchor="middle" fontSize={c.size > 50 ? 18 : 15} fontWeight="900" fill={INK}>
                  {c.label}
                </text>
              </svg>
            </li>
          );
        })}
      </ul>
    </Frame>
  );
}

function RectVisual({ v }: { v: Extract<KitVisual, { kind: "rect" }> }) {
  const s = Math.min(30, 240 / v.w, 160 / v.h);
  // Room at the sides for labels like "12 cm".
  const padX = 62;
  const padY = 40;
  const W = v.w * s + padX * 2;
  const H = v.h * s + padY * 2;
  const X = (u: number) => padX + u * s;
  const Y = (u: number) => padY + u * s;
  const cut = v.cut;
  const pts = cut
    ? [[0, 0], [v.w - cut.w, 0], [v.w - cut.w, cut.h], [v.w, cut.h], [v.w, v.h], [0, v.h]]
    : [[0, 0], [v.w, 0], [v.w, v.h], [0, v.h]];
  const inside = (i: number, j: number) => !cut || !(i >= v.w - cut.w && j < cut.h);
  const L = v.labels ?? {};
  const place: Record<RectSide, { x: number; y: number; anchor: "start" | "middle" | "end" }> = {
    top: { x: X((v.w - (cut?.w ?? 0)) / 2), y: Y(0) - 12, anchor: "middle" },
    bottom: { x: X(v.w / 2), y: Y(v.h) + 28, anchor: "middle" },
    left: { x: X(0) - 10, y: Y(v.h / 2) + 6, anchor: "end" },
    right: { x: X(v.w) + 10, y: Y(((cut?.h ?? 0) + v.h) / 2) + 6, anchor: "start" },
    innerV: { x: X(v.w - (cut?.w ?? 0)) + 8, y: Y((cut?.h ?? 0) / 2) + 6, anchor: "start" },
    // Below the inner edge, inside the shape, so it never meets the innerV label.
    innerH: { x: X(v.w - (cut?.w ?? 0) / 2), y: Y(cut?.h ?? 0) + 25, anchor: "middle" },
  };
  return (
    <Frame label={`A ${cut ? "shape made of rectangles" : "rectangle"}${Object.values(L).length ? ` with sides ${Object.values(L).join(", ")}` : ""}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" style={{ maxWidth: `${Math.round(W * 1.1)}px` }} aria-hidden>
        <polygon points={pts.map(([a, b]) => `${X(a)},${Y(b)}`).join(" ")} fill="#dbe6ff" />
        {v.grid &&
          Array.from({ length: v.w * v.h }, (_, k) => {
            const i = k % v.w;
            const j = Math.floor(k / v.w);
            return inside(i, j) ? <rect key={k} x={X(i)} y={Y(j)} width={s} height={s} fill="none" stroke={INK} strokeOpacity="0.4" strokeWidth="1.2" /> : null;
          })}
        <polygon points={pts.map(([a, b]) => `${X(a)},${Y(b)}`).join(" ")} fill="none" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        {(Object.keys(L) as RectSide[]).map((side) => (
          <text key={side} x={place[side].x} y={place[side].y} textAnchor={place[side].anchor} fontSize="20" fontWeight="800" fill={L[side] === "?" ? CORAL : INK}>
            {L[side]}
          </text>
        ))}
      </svg>
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
    case "fraction":
      return <FractionPicture v={v} />;
    case "grid100":
      return <HundredSquare v={v} />;
    case "clock":
      return <ClockFace v={v} />;
    case "coins":
      return <CoinsVisual v={v} />;
    case "rect":
      return <RectVisual v={v} />;
    case "pie":
    case "cuboid":
    case "net":
    case "symmetry":
    case "circle":
    case "base-height":
    case "lines":
    case "drawn-triangle":
      return <ExtraVisual v={v} />;
    default:
      return <ShapeVisual v={v} />;
  }
}
