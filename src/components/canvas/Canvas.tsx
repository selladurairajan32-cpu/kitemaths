"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { MOVE, motionOr } from "@/components/explain/motionTokens";
import { FIELDS, type Field } from "@/components/kid/fields";
import { Kip, type KipMood } from "@/components/kid/Kip";
import { ReadAloud } from "@/components/kid/ReadAloud";
import { RichText } from "@/components/math/RichText";
import { CheckIcon, CloseIcon } from "@/components/ui/Icons";
import { CANVAS_LABEL, CANVAS_PHASES } from "@/engine/topicJourney";

/**
 * The lesson canvas (D-060), in the Playground look (D-064): the frame every phase of a lesson sits in. A row of six
 * chunky numbered steps across the top (each phase its own colour), Kip saying what to do in a speech bubble, the maths
 * in the middle, and one line of guidance with one big button at the bottom. No site navigation or side panels.
 */

/** Each phase has its own colour, so a child always knows which part of the lesson they are in. */
export const PHASE_FIELD: Record<string, Field> = { discover: FIELDS.pink, explore: FIELDS.orange, understand: FIELDS.teal, practise: FIELDS.blue, apply: FIELDS.green, prove: FIELDS.navy };
const fieldOf = (eyebrow: string) => PHASE_FIELD[eyebrow.trim().split(/[\s·]/)[0]!.toLowerCase()] ?? FIELDS.blue;

