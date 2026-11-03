import type { ReactNode } from "react";
import { Pic, type PicName } from "@/components/paper/Pic";
import { Kip, type KipMood } from "./Kip";

/**
 * The top of a kids' screen in the Crystal look: a soft blue panel with Kip or a 3D picture,
 * one big friendly title, a line that says what this is, and the actions. Matches the Home hero.
 */
export function ScreenHero({
  pic,
  kip,
  title,
  line,
  children,
  titleId,
  aside,
}: {
  /** A 3D picture in a white tile. */
  pic?: PicName;
  /** Or Kip himself. */
  kip?: KipMood;
  title: ReactNode;
  line?: ReactNode;
  /** Actions under the line. */
  children?: ReactNode;
  titleId?: string;
  /** Something on the right on wide screens (a figure, a picture). */
  aside?: ReactNode;
}) {
  return (
    <section className="rounded-[32px] bg-[#edf3ff] px-5 py-7 sm:px-10 sm:py-10" aria-labelledby={titleId}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
          {kip ? (
            <Kip mood={kip} size={104} className="shrink-0" />
          ) : pic ? (
            <span className="grid size-24 shrink-0 place-items-center rounded-[28px] bg-surface shadow-[var(--shadow-card)]" aria-hidden>
              <Pic name={pic} size={68} priority />
            </span>
          ) : null}
          <div className="min-w-0">
            <h1 id={titleId} className="display text-[2rem] sm:text-[2.625rem]">
              {title}
            </h1>
            {line && <div className="mt-2 max-w-2xl text-lg text-ink-2">{line}</div>}
            {children && <div className="mt-6 flex flex-wrap items-center gap-3">{children}</div>}
          </div>
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>
    </section>
  );
}
