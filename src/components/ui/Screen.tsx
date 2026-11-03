"use client";

import { CheckIcon } from "@/components/ui/Icons";
import { phaseStatuses } from "@/engine/journey";
import { useStorageStatus } from "@/lib/store";
import { useTopicState } from "@/topics/context";

export function PhasePath() {
  const { topic, learner } = useTopicState();
  const phases = phaseStatuses(topic, learner);
  return (
    <ol className="flex flex-wrap items-center gap-x-1 gap-y-2" aria-label="Learning phases">
      {phases.map(({ phase, status }, i) => (
        <li key={phase} className="flex shrink-0 items-center gap-1">
          <span
            className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold ${
              status === "done" ? "bg-ok-soft text-ok" : status === "current" ? "bg-ink text-white" : "bg-sunk text-muted"
            }`}
            aria-current={status === "current" ? "step" : undefined}
          >
            {status === "done" && <CheckIcon size={13} />}
            {phase}
            <span className="sr-only">{status === "done" ? " (done)" : status === "current" ? " (current)" : ""}</span>
          </span>
          {i < phases.length - 1 && <span className="h-px w-3 bg-line-strong" aria-hidden />}
        </li>
      ))}
    </ol>
  );
}

export function ScreenSkeleton() {
  return (
    <div className="grid animate-pulse gap-5 lg:grid-cols-3" aria-hidden>
      <div className="h-72 rounded-[var(--radius-card)] bg-sunk lg:col-span-2" />
      <div className="h-72 rounded-[var(--radius-card)] bg-sunk" />
      <div className="h-64 rounded-[var(--radius-card)] bg-sunk lg:col-span-2" />
      <div className="h-64 rounded-[var(--radius-card)] bg-sunk" />
    </div>
  );
}

export function StorageNotice() {
  const status = useStorageStatus();
  if (status === "ok") return null;
  return (
    <p role="status" className="rounded-2xl border border-warn/30 bg-warn-soft px-4 py-3 text-[0.9375rem] text-ink-2">
      {status === "unavailable"
        ? "This browser isn't letting us save progress (for example in private browsing). You can keep learning, but progress will be lost when this tab closes."
        : "We found saved progress we couldn't read, so we kept a backup copy in this browser and started fresh."}
    </p>
  );
}

