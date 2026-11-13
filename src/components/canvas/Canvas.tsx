"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { APPEAR, motionOr } from "@/components/explain/motionTokens";
import { ReadAloud } from "@/components/kid/ReadAloud";
import { RichText } from "@/components/math/RichText";
import { ArrowRightIcon, BeakerIcon, BulbIcon, CheckIcon, FlagIcon, LockIcon, StarIcon } from "@/components/ui/Icons";
import { CANVAS_LABEL, CANVAS_PHASES, type CanvasPhase } from "@/engine/topicJourney";

/**
 * The lesson canvas (D-060) in the first prototype's Lesson Studio look (D-066). The site's own header stays; under it a
 * page title, then a list of the lesson's six steps on the left and one white card on the right with the step: a small
 * line saying what kind of step it is, the title in Fraunces, the maths, a note, and Back and Continue at the foot. On a
 * phone the list folds into one "Step 2 of 6" button, and Back and Continue stay at the bottom of the screen.
 */

/** What each step is, as the prototype's step list shows it: the kind of step, then what you do in it. */
const STEP: Record<CanvasPhase, { kind: string; title: string; icon: ReactNode }> = {
  discover: { kind: "Discover", title: "Have a guess", icon: <BulbIcon size={15} /> },
  explore: { kind: "Explore", title: "Try it yourself", icon: <BeakerIcon size={15} /> },
  understand: { kind: "Understand", title: "See why it works", icon: <StarIcon size={15} /> },
  practise: { kind: "Your turn", title: "Practise", icon: <FlagIcon size={15} /> },
  apply: { kind: "Your turn", title: "Real-life problems", icon: <FlagIcon size={15} /> },
  prove: { kind: "Prove it", title: "Show what you know", icon: <FlagIcon size={15} /> },
};

