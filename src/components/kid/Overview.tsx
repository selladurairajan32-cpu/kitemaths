"use client";

import type { MasterySummary } from "@/engine/overview";

/**
 * D-043 step 3: progress pictures for the kid pages. Colour is never the only signal: every bar and ring comes with
 * words ("2 of 5 skills mastered") and a key.
 */

const PARTS = [
  { key: "mastered", label: "Mastered", fill: "bg-ok", stroke: "stroke-ok" },
  { key: "onTheWay", label: "Nearly there", fill: "bg-den", stroke: "stroke-den" },
  { key: "developing", label: "Learning", fill: "bg-warn", stroke: "stroke-warn" },
  { key: "needsReview", label: "Look again", fill: "bg-num", stroke: "stroke-num" },
] as const;

type Counts = Pick<MasterySummary, "skills" | "mastered" | "onTheWay" | "developing" | "needsReview">;

/** A topic's skills as one bar: mastered, nearly there, learning, look again, then not started. */
export function TopicBar({ o, label }: { o: Counts; label: string }) {
  const pct = (n: number) => (o.skills ? (n / o.skills) * 100 : 0);
  return (
    <div
      role="img"
      aria-label={`${label}: ${o.mastered} of ${o.skills} skills mastered${o.onTheWay ? `, ${o.onTheWay} nearly there` : ""}${o.developing ? `, ${o.developing} learning` : ""}${o.needsReview ? `, ${o.needsReview} to look at again` : ""}`}
      className="flex h-3 w-full overflow-hidden rounded-full bg-sunk"
    >
      {PARTS.map((p) => (o[p.key] ? <span key={p.key} className={`h-full ${p.fill}`} style={{ width: `${pct(o[p.key])}%` }} /> : null))}
    </div>
  );
}

/** The key for the bars and the ring. */
export function MasteryKey({ s }: { s?: Counts }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-label font-semibold text-ink-2">
      {PARTS.map((p) => (
        <li key={p.key} className="flex items-center gap-1.5">
          <span className={`size-3 rounded-full ${p.fill}`} aria-hidden />
          {p.label}
          {s ? ` · ${s[p.key]}` : ""}
        </li>
      ))}
      <li className="flex items-center gap-1.5">
        <span className="size-3 rounded-full border border-line-strong bg-sunk" aria-hidden />
        Not started{s ? ` · ${s.skills - s.mastered - s.onTheWay - s.developing - s.needsReview}` : ""}
      </li>
    </ul>
  );
}

/** The mastery ring: every skill in the child's topics, mastered first, with the share mastered in the middle. */
export function MasteryRing({ s, size = 176 }: { s: Counts; size?: number }) {
  const stroke = 16;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = s.skills ? Math.round((s.mastered / s.skills) * 100) : 0;
  // Each status is an arc that starts where the one before it ended.
  const lens = PARTS.map((p) => (s.skills ? (s[p.key] / s.skills) * c : 0));
  const arcs = PARTS.map((p, i) => ({ key: p.key, stroke: p.stroke, len: lens[i], start: lens.slice(0, i).reduce((a, b) => a + b, 0) })).filter((a) => a.len > 0);
  return (
    <div className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }} role="img" aria-label={`Mastery: ${s.mastered} of ${s.skills} skills mastered, ${pct}%`}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-sunk" />
        {arcs.map((a) => (
          <circle key={a.key} cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className={`fill-none ${a.stroke}`} strokeDasharray={`${a.len} ${c - a.len}`} strokeDashoffset={-a.start} />
        ))}
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center" aria-hidden>
        <span className="display text-heading-1 leading-none text-ink">{pct}%</span>
        <span className="mt-1 text-label font-bold text-ink-2">mastered</span>
      </div>
    </div>
  );
}

/** "Years 3 and 4", "Year 6", "Years 3 to 6". */
export function yearsText(years: number[]): string {
  const ys = [...years].sort((a, b) => a - b);
  if (ys.length === 0) return "";
  if (ys.length === 1) return `Year ${ys[0]}`;
  if (ys.length === 2) return `Years ${ys[0]} and ${ys[1]}`;
  return `Years ${ys[0]} to ${ys[ys.length - 1]}`;
}
