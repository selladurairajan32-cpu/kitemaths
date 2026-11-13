import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/Icons";

/**
 * D-062: the plain page language of the lesson canvas, for the pages that lead to a lesson (Home, Topics, a topic's
 * sub-topics). One narrow column on white: a small label, one big line, one thing to do next, then quiet rows divided
 * by hairlines. No cards, bands or picture tiles.
 */

export const Column = ({ children }: { children: ReactNode }) => <div className="mx-auto flex max-w-3xl flex-col gap-10 pb-6 sm:gap-12 sm:pt-4">{children}</div>;

export function PageTitle({ id, eyebrow, title, line, children }: { id: string; eyebrow?: ReactNode; title: ReactNode; line?: ReactNode; children?: ReactNode }) {
  return (
    <header className="flex flex-col gap-2">
      {eyebrow && <p className="text-label font-extrabold uppercase tracking-widest text-muted">{eyebrow}</p>}
      <h1 id={id} className="display text-heading-1 text-ink sm:text-display-2">
        {title}
      </h1>
      {line && <p className="max-w-reading text-body-lg text-ink-2">{line}</p>}
      {children}
    </header>
  );
}

/** The one thing to do next: a label, what it is, one line about it, and the only yellow button on the page. */
export function NextStep({ id, label, title, line, children, action }: { id: string; label: string; title: ReactNode; line?: ReactNode; children?: ReactNode; action: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4 rounded-[var(--radius-hero)] border-2 border-ink p-5 sm:p-8">
      <p className="text-label font-extrabold uppercase tracking-widest text-muted">{label}</p>
      <h2 id={id} className="display text-heading-2 text-ink sm:text-heading-1">
        {title}
      </h2>
      {line && <p className="max-w-reading text-body-lg text-ink-2">{line}</p>}
      {children}
      <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-2">{action}</div>
    </section>
  );
}

/** A thin trail of steps: done, here, still to come. The words are in `label`. */
export function Steps({ count, done, label }: { count: number; done: number; label: string }) {
  return (
    <div role="img" aria-label={label} className="flex max-w-md gap-1.5">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={`h-2 flex-1 rounded-full ${i < done ? "bg-ok-bright" : i === done ? "bg-ink" : "bg-sunk"}`} />
      ))}
    </div>
  );
}

export function Section({ id, title, line, action, children }: { id: string; title: ReactNode; line?: ReactNode; action?: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1 pb-3">
        <div>
          <h2 id={id} className="display text-heading-2 text-ink">
            {title}
          </h2>
          {line && <p className="text-body text-ink-2">{line}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export type Mark = { kind: "number"; n: number } | { kind: "done" } | { kind: "here"; n?: number } | { kind: "pic"; node: ReactNode };

function MarkDot({ mark }: { mark: Mark }) {
  const base = "grid size-11 shrink-0 place-items-center rounded-full text-body font-extrabold";
  if (mark.kind === "done") return <span className={`${base} bg-ok-soft text-ok`}><CheckIcon size={18} strokeWidth={3} /></span>;
  if (mark.kind === "here") return <span className={`${base} bg-ink text-white`}>{mark.n ?? <ArrowRightIcon size={18} />}</span>;
  if (mark.kind === "pic") return <span className={`${base} bg-sunk`}>{mark.node}</span>;
  return <span className={`${base} bg-sunk text-ink-2`}>{mark.n}</span>;
}

/** One row of a list: a mark, a title, a line about it, and something small on the right. The whole row is the link. */
export function Row({ href, mark, title, line, trail, label, current = false, below }: { href: string; mark: Mark; title: ReactNode; line?: ReactNode; trail?: ReactNode; label?: string; current?: boolean; below?: ReactNode }) {
  return (
    <li className="border-t border-line last:border-b" aria-current={current ? "step" : undefined}>
      <Link href={href} aria-label={label} className="group -mx-3 flex min-h-[4.5rem] items-center gap-4 rounded-[var(--radius-control)] px-3 py-3 hover:bg-raised">
        <MarkDot mark={mark} />
        <span className="min-w-0 flex-1">
          <span className={`block text-title leading-snug text-ink ${current ? "font-extrabold" : "font-bold"}`}>{title}</span>
          {line && <span className="block text-body text-ink-2">{line}</span>}
        </span>
        {trail && <span className="hidden shrink-0 text-right sm:block text-label font-bold text-ink-2">{trail}</span>}
        <ArrowRightIcon size={18} className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
      </Link>
      {below && <div className="pb-3 pl-[3.75rem]">{below}</div>}
    </li>
  );
}

export const Rows = ({ children, label, ordered = false }: { children: ReactNode; label?: string; ordered?: boolean }) =>
  ordered ? <ol aria-label={label} className="m-0 list-none p-0">{children}</ol> : <ul aria-label={label} className="m-0 list-none p-0">{children}</ul>;