function StepList({ phase, reached, onOpen }: { phase: number; reached: number; onOpen: (phase: number) => void }) {
  return (
    <ol className="space-y-1">
      {CANVAS_PHASES.map((id, i) => {
        const current = i === phase;
        const done = i < phase || (phase >= CANVAS_PHASES.length && i <= reached);
        const open = i <= reached;
        return (
          <li key={id}>
            <button
              type="button"
              disabled={!open}
              aria-current={current ? "step" : undefined}
              aria-label={`${CANVAS_LABEL[id]}${current ? ", this step" : done ? ", done" : open ? "" : ", locked"}`}
              onClick={() => onOpen(i)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${current ? "border border-line bg-surface shadow-[var(--shadow-card)]" : open ? "hover:bg-sunk" : ""}`}
            >
              <span className={`grid size-8 shrink-0 place-items-center rounded-full ${current ? "bg-ink text-white" : done ? "bg-ok-soft text-ok" : "bg-sunk text-muted"}`} aria-hidden>
                {done && !current ? <CheckIcon size={15} /> : open ? STEP[id].icon : <LockIcon size={14} />}
              </span>
              <span className="min-w-0">
                <span className="eyebrow block">{STEP[id].kind}</span>
                <span className={`block text-label ${current ? "font-medium text-ink" : open ? "text-ink-2" : "text-muted"}`}>{STEP[id].title}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/** The six steps of a lesson: a list on a wide screen, one button that opens it on a phone. */
export function Trail({ phase, reached, onOpen }: { phase: number; reached: number; onOpen: (phase: number) => void }) {
  const [open, setOpen] = useState(false);
  const at = Math.min(phase, CANVAS_PHASES.length - 1);
  const pick = (i: number) => {
    setOpen(false);
    onOpen(i);
  };
  return (
    <nav aria-label="Lesson steps">
      <div className="hidden lg:block">
        <StepList phase={phase} reached={reached} onOpen={pick} />
      </div>
      <div className="lg:hidden">
        <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 text-left text-label font-medium text-ink">
          <span className="min-w-0 truncate">
            {phase >= CANVAS_PHASES.length ? "All steps done" : `Step ${phase + 1} of ${CANVAS_PHASES.length}: ${STEP[CANVAS_PHASES[at]!].title}`}
          </span>
          <ArrowRightIcon size={15} className={`shrink-0 text-muted transition-transform ${open ? "rotate-90" : ""}`} />
        </button>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-sunk" aria-hidden>
          <div className="h-full rounded-full bg-den transition-all" style={{ width: `${(Math.min(phase + 1, CANVAS_PHASES.length) / CANVAS_PHASES.length) * 100}%` }} />
        </div>
        {open && (
          <div className="mt-2 rounded-xl border border-line bg-surface p-2">
            <StepList phase={phase} reached={reached} onOpen={pick} />
          </div>
        )}
      </div>
    </nav>
  );
}

/**
 * The Lesson Studio page: its header (`studio`: the page title and the lesson chooser), the lesson's name and steps on the
 * left, and the step's card on the right.
 */
export function CanvasShell({ studio, lesson, trail, tools, children }: { studio: ReactNode; lesson: ReactNode; trail: ReactNode; tools?: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-5">
      {studio}
      <div className="grid gap-5 lg:grid-cols-[17rem_minmax(0,1fr)] lg:items-start">
        <div className="space-y-3 lg:sticky lg:top-24">
          {lesson}
          {trail}
          {tools}
        </div>
        <div className="card flex min-w-0 flex-col p-5 sm:p-8">{children}</div>
      </div>
    </div>
  );
}

/** One step on screen: it fades in, and its heading takes focus so a keyboard or screen reader starts in the right place. */
export function Phase({ id, children }: { id: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.section key={id} aria-labelledby="phase-title" className="flex flex-1 flex-col gap-6" initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={motionOr(reduce, APPEAR)}>
      {children}
    </motion.section>
  );
}

/** The top of a step, as in the prototype: "Discover · Step 1 of 6", the title in Fraunces, and at most one paragraph. */
export function Say({ eyebrow, title, text, focus = true }: { eyebrow: string; title: string; text?: string; focus?: boolean }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focus) ref.current?.focus({ preventScroll: true });
  }, [focus, title]);
  return (
    <div className="flex flex-col gap-3">
      <p className="flex items-center gap-1.5 text-label font-medium text-muted">
        <BulbIcon size={15} />
        {eyebrow}
      </p>
      <div className="flex items-start gap-3">
        <h2 id="phase-title" ref={ref} tabIndex={-1} className="display min-w-0 flex-1 text-heading-2 leading-tight text-ink outline-none sm:text-heading-1">
          <RichText text={title} />
        </h2>
        <ReadAloud text={text ? `${title} ${text}` : title} label="Read this aloud" />
      </div>
      {text && (
        <p className="max-w-2xl text-body text-ink-2">
          <RichText text={text} />
        </p>
      )}
    </div>
  );
}

/**
 * The foot of a step: a note (announced when it changes; green when something is right, amber when it isn't), then the
 * way on. On a phone the buttons stay at the bottom of the screen, above the navigation bar.
 */
export function Dock({ children, action, tone = "plain" }: { children?: ReactNode; action?: ReactNode; tone?: "plain" | "ok" | "warn" }) {
  const note = { plain: "border-line bg-paper", ok: "border-ok/30 bg-ok-soft", warn: "border-warn/30 bg-warn-soft" }[tone];
  return (
    <div className="mt-auto flex flex-col gap-5">
      <div aria-live="polite">
        {children && (
          <div className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-body text-ink ${note}`}>
            <span className={`mt-1 shrink-0 ${tone === "ok" ? "text-ok" : tone === "warn" ? "text-warn" : "text-muted"}`} aria-hidden>
              {tone === "ok" ? <CheckIcon size={16} /> : <BulbIcon size={16} />}
            </span>
            <span className="min-w-0">{children}</span>
          </div>
        )}
      </div>
      {action && (
        <div className="sticky bottom-16 z-20 -mx-5 flex flex-wrap items-center justify-end gap-2 border-t border-line bg-surface px-5 py-4 sm:-mx-8 sm:px-8 lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-5">
          {action}
        </div>
      )}
    </div>
  );
}

export interface Lens {
  id: string;
  label: string;
}

/**
 * D-060: several ways to see the same idea, as the prototype's segmented switch. The step being explained belongs to the
 * lesson, not to the lens, so changing lens keeps the child's place.
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
    <div role="tablist" aria-label="Ways to see it" className="inline-flex self-start rounded-xl bg-sunk p-1">
      {lenses.map((l, i) => {
        const on = l.id === lens;
        return (
          <button key={l.id} id={`lens-${l.id}`} role="tab" type="button" aria-selected={on} aria-controls="lens-panel" tabIndex={on ? 0 : -1} onClick={() => onLens(l.id)} onKeyDown={(e) => onKey(e, i)} className={`inline-flex h-11 items-center rounded-lg px-4 text-label font-medium transition-colors ${on ? "bg-surface text-ink shadow-[var(--shadow-card)]" : "text-muted hover:text-ink"}`}>
            {l.label}
          </button>
        );
      })}
    </div>
  );
}

/** Where a lesson is within a step: small dots, the current one long. */
export function Dots({ count, at, label }: { count: number; at: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5" role="img" aria-label={label}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={`h-2 rounded-full transition-all ${i === at ? "w-7 bg-ink" : i < at ? "w-2 bg-ok" : "w-2 bg-line-strong"}`} />
      ))}
    </div>
  );
}
