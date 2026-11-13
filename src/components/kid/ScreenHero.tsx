import type { ReactNode } from "react";
import type { PicName } from "@/components/paper/Pic";
import type { Field } from "./fields";
import type { KipMood } from "./Kip";

/**
 * The top of a kids' screen: a small label, the title, a line that says what this is, and the actions (D-066: the first
 * prototype's page header).
 */
export function ScreenHero({
  pic,
  kip,
  guide,
  field,
  title,
  line,
  children,
  titleId,
  aside,
  eyebrow,
}: {
  /** A 3D picture in a white tile. */
  pic?: PicName;
  /** Or Kip himself. */
  kip?: KipMood;
  /** Or the guide (the 3D child), waving. */
  guide?: boolean;
  /** D-052: the screen's colour field (a solid colour with its readable text). Without it, a white panel. */
  field?: Field;
  title: ReactNode;
  line?: ReactNode;
  /** Actions under the line. */
  children?: ReactNode;
  titleId?: string;
  /** Something on the right on wide screens (a figure, a picture). */
  aside?: ReactNode;
  /** D-057: a small label above the title. */
  eyebrow?: ReactNode;
}) {
  // D-066: the first prototype's page header: a small label, the title in Fraunces and one line, straight on the paper.
  // The pictures and colour fields of earlier looks are no longer drawn; the props stay so callers need not change.
  void field;
  void guide;
  void kip;
  void pic;
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between" aria-labelledby={titleId}>
      <div className="min-w-0 flex-1">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 id={titleId} className="display text-heading-1 sm:text-display-2">
          {title}
        </h1>
        {line && <div className="mt-2 max-w-2xl text-body text-ink-2">{line}</div>}
        {children && <div className="mt-4 flex flex-wrap items-center gap-3">{children}</div>}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </header>
  );
}
