import { BRAND, CORAL, FILL, Frame, GREEN, INK } from "./frame";
import type { ExtraVisualSpec } from "./types";

/** D-037 pictures: pie charts, cuboids, nets, symmetry grids and circles. Each is labelled and readable without colour. */

const SLICE_FILL = [FILL.brand, FILL.num, FILL.ok, FILL.sun, FILL.pink, FILL.plain];
const rad = (d: number) => (d * Math.PI) / 180;
/** A point on a circle, `deg` degrees clockwise from 12 o'clock. */
const clockPoint = (cx: number, cy: number, r: number, deg: number) => [cx + r * Math.sin(rad(deg)), cy - r * Math.cos(rad(deg))] as const;

function Pie({ v }: { v: Extract<ExtraVisualSpec, { kind: "pie" }> }) {
  const total = v.slices.reduce((a, s) => a + s.value, 0);
  const [cx, cy, r] = [130, 130, 110];
  const slices = v.slices.map((s, i) => ({
    ...s,
    a: (v.slices.slice(0, i).reduce((n, x) => n + x.value, 0) / total) * 360,
    sweep: (s.value / total) * 360,
    fill: SLICE_FILL[i % SLICE_FILL.length],
  }));
  return (
    <Frame label={`A pie chart${v.total ? ` of ${v.total}` : ""}: ${v.slices.map((s) => `${s.label} ${Math.round((s.value / total) * 360)} degrees`).join(", ")}`}>
      <svg viewBox="0 0 420 260" className="h-auto w-full max-w-[26rem]" aria-hidden>
        {slices.map((s, i) => {
          if (s.sweep >= 359.9) return <circle key={i} cx={cx} cy={cy} r={r} fill={s.fill} stroke={INK} strokeWidth="3" />;
          const [x1, y1] = clockPoint(cx, cy, r, s.a);
          const [x2, y2] = clockPoint(cx, cy, r, s.a + s.sweep);
          return <path key={i} d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${s.sweep > 180 ? 1 : 0} 1 ${x2} ${y2} Z`} fill={s.fill} stroke={INK} strokeWidth="3" strokeLinejoin="round" />;
        })}
        {slices.map((s, i) => {
          const [x, y] = clockPoint(cx, cy, r * 0.62, s.a + s.sweep / 2);
          return (
            <text key={`n${i}`} x={x} y={y + 7} textAnchor="middle" fontSize="19" fontWeight="800" fill={INK}>
              {String.fromCharCode(65 + i)}
            </text>
          );
        })}
        {slices.map((s, i) => (
          <g key={`k${i}`} transform={`translate(262 ${30 + i * 34})`}>
            <rect width="24" height="24" rx="5" fill={s.fill} stroke={INK} strokeWidth="2" />
            <text x="12" y="18" textAnchor="middle" fontSize="15" fontWeight="800" fill={INK}>
              {String.fromCharCode(65 + i)}
            </text>
            <text x="34" y="18" fontSize="17" fontWeight="700" fill={INK}>
              {s.label}
            </text>
          </g>
        ))}
      </svg>
    </Frame>
  );
}

function Cuboid({ v }: { v: Extract<ExtraVisualSpec, { kind: "cuboid" }> }) {
  const unit = v.unit ?? "cm";
  // Scale so the drawing fits; depth is drawn at half length, slanted up and right.
  const s = Math.min(26, 190 / (v.l + v.w * 0.5), 150 / (v.h + v.w * 0.5));
  const [L, H, D] = [v.l * s, v.h * s, v.w * s * 0.5];
  const [x0, y0] = [84, 30 + D + H];
  const front = `M ${x0} ${y0} h ${L} v ${-H} h ${-L} Z`;
  const top = `M ${x0} ${y0 - H} l ${D} ${-D} h ${L} l ${-D} ${D} Z`;
  const side = `M ${x0 + L} ${y0} l ${D} ${-D} v ${-H} l ${-D} ${D} Z`;
  const grid: string[] = [];
  if (v.cubes) {
    for (let i = 1; i < v.l; i++) grid.push(`M ${x0 + i * s} ${y0} v ${-H} l ${D} ${-D}`);
    for (let j = 1; j < v.h; j++) grid.push(`M ${x0} ${y0 - j * s} h ${L} l ${D} ${-D}`);
    for (let k = 1; k < v.w; k++) grid.push(`M ${x0 + (D * k) / v.w} ${y0 - H - (D * k) / v.w} h ${L} v ${H}`);
  }
  const w = x0 + L + D + 70;
  return (
    <Frame label={`A cuboid ${v.l} ${unit} long, ${v.w} ${unit} wide and ${v.h} ${unit} high`}>
      <svg viewBox={`0 0 ${w} ${y0 + 40}`} className="h-auto w-full max-w-[22rem]" aria-hidden>
        <path d={top} fill={FILL.sun} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d={side} fill={FILL.num} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <path d={front} fill={FILL.brand} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        {grid.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={INK} strokeWidth="1.3" opacity="0.55" />
        ))}
        <text x={x0 + L / 2} y={y0 + 28} textAnchor="middle" fontSize="19" fontWeight="800" fill={BRAND}>
          {v.l} {unit}
        </text>
        <text x={x0 - 8} y={y0 - H / 2 + 6} textAnchor="end" fontSize="19" fontWeight="800" fill={BRAND}>
          {v.h} {unit}
        </text>
        <text x={x0 + L + D / 2 + 10} y={y0 - D / 2 + 6} fontSize="19" fontWeight="800" fill={CORAL}>
          {v.w} {unit}
        </text>
      </svg>
    </Frame>
  );
}

function Net({ v }: { v: Extract<ExtraVisualSpec, { kind: "net" }> }) {
  const c = 44;
  if (v.cells) {
    const cols = Math.max(...v.cells.map(([x]) => x)) + 1;
    const rows = Math.max(...v.cells.map(([, y]) => y)) + 1;
    return (
      <Frame label={`${v.cells.length} squares joined edge to edge`}>
        <svg viewBox={`0 0 ${cols * c + 20} ${rows * c + 20}`} className="h-auto w-full max-w-[18rem]" aria-hidden>
          {v.cells.map(([x, y], i) => (
            <rect key={i} x={10 + x * c} y={10 + y * c} width={c} height={c} fill={i % 2 ? FILL.brand : FILL.ok} stroke={INK} strokeWidth="3" />
          ))}
        </svg>
      </Frame>
    );
  }
  const solid = v.solid ?? "square-pyramid";
  const shapes: string[] = [];
  let label = "";
  let box = "0 0 240 240";
  if (solid === "square-pyramid") {
    label = "The net of a square-based pyramid: a square with a triangle on each side";
    shapes.push("M 80 80 h 80 v 80 h -80 Z", "M 80 80 L 120 10 L 160 80 Z", "M 160 80 L 230 120 L 160 160 Z", "M 80 160 L 120 230 L 160 160 Z", "M 80 80 L 10 120 L 80 160 Z");
  } else if (solid === "triangular-prism") {
    label = "The net of a triangular prism: three rectangles in a row with a triangle on each side of the middle one";
    box = "0 0 300 200";
    shapes.push("M 10 60 h 90 v 80 h -90 Z", "M 100 60 h 90 v 80 h -90 Z", "M 190 60 h 90 v 80 h -90 Z", "M 100 60 L 145 4 L 190 60 Z", "M 100 140 L 145 196 L 190 140 Z");
  } else {
    label = "The net of a tetrahedron: a large triangle made of four equal triangles";
    box = "0 0 260 230";
    shapes.push("M 130 10 L 70 114 L 190 114 Z", "M 70 114 L 10 218 L 130 218 Z", "M 190 114 L 130 218 L 250 218 Z", "M 70 114 L 190 114 L 130 218 Z");
  }
  return (
    <Frame label={label}>
      <svg viewBox={box} className="h-auto w-full max-w-[18rem]" aria-hidden>
        {shapes.map((d, i) => (
          <path key={i} d={d} fill={i === 0 ? FILL.brand : FILL.ok} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        ))}
      </svg>
    </Frame>
  );
}

function Symmetry({ v }: { v: Extract<ExtraVisualSpec, { kind: "symmetry" }> }) {
  const c = 30;
  const n = v.size;
  const mirrored = (x: number, y: number): [number, number] => (v.mirror === "vertical" ? [n - 1 - x, y] : [x, n - 1 - y]);
  const shown = v.reflected ? v.cells.map(([x, y]) => mirrored(x, y)).filter(([x, y]) => !v.cells.some(([a, b]) => a === x && b === y)) : [];
  const lines = Array.from({ length: n + 1 }, (_, i) => i * c + 10);
  return (
    <Frame label={`A ${n} by ${n} grid with ${v.cells.length} shaded squares and a ${v.mirror} mirror line${v.reflected ? ", with the reflection shaded too" : ""}`}>
      <svg viewBox={`0 0 ${n * c + 20} ${n * c + 20}`} className="h-auto w-full max-w-[16rem]" aria-hidden>
        {v.cells.map(([x, y], i) => (
          <rect key={`a${i}`} x={10 + x * c} y={10 + y * c} width={c} height={c} fill={FILL.brand} />
        ))}
        {shown.map(([x, y], i) => (
          <rect key={`b${i}`} x={10 + x * c} y={10 + y * c} width={c} height={c} fill={FILL.num} />
        ))}
        {lines.map((p) => (
          <g key={p}>
            <line x1={p} y1={10} x2={p} y2={n * c + 10} stroke={INK} strokeWidth="1" opacity="0.35" />
            <line x1={10} y1={p} x2={n * c + 10} y2={p} stroke={INK} strokeWidth="1" opacity="0.35" />
          </g>
        ))}
        {v.mirror === "vertical" ? (
          <line x1={(n * c) / 2 + 10} y1={2} x2={(n * c) / 2 + 10} y2={n * c + 18} stroke={CORAL} strokeWidth="4" strokeDasharray="10 6" />
        ) : (
          <line x1={2} y1={(n * c) / 2 + 10} x2={n * c + 18} y2={(n * c) / 2 + 10} stroke={CORAL} strokeWidth="4" strokeDasharray="10 6" />
        )}
      </svg>
    </Frame>
  );
}

function CircleParts({ v }: { v: Extract<ExtraVisualSpec, { kind: "circle" }> }) {
  const [cx, cy, r] = [130, 120, 100];
  return (
    <Frame label={`A circle${v.centre ? " with its centre marked" : ""}${v.radius ? `, a radius of ${v.radius}` : ""}${v.diameter ? `, a diameter of ${v.diameter}` : ""}`}>
      <svg viewBox="0 0 260 240" className="h-auto w-full max-w-[16rem]" aria-hidden>
        <circle cx={cx} cy={cy} r={r} fill={FILL.brand} stroke={INK} strokeWidth="4" />
        {v.diameter && (
          <>
            <line x1={cx - r} y1={cy + 34} x2={cx + r} y2={cy + 34} stroke={GREEN} strokeWidth="4" />
            <text x={cx} y={cy + 62} textAnchor="middle" fontSize="19" fontWeight="800" fill={INK}>
              {v.diameter}
            </text>
          </>
        )}
        {v.radius && (
          <>
            <line x1={cx} y1={cy} x2={cx + r * 0.71} y2={cy - r * 0.71} stroke={CORAL} strokeWidth="4" />
            <text x={cx + 26} y={cy - 46} textAnchor="end" fontSize="19" fontWeight="800" fill={INK}>
              {v.radius}
            </text>
          </>
        )}
        {(v.centre ?? true) && <circle cx={cx} cy={cy} r="6" fill={INK} />}
      </svg>
    </Frame>
  );
}

export function ExtraVisual({ v }: { v: ExtraVisualSpec }) {
  switch (v.kind) {
    case "pie":
      return <Pie v={v} />;
    case "cuboid":
      return <Cuboid v={v} />;
    case "net":
      return <Net v={v} />;
    case "symmetry":
      return <Symmetry v={v} />;
    case "circle":
      return <CircleParts v={v} />;
  }
}
