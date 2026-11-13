"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { APPEAR, motionOr } from "@/components/explain/motionTokens";
import { ReadAloud } from "@/components/kid/ReadAloud";
import { RichText } from "@/components/math/RichText";
import { CheckIcon, CloseIcon, LockIcon } from "@/components/ui/Icons";
import { CANVAS_LABEL, CANVAS_PHASES } from "@/engine/topicJourney";

/**
 * D-060: the lesson canvas, the frame every phase of a lesson sits in. Three things only: a thin trail of the six
 * phases across the top, the maths in the middle, and one line of guidance with one button at the bottom. No site
 * navigation, side panels or cards: the concept is the screen.
 */

/** The six phases as a trail. Finished and current phases can be opened; later ones are locked. */
export function Trail({ phase, reached, onOpen }: { phase: number; reached: number; onOpen: (phase: number) => void }) {
  return (
    <nav aria-label="Lesson steps" className="min-w-0 flex-1">
      <ol className="m-0 flex list-none items-stretch gap-1.5 p-0 sm:gap-2">
        {CANVAS_PHASES.map((id, i) => {
          const current = i === phase;
          const done = i < phase || (phase >= CANVAS_PHASES.length && i <= reached);
          const open = i <= reached;
          return (
            <li key={id} className="min-w-0 flex-1">
              <button
                type="button"
                disabled={!open}
                aria-current={current ? "step" : undefined}
                aria-label={`${CANVAS_LABEL[id]}${current ? ", this step" : done ? ", done" : open ? "" : ", locked"}`}
                onClick={() => onOpen(i)}
                className="group flex min-h-11 w-full flex-col justify-center gap-1.5 rounded-lg"
              >
                <span className={`block h-2 w-full rounded-full transition-colors ${current ? "bg-ink" : done ? "bg-ok-bright" : open ? "bg-line-strong group-hover:bg-ink-2" : "bg-sunk"}`} />
                <span className={`hidden items-center gap-1 truncate text-label sm:flex ${current ? "font-extrabold text-ink" : "font-semibold text-muted"}`}>
                  {done && <CheckIcon size={13} strokeWidth={3.5} className="shrink-0 text-ok" />}
                  {!open && <LockIcon size={12} className="shrink-0" />}
                  {CANVAS_LABEL[id]}
                </span>
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
      <header className="sticky top-0 z-30 border-b border-line bg-paper">
        <div className="mx-auto flex min-h-16 max-w-5xl items-center gap-2 px-2 sm:gap-4 sm:px-6">
          <Link href={exitHref} aria-label="Leave the lesson. Your place is saved" className="grid size-11 shrink-0 place-items-center rounded-full text-ink-2 hover:bg-sunk hover:text-ink">
            <CloseIcon size={24} />
          </Link>
          {trail}
          {tools}
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 sm:px-6">{children}</div>
    </div>
  );
}

/** One phase on screen: it fades in, and its heading takes focus so a keyboard or screen reader starts in the right place. */
export function Phase({ id, children }: { id: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.section key={id} aria-labelledby="phase-title" className="flex flex-1 flex-col gap-5 pt-5 sm:gap-6 sm:pt-8" initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={motionOr(reduce, APPEAR)}>
      {children}
    </motion.section>
  );
}

/** What the phase asks, in a few words: a small label, one big line, and at most one sentence under it. */
export function Say({ eyebrow, title, text, focus = true }: { eyebrow: string; title: string; text?: string; focus?: boolean }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focus) ref.current?.focus({ preventScroll: true });
  }, [focus, title]);
  return (
    <div className="flex items-start gap-3">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="text-label font-extrabold uppercase tracking-widest text-muted">{eyebrow}</p>
        <h1 id="phase-title" ref={ref} tabIndex={-1} className="display text-heading-2 text-ink outline-none sm:text-heading-1">
          <RichText text={title} />
        </h1>
        {text && (
          <p className="max-w-reading text-body-lg text-ink-2">
            <RichText text={text} />
          </p>
        )}
      </div>
      <ReadAloud text={text ? `${title} ${text}` : title} label="Read this aloud" />
    </div>
  );
}

/** The bar at the bottom of the screen: one line of guidance (announced when it changes) and the one way on. */
export function Dock({ children, action, tone = "plain" }: { children?: ReactNode; action?: ReactNode; tone?: "plain" | "ok" | "warn" }) {
  const bg = { plain: "bg-paper border-line", ok: "bg-ok-soft border-ok-bright", warn: "bg-warn-soft border-warn-bright" }[tone];
  return (
    <div className={`sticky bottom-0 z-20 -mx-4 mt-auto border-t-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:-mx-6 sm:px-6 ${bg}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div aria-live="polite" className="min-w-0 flex-1 text-body-lg font-semibold text-ink">
          {children}
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
    <div role="tablist" aria-label="Ways to see it" className="inline-flex self-start rounded-full bg-sunk p-1">
      {lenses.map((l, i) => {
        const on = l.id === lens;
        return (
          <button key={l.id} id={`lens-${l.id}`} role="tab" type="button" aria-selected={on} aria-controls="lens-panel" tabIndex={on ? 0 : -1} onClick={() => onLens(l.id)} onKeyDown={(e) => onKey(e, i)} className={`min-h-11 rounded-full px-4 text-label font-extrabold transition-colors sm:px-6 ${on ? "bg-surface text-ink shadow-[var(--shadow-card)] ring-1 ring-line-strong" : "text-ink-2 hover:text-ink"}`}>
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