/** The six phases as a row of chunky steps. Finished and current phases can be opened; later ones are locked. */
export function Trail({ phase, reached, onOpen }: { phase: number; reached: number; onOpen: (phase: number) => void }) {
  return (
    <nav aria-label="Lesson steps" className="min-w-0 flex-1">
      <ol className="m-0 flex list-none items-center gap-1.5 p-0 sm:gap-2">
        {CANVAS_PHASES.map((id, i) => {
          const current = i === phase;
          const done = i < phase || (phase >= CANVAS_PHASES.length && i <= reached);
          const open = i <= reached;
          const f = PHASE_FIELD[id]!;
          return (
            <li key={id} className={current ? "min-w-0 flex-[2.2]" : "min-w-0 flex-1"}>
              <button
                type="button"
                disabled={!open}
                aria-current={current ? "step" : undefined}
                aria-label={`${CANVAS_LABEL[id]}${current ? ", this step" : done ? ", done" : open ? "" : ", locked"}`}
                onClick={() => onOpen(i)}
                className={`flex h-11 w-full items-center justify-center gap-1.5 rounded-full px-2 text-label font-extrabold transition-colors ${current ? `${f.bg} ${f.text}` : done ? "bg-ok-bright text-white" : open ? "bg-line-strong text-ink" : "bg-sunk text-muted"}`}
              >
                {done && !current ? <CheckIcon size={16} strokeWidth={4} className="shrink-0" /> : <span className="shrink-0">{i + 1}</span>}
                {current && <span className="truncate">{CANVAS_LABEL[id]}</span>}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function CanvasShell({ exitHref, trail, tools, children }: { exitHref: string; trail: ReactNode; tools?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="sticky top-0 z-30 border-b-2 border-line bg-paper">
        <div className="mx-auto flex min-h-[4.5rem] max-w-4xl items-center gap-2 px-3 sm:gap-4 sm:px-6">
          <Link href={exitHref} aria-label="Leave the lesson. Your place is saved" className="grid size-11 shrink-0 place-items-center rounded-full bg-sunk text-ink hover:bg-line">
            <CloseIcon size={22} strokeWidth={3} />
          </Link>
          {trail}
          {tools}
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 sm:px-6">{children}</div>
    </div>
  );
}

/** One phase on screen: it pops in, and its heading takes focus so a keyboard or screen reader starts in the right place. */
export function Phase({ id, children }: { id: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.section key={id} aria-labelledby="phase-title" className="flex flex-1 flex-col gap-5 pt-5 sm:gap-7 sm:pt-8" initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={motionOr(reduce, MOVE)}>
      {children}
    </motion.section>
  );
}

/**
 * What the phase asks, said by Kip in a speech bubble: the phase's name on a coloured tag, one big line, and at most
 * one sentence under it. The bubble takes the phase's colour.
 */
export function Say({ eyebrow, title, text, focus = true, mood = "happy" }: { eyebrow: string; title: string; text?: string; focus?: boolean; mood?: KipMood }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const f = fieldOf(eyebrow);
  useEffect(() => {
    if (focus) ref.current?.focus({ preventScroll: true });
  }, [focus, title]);
  return (
    <div className="flex items-start gap-3 sm:gap-4">
      <span className="mt-2 hidden shrink-0 sm:block">
        <Kip mood={mood} size={76} float />
      </span>
      <div className={`relative flex min-w-0 flex-1 flex-col items-start gap-2 rounded-[28px] p-5 sm:rounded-tl-[8px] sm:p-6 ${f.soft}`}>
        <p className={`rounded-full px-4 py-1 text-label font-extrabold ${f.bg} ${f.text}`}>{eyebrow}</p>
        <div className="flex w-full items-start gap-3">
          <h1 id="phase-title" ref={ref} tabIndex={-1} className="display min-w-0 flex-1 text-heading-2 text-ink outline-none sm:text-heading-1">
            <RichText text={title} />
          </h1>
          <ReadAloud text={text ? `${title} ${text}` : title} label="Read this aloud" />
        </div>
        {text && (
          <p className="max-w-reading text-body-lg font-semibold text-ink">
            <RichText text={text} />
          </p>
        )}
      </div>
    </div>
  );
}

/** The bar at the bottom of the screen: one line of guidance (announced when it changes) and the one big way on. */
export function Dock({ children, action, tone = "plain" }: { children?: ReactNode; action?: ReactNode; tone?: "plain" | "ok" | "warn" }) {
  const bg = { plain: "bg-paper border-line", ok: "bg-ok-soft border-ok-bright", warn: "bg-warn-soft border-warn-bright" }[tone];
  return (
    <div className={`sticky bottom-0 z-20 -mx-4 mt-auto border-t-4 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:-mx-6 sm:px-6 ${bg}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div aria-live="polite" className="flex min-w-0 flex-1 items-center gap-3 text-title font-bold text-ink">
          {tone === "ok" && (
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ok-bright text-white" aria-hidden>
              <CheckIcon size={20} strokeWidth={4} />
            </span>
          )}
          <span className="min-w-0">{children}</span>
        </div>
        {action && <div className="flex shrink-0 flex-wrap justify-end gap-2">{action}</div>}
      </div>
    </div>
  );
}

export interface Lens {
  id: string;
  label: string;
}

/**
 * D-060: several ways to see the same idea, as a small switch. The step being explained belongs to the lesson, not to
 * the lens, so changing lens keeps the child's place.
 */
export function LensSwitch({ lenses, lens, onLens }: { lenses: Lens[]; lens: string; onLens: (id: string) => void }) {
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: lenses.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const to = lenses[(next + lenses.length) % lenses.length]!;
    onLens(to.id);
    document.getElementById(`lens-${to.id}`)?.focus();
  };
  return (
    <div role="tablist" aria-label="Ways to see it" className="inline-flex self-start rounded-full bg-sunk p-1.5">
      {lenses.map((l, i) => {
        const on = l.id === lens;
        return (
          <button key={l.id} id={`lens-${l.id}`} role="tab" type="button" aria-selected={on} aria-controls="lens-panel" tabIndex={on ? 0 : -1} onClick={() => onLens(l.id)} onKeyDown={(e) => onKey(e, i)} className={`min-h-12 rounded-full px-5 text-body font-extrabold transition-colors sm:px-7 ${on ? "bg-ink text-white" : "text-ink-2 hover:text-ink"}`}>
            {l.label}
          </button>
        );
      })}
    </div>
  );
}

/** Where a lesson is within a phase: small dots, the current one long. */
export function Dots({ count, at, label }: { count: number; at: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5" role="img" aria-label={label}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={`h-2 rounded-full transition-all ${i === at ? "w-7 bg-ink" : i < at ? "w-2 bg-ok-bright" : "w-2 bg-line-strong"}`} />
      ))}
    </div>
  );
}
