import { num } from "./evaluate";
import { BRAND, CORAL, FILL, Frame, INK } from "./frame";
import type { KitVisual, ShapeName, ShapeVisualSpec } from "./types";

/** Shape Shores pictures: angles, triangles, 2D shapes, coordinate grids, bar charts, pictograms, tables and line graphs. */

const rad = (d: number) => (d * Math.PI) / 180;
/** A point `r` from (cx, cy) at `deg` degrees anticlockwise from "east" (screen y points down). */
const polar = (cx: number, cy: number, r: number, deg: number) => [cx + r * Math.cos(rad(deg)), cy - r * Math.sin(rad(deg))] as const;
/** An arc from a to b degrees (anticlockwise). */
function arc(cx: number, cy: number, r: number, a: number, b: number): string {
  const [x1, y1] = polar(cx, cy, r, a);
  const [x2, y2] = polar(cx, cy, r, b);
  return `M ${x1} ${y1} A ${r} ${r} 0 ${b - a > 180 ? 1 : 0} 0 ${x2} ${y2}`;
}
/** The little square that marks a right angle between two directions. */
function rightMark(cx: number, cy: number, a: number, size = 18): string {
  const [x1, y1] = polar(cx, cy, size, a);
  const [x3, y3] = polar(cx, cy, size, a + 90);
  const [x2, y2] = [x1 + x3 - cx, y1 + y3 - cy];
  return `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3}`;
}

function AngleVisual({ v }: { v: Extract<ShapeVisualSpec, { kind: "angle" }> }) {
  const reflex = v.degrees > 180;
  const [cx, cy, len] = reflex ? [160, 110, 95] : [160, 165, 130];
  const [ex, ey] = polar(cx, cy, len, v.degrees);
  const [lx, ly] = polar(cx, cy, v.degrees === 90 ? 44 : 64, v.degrees / 2);
  return (
    <Frame label={`An angle${v.label ? ` marked ${v.label}` : ""}`}>
      <svg viewBox={`0 0 320 ${reflex ? 215 : 190}`} className="h-auto w-full max-w-[20rem]" aria-hidden>
        {v.degrees === 90 ? <path d={rightMark(cx, cy, 0, 24)} fill="none" stroke={CORAL} strokeWidth="3" /> : <path d={arc(cx, cy, 36, 0, v.degrees)} fill="none" stroke={CORAL} strokeWidth="3.5" />}
        <line x1={cx} y1={cy} x2={cx + len} y2={cy} stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={ex} y2={ey} stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="5" fill={INK} />
        {v.label && (
          <text x={lx} y={ly + 7} textAnchor="middle" fontSize="21" fontWeight="800" fill={CORAL}>
            {v.label}
          </text>
        )}
      </svg>
    </Frame>
  );
}

function AngleSplit({ v }: { v: Extract<ShapeVisualSpec, { kind: "angle-split" }> }) {
  const total = v.parts.reduce((a, b) => a + b, 0);
  const full = total >= 359;
  const [cx, cy, len] = full ? [160, 112, 100] : [160, 160, 140];
  const starts = v.parts.map((_, i) => v.parts.slice(0, i).reduce((a, b) => a + b, 0));
  const colours = [BRAND, CORAL, "#16a34a", "#9333ea"];
  return (
    <Frame label={`Angles ${full ? "around a point" : "on a straight line"}: ${v.labels.join(", ")}`}>
      <svg viewBox={`0 0 320 ${full ? 225 : 185}`} className="h-auto w-full max-w-[20rem]" aria-hidden>
        {v.parts.map((p, i) => (
          <path key={`a${i}`} d={p === 90 ? rightMark(cx, cy, starts[i], 22) : arc(cx, cy, 30 + (i % 2) * 10, starts[i], starts[i] + p)} fill="none" stroke={colours[i % 4]} strokeWidth="3.5" />
        ))}
        {(full ? starts : [...starts, 180]).map((a, i) => {
          const [x, y] = polar(cx, cy, len, a);
          return <line key={`r${i}`} x1={cx} y1={cy} x2={x} y2={y} stroke={INK} strokeWidth="4.5" strokeLinecap="round" />;
        })}
        <circle cx={cx} cy={cy} r="5" fill={INK} />
        {v.parts.map((p, i) => {
          const [x, y] = polar(cx, cy, p < 40 ? 92 : 72, starts[i] + p / 2);
          return (
            <text key={`l${i}`} x={x} y={y + 7} textAnchor="middle" fontSize="21" fontWeight="800" fill={colours[i % 4]}>
              {v.labels[i]}
            </text>
          );
        })}
      </svg>
    </Frame>
  );
}

