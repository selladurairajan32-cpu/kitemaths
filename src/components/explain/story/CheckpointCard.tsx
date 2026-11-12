"use client";

import { useState, type Dispatch } from "react";
import { Button } from "@/components/ui/Button";
import { checkpointStatus, type Chapter, type StoryEvent, type StoryState } from "@/engine/story";

/**
 * The micro-checkpoint at the end of a chapter (D-040). The child types a number and presses Check. A wrong answer
 * replays the chapter's key beat (the story machine does that), then this card asks again with a hint and offers
 * "Show me". A right answer, or "Show me", shows the worked answer and unlocks the next chapter.
 */
export function CheckpointCard<S>({ chapters, state, dispatch }: { chapters: Chapter<S>[]; state: StoryState; dispatch: Dispatch<StoryEvent> }) {
  const ch = chapters[state.chapter]!;
  const status = checkpointStatus(state);
  const [value, setValue] = useState("");
  if (status === "hidden") return null;
  const last = state.chapter === chapters.length - 1;
  const id = `checkpoint-${ch.id}`;

  if (status === "passed") {
    return (
      <section aria-labelledby={`${id}-title`} className="flex flex-col gap-3 rounded-[var(--radius-card)] border-2 border-ok bg-ok-soft p-4 sm:p-5">
        <h3 id={`${id}-title`} className="text-title font-extrabold text-ok">{state.shown ? "Here's how" : "Yes, that's right!"}</h3>
        <p className="text-body font-semibold text-ink">{ch.checkpoint.worked}</p>
        {!last ? (
          <Button onClick={() => dispatch({ type: "next" })} className="self-start">
            Next chapter: {chapters[state.chapter + 1]!.title}
          </Button>
        ) : (
          <p className="text-body font-bold text-ink">You&apos;ve finished every chapter. Try it yourself next.</p>
        )}
      </section>
    );
  }

  return (
    <section aria-labelledby={`${id}-title`} className="flex flex-col gap-3 rounded-[var(--radius-card)] border-2 border-brand bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
      <p className="text-label font-bold text-brand-strong">Quick check</p>
      <h3 id={`${id}-title`} className="text-title font-extrabold text-ink">{ch.checkpoint.prompt}</h3>
      {status === "wrong" && (
        <p className="rounded-[14px] bg-sun-soft px-3 py-2 text-body font-semibold text-ink" role="status">
          Not quite. Hint: {ch.checkpoint.hint}
        </p>
      )}
      <form
        className="flex flex-wrap items-center gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const n = Number(value.trim());
          if (value.trim() === "" || !Number.isFinite(n)) return;
          dispatch({ type: "answer", value: n });
          setValue("");
        }}
      >
        <label htmlFor={`${id}-input`} className="sr-only">Your answer</label>
        <input
          id={`${id}-input`}
          inputMode="decimal"
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^\d]/g, "").slice(0, 5))}
          className="h-14 w-32 rounded-[14px] border-2 border-line-strong bg-surface px-4 text-center text-title font-extrabold tabular-nums text-ink focus:border-brand"
        />
        {ch.checkpoint.unit && <span className="text-body font-bold text-ink-2">{ch.checkpoint.unit}</span>}
        <Button type="submit" disabled={value.trim() === ""}>Check</Button>
        {status === "wrong" && (
          <Button variant="secondary" onClick={() => dispatch({ type: "showMe" })}>
            Show me
          </Button>
        )}
      </form>
    </section>
  );
}
