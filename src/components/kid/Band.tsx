import type { ReactNode } from "react";

/**
 * A section of a kids' page (D-058). D-066: drawn as the first prototype's card: a small label, a title in Fraunces and
 * one line, then its content and at most one action.
 */
export type BandTone = "white" | "grid" | "sky" | "mint" | "peach" | "rose" | "pink" | "sunk";

export function Band({
  tone,
  id,
  eyebrow,
  title,
  line,
  action,
  children,
}: {
  tone: BandTone;
  /** The title's id, for the section's label. */
  id: string;
  eyebrow?: ReactNode;
  title: ReactNode;
  line?: ReactNode;
  /** One centred action under the content. */
  action?: ReactNode;
  children: ReactNode;
}) {
  // D-066: in the first prototype's look a section is a white card with a plain heading; `tone` no longer colours it.
  void tone;
  return (
    <section aria-labelledby={id} className="card p-5 sm:p-7">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 id={id} className="display text-heading-2">
            {title}
          </h2>
          {line && <p className="mt-1 text-body text-ink-2">{line}</p>}
        </div>
      </div>
      {children}
      {action && <div className="mt-6 flex">{action}</div>}
    </section>
  );
}