function TriangleVisual({ v }: { v: Extract<ShapeVisualSpec, { kind: "triangle" }> }) {
  const [A, B, C] = v.angles;
  // Base from (0,0) to (1,0); the top corner by the sine rule.
  const side = Math.sin(rad(B)) / Math.sin(rad(C));
  const raw = [
    [0, 0],
    [1, 0],
    [side * Math.cos(rad(A)), side * Math.sin(rad(A))],
  ];
  const xs = raw.map((p) => p[0]);
  const ys = raw.map((p) => p[1]);
  const [minX, maxX, maxY] = [Math.min(...xs), Math.max(...xs), Math.max(...ys)];
  const scale = Math.min(250 / (maxX - minX), 150 / maxY);
  const pts = raw.map(([x, y]) => [35 + (x - minX) * scale, 175 - y * scale] as const);
  const W = 70 + (maxX - minX) * scale;
  return (
    <Frame label={`A triangle with angles ${v.labels.join(", ")}`}>
      <svg viewBox={`0 0 ${W} 200`} className="h-auto w-full" style={{ maxWidth: `${Math.round(W * 1.1)}px` }} aria-hidden>
        <polygon points={pts.map((p) => p.join(",")).join(" ")} fill={FILL.brand} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
        {pts.map((p, i) => {
          const others = pts.filter((_, j) => j !== i);
          const u = others.map(([x, y]) => {
            const d = Math.hypot(x - p[0], y - p[1]);
            return [(x - p[0]) / d, (y - p[1]) / d];
          });
          const bis = [u[0][0] + u[1][0], u[0][1] + u[1][1]];
          const bl = Math.hypot(bis[0], bis[1]);
          const dist = Math.min(64, 24 / Math.sin(rad(v.angles[i] / 2)));
          const [x, y] = [p[0] + (bis[0] / bl) * dist, p[1] + (bis[1] / bl) * dist];
          const m = 16;
          return (
            <g key={i}>
              {Math.abs(v.angles[i] - 90) < 1e-9 && (
                <path d={`M ${p[0] + u[0][0] * m} ${p[1] + u[0][1] * m} L ${p[0] + (u[0][0] + u[1][0]) * m} ${p[1] + (u[0][1] + u[1][1]) * m} L ${p[0] + u[1][0] * m} ${p[1] + u[1][1] * m}`} fill="none" stroke={CORAL} strokeWidth="2.5" />
              )}
              <text x={x} y={y + 7} textAnchor="middle" fontSize="20" fontWeight="800" fill={v.labels[i] === "?" ? CORAL : INK}>
                {v.labels[i]}
              </text>
            </g>
          );
        })}
      </svg>
    </Frame>
  );
}

function regular(n: number, cx: number, cy: number, r: number): [number, number][] {
  // Flat along the bottom.
  const turn = 90 + 180 / n;
  return Array.from({ length: n }, (_, i) => polar(cx, cy, r, turn + (360 / n) * i) as unknown as [number, number]);
}
const SHAPES: Record<Exclude<ShapeName, "circle">, { pts: [number, number][]; right?: number[] }> = {
  square: { pts: [[40, 10], [180, 10], [180, 150], [40, 150]], right: [0, 1, 2, 3] },
  rectangle: { pts: [[10, 35], [210, 35], [210, 135], [10, 135]], right: [0, 1, 2, 3] },
  equilateral: { pts: [[110, 12], [190, 150], [30, 150]] },
  "right-triangle": { pts: [[40, 10], [200, 150], [40, 150]], right: [2] },
  isosceles: { pts: [[110, 5], [165, 150], [55, 150]] },
  scalene: { pts: [[80, 12], [210, 150], [10, 118]] },
  rhombus: { pts: [[110, 5], [185, 78], [110, 151], [35, 78]] },
  parallelogram: { pts: [[60, 30], [210, 30], [160, 135], [10, 135]] },
  trapezium: { pts: [[60, 30], [160, 30], [210, 135], [10, 135]] },
  kite: { pts: [[110, 5], [165, 55], [110, 152], [55, 55]] },
  pentagon: { pts: regular(5, 110, 82, 76) },
  hexagon: { pts: regular(6, 110, 80, 76) },
  octagon: { pts: regular(8, 110, 80, 78) },
};

