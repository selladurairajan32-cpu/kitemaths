import type { ReactNode } from "react";

/** D-057: the small pill label above a section title ("YOUR TOPICS"), as on the reference site. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="inline-flex rounded-full bg-tip-soft px-3.5 py-1 text-label font-extrabold uppercase tracking-wide text-tip-ink">{children}</p>;
}

/** A section heading: the eyebrow, then the title in the display face, then a line. */
export function SectionHead({ eyebrow, title, line, id, center = false }: { eyebrow?: ReactNode; title: ReactNode; line?: ReactNode; id?: string; center?: boolean }) {
  return (
    <div className={`space-y-2 ${center ? "text-center" : ""}`}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 id={id} className="display text-heading-1">
        {title}
      </h2>
      {line && <p className={`max-w-2xl text-body text-ink-2 ${center ? "mx-auto" : ""}`}>{line}</p>}
    </div>
  );
}
