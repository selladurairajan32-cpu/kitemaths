"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";
import { MOVE, motionOr, STAGGER } from "@/components/explain/motionTokens";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/Icons";
import { FIELDS, type Field } from "./fields";

/**
 * D-064 "Playground": the look of the child's way through the app (Home, Topics, a topic's path, the lesson). Written
 * for a primary-school child: big friendly words and few of them, a picture for everything, one bright colour block per
 * idea, and one big yellow button that is always the next thing to do. Things pop in, lift when pointed at and squash
 * when pressed, so the page feels alive without anything moving for no reason (reduced motion turns it all off).
 */

export const Page = ({ children }: { children: ReactNode }) => <div className="mx-auto flex max-w-5xl flex-col gap-8 pb-8 sm:gap-10">{children}</div>;

/** Something that pops into place when the page opens; `i` staggers a row of them. */
export function Pop({ i = 0, children, className = "" }: { i?: number; children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} initial={reduce ? false : { opacity: 0, y: 18, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={motionOr(reduce, { ...MOVE, delay: Math.min(i, 8) * (STAGGER / 3) })}>
      {children}
    </motion.div>
  );
}

const MotionLink = motion.create(Link);

/** A link that lifts when pointed at and squashes when pressed: every tile, stop and card a child can open. */
export function Lift({ className = "", children, ...props }: ComponentProps<typeof MotionLink>) {
  return (
    <MotionLink className={className} whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }} transition={MOVE} {...props}>
      {children}
    </MotionLink>
  );
}

/** The top of a page: one flat colour block with the page's name in big letters and a picture that bobs gently. */
export function Hero({ field = FIELDS.blue, id, tag, title, line, picture, children }: { field?: Field; id: string; tag?: ReactNode; title: ReactNode; line?: ReactNode; picture?: ReactNode; children?: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <section aria-labelledby={id} className={`relative overflow-hidden rounded-[var(--radius-hero)] px-6 py-8 sm:px-10 sm:py-10 ${field.bg} ${field.text}`}>
      <div className="flex items-center gap-6">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-3">
          {tag && <div className="rounded-full bg-field-yellow px-4 py-1 text-label font-extrabold text-ink">{tag}</div>}
          <h1 id={id} className="display text-heading-1 sm:text-display-1">
            {title}
          </h1>
          {line && <p className="max-w-xl text-body-lg font-semibold">{line}</p>}
          {children}
        </div>
        {picture && (
          <motion.div className="hidden shrink-0 sm:block" aria-hidden animate={reduce ? undefined : { y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
            {picture}
          </motion.div>
        )}
      </div>
    </section>
  );
}

/** The one big yellow button of a page. */
export function GoLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Lift href={href} className={`press inline-flex min-h-16 items-center justify-center gap-3 rounded-full border-cta-strong bg-cta px-9 text-title font-extrabold text-ink ${className}`}>
      {children} <ArrowRightIcon size={24} strokeWidth={3} />
    </Lift>
  );
}

/** A section's name, with a picture in front of it. */
export function Heading({ id, picture, children, side }: { id: string; picture?: ReactNode; children: ReactNode; side?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 id={id} className="display flex items-center gap-3 text-heading-2 text-ink sm:text-heading-1">
        {picture}
        {children}
      </h2>
      {side}
    </div>
  );
}

/** How far along something is, as chunky pips: done, here, to come. The words are in `label`. */
export function Pips({ count, done, label, onDark = false }: { count: number; done: number; label: string; onDark?: boolean }) {
  return (
    <div role="img" aria-label={label} className="flex w-full max-w-sm gap-1.5">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={`h-3 flex-1 rounded-full ${i < done ? "bg-ok-bright" : i === done ? (onDark ? "bg-field-yellow" : "bg-ink") : onDark ? "bg-white/30" : "bg-sunk"}`} />
      ))}
    </div>
  );
}

/** A thick bar that fills from the left when it appears. */
export function Fill({ value, label, onDark = false }: { value: number; label: string; onDark?: boolean }) {
  const reduce = useReducedMotion();
  const pct = Math.round(Math.min(Math.max(value, 0), 1) * 100);
  return (
    <div role="img" aria-label={label} className={`h-4 w-full overflow-hidden rounded-full ${onDark ? "bg-white/30" : "bg-sunk"}`}>
      <motion.div className={`h-full rounded-full ${onDark ? "bg-field-yellow" : "bg-ok-bright"}`} initial={reduce ? false : { width: 0 }} animate={{ width: `${pct}%` }} transition={motionOr(reduce, { ...MOVE, delay: STAGGER })} />
    </div>
  );
}

/** A round stop on a path: done (green tick), here (yellow, with a ring that breathes), or to come (white, numbered). */
export function Stop({ state, children }: { state: "done" | "here" | "open"; children: ReactNode }) {
  const reduce = useReducedMotion();
  const look = state === "done" ? "bg-ok-bright text-white border-ok" : state === "here" ? "bg-cta text-ink border-cta-strong" : "bg-surface text-ink border-line-strong";
  return (
    <span className="relative grid size-20 shrink-0 place-items-center">
      {state === "here" && <motion.span aria-hidden className="absolute inset-0 rounded-full bg-cta" animate={reduce ? undefined : { scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }} />}
      <span className={`display relative grid size-20 place-items-center rounded-full border-4 border-b-8 text-heading-2 ${look}`}>{state === "done" ? <CheckIcon size={34} strokeWidth={3.5} /> : children}</span>
    </span>
  );
}