function ShapePicture({ v }: { v: Extract<ShapeVisualSpec, { kind: "shape" }> }) {
  return (
    <Frame label="A 2D shape">
      <svg viewBox="0 0 220 160" className="h-auto w-full max-w-[15rem]" aria-hidden>
        {v.name === "circle" ? (
          <circle cx="110" cy="80" r="72" fill={FILL.sun} stroke={INK} strokeWidth="4" />
        ) : (
          <>
            <polygon points={SHAPES[v.name].pts.map((p) => p.join(",")).join(" ")} fill={FILL.sun} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
            {(SHAPES[v.name].right ?? []).map((i) => {
              const pts = SHAPES[v.name as Exclude<ShapeName, "circle">].pts;
              const p = pts[i];
              const a = pts[(i + 1) % pts.length];
              const b = pts[(i + pts.length - 1) % pts.length];
              const step = (q: readonly [number, number]) => {
                const d = Math.hypot(q[0] - p[0], q[1] - p[1]);
                return [((q[0] - p[0]) / d) * 16, ((q[1] - p[1]) / d) * 16];
              };
              const [ax, ay] = step(a);
              const [bx, by] = step(b);
              return <path key={i} d={`M ${p[0] + ax} ${p[1] + ay} L ${p[0] + ax + bx} ${p[1] + ay + by} L ${p[0] + bx} ${p[1] + by}`} fill="none" stroke={CORAL} strokeWidth="2.5" />;
            })}
          </>
        )}
      </svg>
    </Frame>
  );
}

