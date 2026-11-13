import type { ReactNode } from "react";
import { Pic, type PicName } from "@/components/paper/Pic";
import type { Field } from "./fields";
import { Kip, type KipMood } from "./Kip";
import { Eyebrow } from "./Eyebrow";
import { Scallop } from "./Scallop";

/**
 * The top of a kids' screen: a colour field (D-052) or a white panel, with a 3D picture, Kip or the guide, one big friendly
 * title, a line that says what this is, and the actions. Matches the Home hero.
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
  // D-057: a pale banner on squared paper, rounded off at the bottom, with the picture large on the right.
  const tint = field?.soft ?? "bg-tile-blue";
  const picture = guide ? (
    <Pic name="guide-wave" size={150} priority />
  ) : kip ? (
    <Kip mood={kip} size={130} />
  ) : pic ? (
    <span className="grid size-36 place-items-center rounded-full bg-surface" aria-hidden>
      <Pic name={pic} size={96} priority />
    </span>
  ) : null;
  return (
    <section className={`paper-grid relative overflow-hidden rounded-[32px] px-6 pb-10 pt-8 sm:px-10 sm:pb-12 sm:pt-10 ${tint}`} aria-labelledby={titleId}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1 id={titleId} className={`display text-heading-1 sm:text-display-2 ${eyebrow ? "mt-3" : ""}`}>
            {title}
          </h1>
          {line && <div className="mt-3 max-w-2xl text-body-lg text-ink-2">{line}</div>}
          {children && <div className="mt-6 flex flex-wrap items-center gap-3">{children}</div>}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : picture && <div className="hidden shrink-0 sm:block" aria-hidden>{picture}</div>}
      </div>
      <Scallop />
    </section>
  );
}
