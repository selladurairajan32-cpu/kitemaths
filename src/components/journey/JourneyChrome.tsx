"use client";

import { Fragment } from "react";
import { RichText } from "@/components/math/RichText";
import { Pic, type PicName } from "@/components/paper/Pic";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, CheckIcon, LockIcon } from "@/components/ui/Icons";
import { JOURNEY_STAGES, STAGE_LABEL, type JourneyProgress, type JourneyStage } from "@/engine/topicJourney";
import type { JourneyDef } from "@/topics/kit/journeys";
import { STAGE_FIELD } from "@/components/kid/fields";

/**
 * D-046: the topic journey in the sky-and-glass look of the concept images: the journey bar with a 3D picture per stage,
 * the "Key idea" card beside the lesson, and the strip under Learn (the guide, a quick check, the mistake to watch out
 * for, key notes, and one yellow button on to Practise).
 */

export const STAGE_PIC: Record<JourneyStage, PicName> = { learn: "play", practise: "target", apply: "puzzle", check: "brain", complete: "trophy" };

/** The five stages; open ones can be revisited, the rest are locked. */
export function JourneyBar({ p, onOpen }: { p: JourneyProgress; onOpen: (i: number) => void }) {
  return (
    <ol className="panel m-0 flex list-none items-center justify-between gap-1 rounded-[28px] p-2 sm:gap-2 sm:px-4" aria-label="Your learning journey">
      {JOURNEY_STAGES.map((s, i) => {
        const open = i <= p.reached;
        const current = i === p.stage;
        const done = i < p.reached;
        return (
          <Fragment key={s}>
            {i > 0 && (
              <li aria-hidden className={`hidden h-1 flex-1 rounded-full sm:block ${i <= p.reached ? "bg-ok-bright" : "bg-line"}`} />
            )}
            <li className="flex min-w-0 flex-1 justify-center sm:flex-none">
              <button
                type="button"
                disabled={!open}
                onClick={() => onOpen(i)}
                aria-current={current ? "step" : undefined}
                aria-label={`${i + 1}. ${STAGE_LABEL[s]}${done ? ", done" : open ? "" : ", locked"}`}
                className={`flex min-h-14 w-full flex-col items-center justify-center gap-0.5 rounded-[20px] px-0.5 py-1.5 transition sm:w-auto sm:flex-row sm:gap-2 sm:px-3 ${
                  current ? `${STAGE_FIELD[s].bg} ${STAGE_FIELD[s].text}` : open ? "hover:bg-sunk" : ""
                } disabled:cursor-not-allowed`}
              >
                <span className={`relative grid size-9 place-items-center rounded-full sm:size-10 ${current ? "bg-surface" : open ? STAGE_FIELD[s].soft : ""}`}>
                  <Pic name={STAGE_PIC[s]} size={28} muted={!open} />
                  {done && (
                    <span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full bg-ok-bright text-white ring-2 ring-white">
                      <CheckIcon size={11} strokeWidth={3.5} />
                    </span>
                  )}
                  {!open && (
                    <span className="absolute -bottom-1 -right-1 grid size-5 place-items-center rounded-full bg-surface text-ink-2 ring-1 ring-line">
                      <LockIcon size={11} />
                    </span>
                  )}
                </span>
                <span className={`whitespace-nowrap text-label leading-tight [overflow-wrap:normal] ${current ? "font-extrabold" : open ? "font-bold text-ink" : "font-semibold text-ink-2"}`}>{STAGE_LABEL[s]}</span>
              </button>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}

/** The one idea to take away, as words and a bar model. */
export function KeyIdeaCard({ def }: { def: JourneyDef }) {
  const { cells, blue, orange, caption } = def.keyBar;
  return (
    // White under the words: fraction denominators need white for 4.5:1 (on the pale yellow they are 4.36:1).
    <section aria-labelledby="key-idea-title" className="flex flex-col gap-3 self-start overflow-hidden rounded-[24px] border-2 border-field-yellow bg-surface p-4">
      <h2 id="key-idea-title" className="-m-4 mb-0 flex items-center gap-2 bg-field-yellow px-4 py-3 text-title font-extrabold text-ink">
        <Pic name="bulb" size={30} /> Key idea
      </h2>
      <p className="text-body font-semibold text-ink">
        <RichText text={def.keyIdea} />
      </p>
      <div className="rounded-[18px] border border-line bg-surface p-3">
        <div className="flex h-9 overflow-hidden rounded-[10px] border-2 border-ink" role="img" aria-label={`A bar of ${cells} equal parts: ${blue} blue and ${orange} orange.`}>
          {Array.from({ length: cells }, (_, i) => (
            <span key={i} className={`flex-1 ${i > 0 ? "border-l-2 border-ink" : ""} ${i < blue ? "bg-brand" : i < blue + orange ? "bg-num" : "bg-surface"}`} />
          ))}
        </div>
        <p className="mt-2 text-center text-body font-extrabold text-ink">
          <RichText text={caption} />
        </p>
      </div>
    </section>
  );
}

/** D-052: each kind of note keeps its UX-004 content-type colour (a tinted band and edge); its words sit on white. */
const KIND = {
  next: { band: "bg-success-soft text-success-ink", edge: "border-success-edge" },
  watch: { band: "bg-misconception-soft text-misconception-ink", edge: "border-misconception-edge" },
  notes: { band: "bg-rule-soft text-rule-ink", edge: "border-rule-edge" },
} as const;

function StripCard({ pic, title, kind, children }: { pic: PicName; title: string; kind: keyof typeof KIND; children: React.ReactNode }) {
  return (
    <section className={`flex min-w-0 flex-col overflow-hidden rounded-[22px] border-2 bg-surface ${KIND[kind].edge}`} aria-label={title}>
      <h3 className={`flex items-center gap-2 px-4 py-2.5 text-body font-extrabold ${KIND[kind].band}`}>
        <Pic name={pic} size={26} /> {title}
      </h3>
      <div className="px-4 pb-4 pt-3 text-label font-semibold text-ink">{children}</div>
    </section>
  );
}

/** Under Learn: the guide, what comes next, the mistake to avoid, the notes, and the way on. */
export function LearnStrip({ def, onNotes, onPractise }: { def: JourneyDef; onNotes: () => void; onPractise: () => void }) {
  return (
    <div className="grid items-stretch gap-3 md:grid-cols-3 xl:grid-cols-[15rem_repeat(3,minmax(0,1fr))_auto]">
      <div className="flex items-end gap-2 md:col-span-3 xl:col-span-1">
        <Pic name="guide-point" size={84} className="-mb-1 shrink-0" />
        <p className="panel mb-8 rounded-[20px] rounded-bl-[6px] px-3 py-2 text-label font-bold text-ink">Watch, step through or try it. Then practise!</p>
      </div>
      <StripCard pic="check" title="Up next" kind="next">
        <p>{def.practise.length} practice questions, from easy to tricky.</p>
      </StripCard>
      <StripCard pic="warning" title="Watch out" kind="watch">
        <p>
          <RichText text={def.misconception} />
        </p>
      </StripCard>
      <StripCard pic="memo" title="Key notes" kind="notes">
        <ul className="m-0 list-disc pl-5">
          {def.keyNotes.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
        <button type="button" onClick={onNotes} className="mt-1 inline-flex min-h-11 items-center font-bold text-brand-strong underline underline-offset-4">
          All notes
        </button>
      </StripCard>
      <div className="sticky bottom-[5.5rem] z-10 flex items-center md:col-span-3 xl:static xl:col-span-1">
        <Button variant="cta" size="xl" onClick={onPractise} className="w-full shadow-[var(--shadow-lift)] xl:w-auto">
          Practise this <ArrowRightIcon size={20} />
        </Button>
      </div>
    </div>
  );
}
