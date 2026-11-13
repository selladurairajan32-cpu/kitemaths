import { useId, type ReactNode } from "react";

/**
 * D-058: a full-width band, the reference site's way of making every section unmistakable. Each band has its own
 * background (pale squared paper, sky, mint, peach, or a strong pink), a wavy edge where it meets the page, and the same
 * opening: a small label, a big centred title and one line, then its content and at most one centred action.
 */
export type BandTone = "white" | "grid" | "sky" | "mint" | "peach" | "rose" | "pink" | "sunk";

const TONE: Record<BandTone, { bg: string; fill: string; dark?: boolean }> = {
  white: { bg: "bg-paper", fill: "var(--color-paper)" },
  grid: { bg: "bg-tile-blue paper-grid", fill: "var(--color-tile-blue)" },
  sky: { bg: "bg-tile-sky paper-grid", fill: "var(--color-tile-sky)" },
  mint: { bg: "bg-tile-green", fill: "var(--color-tile-green)" },
  peach: { bg: "bg-tile-orange", fill: "var(--color-tile-orange)" },
  rose: { bg: "bg-tile-pink", fill: "var(--color-tile-pink)" },
  sunk: { bg: "bg-sunk", fill: "var(--color-sunk)" },
  pink: { bg: "bg-field-pink text-white", fill: "var(--color-field-pink)", dark: true },
};

function Wave({ fill, flip = false }: { fill: string; flip?: boolean }) {
  const id = useId();
  return (
    <svg className={`pointer-events-none absolute inset-x-0 h-4 w-full ${flip ? "top-full rotate-180" : "bottom-full"}`} aria-hidden preserveAspectRatio="none">
      <defs>
        <pattern id={id} width="56" height="16" patternUnits="userSpaceOnUse">
          <path d="M0 16 V9 C 9 1 19 1 28 9 S 47 17 56 9 V16 Z" fill={fill} />
        </pattern>
      </defs>
      <rect width="100%" height="16" fill={`url(#${id})`} />
    </svg>
  );
}

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
  const t = TONE[tone];
  return (
    <section aria-labelledby={id} className={`band relative py-12 sm:py-16 ${t.bg}`}>
      {tone !== "white" && <Wave fill={t.fill} />}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl space-y-2 text-center">
          {eyebrow && (
            <p className={`inline-flex rounded-full px-3.5 py-1 text-label font-extrabold uppercase tracking-wide ${t.dark ? "bg-surface text-field-pink" : "bg-tip-soft text-tip-ink"}`}>{eyebrow}</p>
          )}
          <h2 id={id} className={`display text-heading-1 sm:text-display-2 ${t.dark ? "text-white" : ""}`}>
            {title}
          </h2>
          {line && <p className={`text-body-lg ${t.dark ? "text-white" : "text-ink-2"}`}>{line}</p>}
        </div>
        <div className={`mt-8 sm:mt-10 ${t.dark ? "text-ink" : ""}`}>{children}</div>
        {action && <div className="mt-8 flex justify-center sm:mt-10">{action}</div>}
      </div>
      {tone !== "white" && <Wave fill={t.fill} flip />}
    </section>
  );
}