function CoordsGrid({ v }: { v: Extract<ShapeVisualSpec, { kind: "coords" }> }) {
  const n = v.max - v.min;
  const s = Math.min(30, 270 / n);
  const left = 34;
  const top = 18;
  const X = (x: number) => left + (x - v.min) * s;
  const Y = (y: number) => top + (v.max - y) * s;
  const every = n > 12 ? 2 : 1;
  const ticks = Array.from({ length: n + 1 }, (_, i) => v.min + i);
  const W = left + n * s + 26;
  const H = top + n * s + 34;
  return (
    <Frame label={`A coordinate grid with points ${v.points.map((p) => `${p.label ?? ""} at (${p.x}, ${p.y})`).join(", ")}`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full max-w-[22rem]" aria-hidden>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={X(t)} y1={Y(v.min)} x2={X(t)} y2={Y(v.max)} stroke={INK} strokeOpacity={t === 0 ? 1 : 0.18} strokeWidth={t === 0 ? 2.5 : 1} />
            <line x1={X(v.min)} y1={Y(t)} x2={X(v.max)} y2={Y(t)} stroke={INK} strokeOpacity={t === 0 ? 1 : 0.18} strokeWidth={t === 0 ? 2.5 : 1} />
            {(t - v.min) % every === 0 && (
              <>
                <text x={X(t)} y={Y(Math.max(v.min, 0)) + 20} textAnchor="middle" fontSize="15" fontWeight="700" fill={INK}>
                  {t === 0 && v.min < 0 ? "" : num(t)}
                </text>
                {t !== 0 && (
                  <text x={X(Math.max(v.min, 0)) - 8} y={Y(t) + 5} textAnchor="end" fontSize="15" fontWeight="700" fill={INK}>
                    {num(t)}
                  </text>
                )}
              </>
            )}
          </g>
        ))}
        <text x={X(v.max) + 12} y={Y(Math.max(v.min, 0)) + 5} fontSize="16" fontWeight="800" fontStyle="italic" fill={INK}>
          x
        </text>
        <text x={X(Math.max(v.min, 0))} y={Y(v.max) - 6} textAnchor="middle" fontSize="16" fontWeight="800" fontStyle="italic" fill={INK}>
          y
        </text>
        {v.join && <polygon points={v.points.map((p) => `${X(p.x)},${Y(p.y)}`).join(" ")} fill={BRAND} fillOpacity="0.15" stroke={BRAND} strokeWidth="3" strokeLinejoin="round" />}
        {v.points.map((p, i) => (
          <g key={i}>
            <circle cx={X(p.x)} cy={Y(p.y)} r="6.5" fill={CORAL} stroke="#fff" strokeWidth="2" />
            {p.label && (
              <text x={X(p.x) + 9} y={Y(p.y) - 9} fontSize="19" fontWeight="900" fill={CORAL} stroke="#fff" strokeWidth="4" paintOrder="stroke">
                {p.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    </Frame>
  );
}

/** Axes, gridlines and a scale shared by the bar chart and the line graph. */
function ChartAxes({ min, max, step, axis, X0, X1, Y }: { min: number; max: number; step: number; axis?: string; X0: number; X1: number; Y: (v: number) => number }) {
  const ticks: number[] = [];
  for (let t = min; t <= max + 1e-9; t += step) ticks.push(Math.round(t * 1000) / 1000);
  // Many lines: label every other one so the numbers never crowd.
  const every = ticks.length > 9 ? 2 : 1;
  return (
    <g>
      {ticks.map((t, i) => (
        <g key={t}>
          <line x1={X0} y1={Y(t)} x2={X1} y2={Y(t)} stroke={INK} strokeOpacity={t === min ? 1 : i % every ? 0.08 : 0.18} strokeWidth={t === min ? 2.5 : 1} />
          {i % every === 0 && (
            <text x={X0 - 8} y={Y(t) + 5} textAnchor="end" fontSize="16" fontWeight="700" fill={INK}>
              {num(t)}
            </text>
          )}
        </g>
      ))}
      <line x1={X0} y1={Y(min)} x2={X0} y2={Y(max)} stroke={INK} strokeWidth="2.5" />
      {axis && (
        <text x={X0 - 4} y={Y(max) - 12} fontSize="15" fontWeight="700" fill={INK} fillOpacity="0.75">
          {axis}
        </text>
      )}
    </g>
  );
}

function BarChart({ v }: { v: Extract<ShapeVisualSpec, { kind: "barchart" }> }) {
  const [X0, X1, top, bottom] = [52, 336, 34, 214];
  const Y = (val: number) => bottom - (val / v.max) * (bottom - top);
  const slot = (X1 - X0) / v.bars.length;
  const w = Math.min(48, slot * 0.62);
  const fills = [FILL.brand, FILL.num, FILL.ok, FILL.sun, FILL.pink];
  return (
    <Frame label={`Bar chart: ${v.bars.map((b) => `${b.label} ${num(b.value)}`).join(", ")}`}>
      <svg viewBox="0 0 344 250" className="h-auto w-full max-w-[26rem]" aria-hidden>
        <ChartAxes min={0} max={v.max} step={v.step} axis={v.axis} X0={X0} X1={X1} Y={Y} />
        {v.bars.map((b, i) => {
          const x = X0 + slot * i + (slot - w) / 2;
          return (
            <g key={i}>
              <rect x={x} y={Y(b.value)} width={w} height={bottom - Y(b.value)} rx="4" fill={fills[i % fills.length]} stroke={INK} strokeWidth="2.5" />
              <text x={x + w / 2} y={bottom + 24} textAnchor="middle" fontSize="16" fontWeight="700" fill={INK}>
                {b.label}
              </text>
            </g>
          );
        })}
      </svg>
    </Frame>
  );
}

function LineGraph({ v }: { v: Extract<ShapeVisualSpec, { kind: "linegraph" }> }) {
  const [X0, X1, top, bottom] = [52, 330, 34, 214];
  const Y = (val: number) => bottom - ((val - v.min) / (v.max - v.min)) * (bottom - top);
  const X = (i: number) => X0 + 16 + (i * (X1 - X0 - 32)) / Math.max(1, v.points.length - 1);
  return (
    <Frame label={`Line graph: ${v.points.map((p) => `${p.label} ${num(p.value)}`).join(", ")}`}>
      <svg viewBox="0 0 344 250" className="h-auto w-full max-w-[26rem]" aria-hidden>
        <ChartAxes min={v.min} max={v.max} step={v.step} axis={v.axis} X0={X0} X1={X1} Y={Y} />
        <polyline points={v.points.map((p, i) => `${X(i)},${Y(p.value)}`).join(" ")} fill="none" stroke={BRAND} strokeWidth="3.5" strokeLinejoin="round" />
        {v.points.map((p, i) => (
          <g key={i}>
            <circle cx={X(i)} cy={Y(p.value)} r="5.5" fill={BRAND} stroke="#fff" strokeWidth="2" />
            <text x={X(i)} y={bottom + 24} textAnchor="middle" fontSize="15" fontWeight="700" fill={INK}>
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </Frame>
  );
}

function Token({ half = false }: { half?: boolean }) {
  return (
    <svg width="26" height="26" viewBox="-15 -15 30 30" aria-hidden>
      {half ? <path d="M 0 -12 A 12 12 0 0 0 0 12 Z" fill="#f5b83d" stroke={INK} strokeWidth="2.2" /> : <circle r="12" fill="#f5b83d" stroke={INK} strokeWidth="2.2" />}
    </svg>
  );
}

function Pictogram({ v }: { v: Extract<ShapeVisualSpec, { kind: "pictogram" }> }) {
  return (
    <Frame label={`Pictogram: ${v.rows.map((r) => `${r.label} ${num(r.value)}`).join(", ")}. Each circle is ${v.key}.`}>
      <div className="w-full max-w-md overflow-hidden rounded-[18px] border-2 border-ink bg-white" aria-hidden>
        {v.rows.map((row, i) => {
          const whole = Math.floor(row.value / v.key);
          const half = row.value % v.key !== 0;
          return (
            <div key={i} className="flex min-h-12 items-center gap-2 border-b-2 border-ink/15 px-3 py-1.5 last:border-b-0">
              <span className="w-[5.5rem] shrink-0 text-[1.0625rem] font-bold text-ink">{row.label}</span>
              <span className="flex flex-wrap gap-0.5">
                {Array.from({ length: whole }, (_, k) => (
                  <Token key={k} />
                ))}
                {half && <Token half />}
              </span>
            </div>
          );
        })}
      </div>
      <figcaption className="mt-2 flex items-center gap-2 text-[1rem] font-bold text-ink-2">
        Key: <Token /> = {v.keyLabel}
      </figcaption>
    </Frame>
  );
}

function TableVisual({ v }: { v: Extract<ShapeVisualSpec, { kind: "table" }> }) {
  return (
    <Frame label={`Table with columns ${v.head.join(", ")}`}>
      <div className="w-full max-w-lg overflow-x-auto rounded-[18px] border-2 border-ink">
        <table className="w-full border-collapse text-[1.0625rem] tabular-nums">
          <thead>
            <tr>
              {v.head.map((h, i) => (
                <th key={i} className="border-b-2 border-ink bg-tile-blue px-3 py-2 text-left font-extrabold text-ink">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {v.rows.map((row, i) => (
              <tr key={i} className="even:bg-raised">
                {row.map((cell, j) => (
                  <td key={j} className={`border-t border-line px-3 py-2 text-ink ${j === 0 ? "font-bold" : "font-medium"}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Frame>
  );
}

export function ShapeVisual({ v }: { v: KitVisual }) {
  switch (v.kind) {
    case "angle":
      return <AngleVisual v={v} />;
    case "angle-split":
      return <AngleSplit v={v} />;
    case "triangle":
      return <TriangleVisual v={v} />;
    case "shape":
      return <ShapePicture v={v} />;
    case "coords":
      return <CoordsGrid v={v} />;
    case "barchart":
      return <BarChart v={v} />;
    case "linegraph":
      return <LineGraph v={v} />;
    case "pictogram":
      return <Pictogram v={v} />;
    case "table":
      return <TableVisual v={v} />;
    default:
      return null;
  }
}
