"use client";

import { FractionShape } from "@/components/math/FractionShape";
import { NumberLine } from "@/components/math/NumberLine";
import { RichText } from "@/components/math/RichText";
import { Counters, FractionWall, StackedBars } from "@/components/math/Visuals";
import { M } from "@/topics/fractions/misconceptions";

/**
 * Targeted visual explanations. Each uses a parallel example (different numbers
 * from the question) so the explanation teaches the idea without giving away the answer.
 */
export function RemedyVisual({ misconception }: { misconception: string }) {
  switch (misconception) {
    case M.SWAP:
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Panel caption="**Bottom number:** count **every** part → 5" tone="den">
            <FractionShape diagram={{ shape: "bar", parts: 5, shaded: [0, 1] }} countParts size="sm" />
          </Panel>
          <Panel caption="**Top number:** count the **shaded** parts → 2" tone="num">
            <FractionShape diagram={{ shape: "bar", parts: 5, shaded: [0, 1] }} countParts={[0, 1]} size="sm" />
          </Panel>
          <p className="text-center text-sm text-ink-2 sm:col-span-2">
            <RichText text="So this bar shows {2/5}, not 5/2." />
          </p>
        </div>
      );
    case M.BIGGER_DEN:
      return (
        <Panel caption="Same whole, more pieces → **smaller** pieces. {1/8} is much smaller than {1/2}.">
          <FractionWall denominators={[1, 2, 3, 4, 6, 8]} highlight={[2, 8]} />
        </Panel>
      );
    case M.UNEQUAL:
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Panel caption="3 **equal** parts — these are thirds ✓" tone="ok">
            <FractionShape diagram={{ shape: "bar", parts: 3, shaded: [0] }} size="sm" />
          </Panel>
          <Panel caption="3 parts, but **not equal** — not thirds ✗" tone="num">
            <FractionShape diagram={{ shape: "bar", parts: 3, shaded: [1], sizes: [1, 2, 1] }} size="sm" />
          </Panel>
        </div>
      );
    case M.PART_PART:
      return (
        <Panel caption="1 shaded + 3 not shaded = **4 parts altogether**. The denominator is 4, so this is {1/4}.">
          <div className="flex w-full flex-col items-center gap-3">
            <FractionShape diagram={{ shape: "bar", parts: 4, shaded: [0] }} countParts size="sm" />
            <div className="flex flex-wrap justify-center gap-2 text-xs font-medium">
              <span className="rounded-full bg-num-soft px-2.5 py-1 text-num-strong">1 shaded</span>
              <span className="rounded-full bg-sunk px-2.5 py-1 text-ink-2">3 not shaded</span>
              <span className="rounded-full bg-den-soft px-2.5 py-1 text-den-strong">4 in the whole</span>
            </div>
          </div>
        </Panel>
      );
    case M.MISCOUNT:
      return (
        <Panel caption="This line has **5 marks** but only **4 gaps**. Count the gaps: it is split into quarters.">
          <NumberLine intervals={4} countGaps size="sm" />
        </Panel>
      );
    case M.UNIT_ONLY:
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Panel caption="**Step 1:** 15 ÷ 3 = 5. That's only {1/3}." tone="den">
            <Counters amount={15} groups={3} highlight={1} />
          </Panel>
          <Panel caption="**Step 2:** {2/3} needs 2 groups: 2 × 5 = 10." tone="num">
            <Counters amount={15} groups={3} highlight={2} />
          </Panel>
        </div>
      );
    case M.ADDITIVE:
      return (
        <Panel caption="Adding 1 to top and bottom turns {1/3} into {2/4} — a **different** amount. Multiplying by 2 gives {2/6} — the **same** amount.">
          <StackedBars
            rows={[
              { f: { n: 1, d: 3 } },
              { f: { n: 2, d: 4 }, label: <span className="text-sm font-semibold text-num-strong">+1 ✗</span> },
              { f: { n: 2, d: 6 }, label: <span className="text-sm font-semibold text-ok">×2 ✓</span> },
            ]}
            guide
          />
        </Panel>
      );
    default:
      return null;
  }
}

function Panel({
  caption,
  tone,
  children,
}: {
  caption: string;
  tone?: "num" | "den" | "ok";
  children: React.ReactNode;
}) {
  const border = tone === "num" ? "border-num/30" : tone === "den" ? "border-den/30" : tone === "ok" ? "border-ok/30" : "border-line";
  return (
    <figure className={`flex flex-col items-center gap-3 rounded-2xl border bg-surface p-4 ${border}`}>
      <div className="flex w-full justify-center">{children}</div>
      <figcaption className="text-center text-sm leading-relaxed text-ink-2">
        <RichText text={caption} />
      </figcaption>
    </figure>
  );
}
