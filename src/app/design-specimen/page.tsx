import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { FractionNotation } from "@/components/math/FractionNotation";
import { RichText } from "@/components/math/RichText";
import { BulbIcon, CheckIcon, CloseIcon, FlagIcon, KiteIcon, RefreshIcon, SearchIcon, StarIcon, StudioIcon } from "@/components/ui/Icons";

/**
 * Internal design specimen for UX-002, UX-003 and UX-004 (R0 step 2, D-012, D-013).
 * It shows the proposed tokens so the Product Owner and educational QA can review them. No child
 * screen uses these tokens yet: that is R1. Not linked from the app, not indexed, and not
 * served in production builds.
 */
export const metadata: Metadata = {
  title: "Design specimen · Kite Maths (internal)",
  robots: { index: false, follow: false },
};

const SAMPLE = "Which is bigger, {3/5} or {2/3}?";

const TYPE_SCALE: { token: string; className: string; size: string; role: string }[] = [
  { token: "display-1", className: "text-display-1 font-extrabold", size: "48px / 1.1", role: "Home hero (desktop)" },
  { token: "display-2", className: "text-display-2 font-extrabold", size: "42px / 1.15", role: "Screen hero (desktop)" },
  { token: "heading-1", className: "text-heading-1 font-extrabold", size: "34px / 1.2", role: "Screen title; hero on phone" },
  { token: "heading-2", className: "text-heading-2 font-extrabold", size: "26px / 1.25", role: "Section title" },
  { token: "prompt", className: "text-prompt font-extrabold", size: "28px / 1.35", role: "Question prompt (desktop)" },
  { token: "prompt-sm", className: "text-prompt-sm font-extrabold", size: "24px / 1.35", role: "Question prompt (phone)" },
  { token: "title", className: "text-title font-extrabold", size: "20px / 1.35", role: "Card and panel titles" },
  { token: "body-lg", className: "text-body-lg font-medium", size: "19px / 1.6", role: "Lesson explanations" },
  { token: "body", className: "text-body font-medium", size: "18px / 1.6", role: "Reading text (default)" },
  { token: "label", className: "text-label font-semibold", size: "15px / 1.4", role: "Labels and meta (minimum)" },
];

const CORE = ["paper", "surface", "sunk", "ink", "ink-2", "muted", "line", "line-strong", "brand", "brand-soft", "num-strong", "den"];
const STATES = ["focus", "selected", "selected-soft", "disabled-ink", "disabled-soft", "correct", "correct-edge", "correct-soft", "incorrect", "incorrect-edge", "incorrect-soft"];

function Swatch({ name }: { name: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="size-10 shrink-0 rounded-control border border-line" style={{ background: `var(--color-${name})` }} />
      <code className="min-w-0 text-label text-ink-2">{name}</code>
    </li>
  );
}

function InfoIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}

function Section({ id, item, title, children, note }: { id: string; item: string; title: string; children: ReactNode; note?: string }) {
  return (
    <section aria-labelledby={id} className="card p-5 sm:p-8">
      <p className="text-label font-bold text-muted">{item}</p>
      <h2 id={id} className="text-heading-2 font-extrabold text-ink">
        {title}
      </h2>
      {note && <p className="mt-1 max-w-reading text-label text-muted">{note}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

/** The ten content types (UX-004). Class strings are literal so Tailwind generates them. */
const CONTENT: { type: string; use: string; render: ReactNode }[] = [
  {
    type: "teach",
    use: "Explanation text. Plain reading text on the card: no panel, no icon.",
    render: (
      <p className="max-w-reading text-body-lg text-teach-ink">
        <RichText text="The **denominator** tells you how many equal parts the whole is split into. In {3/5}, the whole has 5 parts." />
      </p>
    ),
  },
  {
    type: "rule",
    use: "A key fact or definition to remember. Thick left edge, flag icon, “Key fact” label.",
    render: (
      <div className="max-w-reading rounded-panel border-l-[6px] border-rule-edge bg-rule-soft px-5 py-4 text-rule-ink">
        <p className="flex items-center gap-2 text-label font-extrabold uppercase tracking-wide">
          <FlagIcon /> Key fact
        </p>
        <p className="mt-1 text-body font-semibold">
          <RichText tint text="When two fractions have the same numerator (not zero) and the wholes are the same size, the fraction with the **smaller denominator** is bigger: {1/3} > {1/5}." />
        </p>
      </div>
    ),
  },
  {
    type: "example",
    use: "A worked example the teacher models. “Worked example” tab label, numbered steps, edge border.",
    render: (
      <div className="max-w-reading overflow-hidden rounded-panel border-2 border-example-edge bg-example-soft">
        <p className="flex items-center gap-2 bg-example-strong px-4 py-1.5 text-label font-extrabold text-on-strong">
          <StudioIcon /> Worked example
        </p>
        <ol className="space-y-2 px-5 py-4 text-body text-example-ink">
          <li>
            <span className="font-extrabold">1.</span> <RichText tint text="Find {3/4} of 12." />
          </li>
          <li>
            <span className="font-extrabold">2.</span> 12 ÷ 4 = 3, so one quarter is 3.
          </li>
          <li>
            <span className="font-extrabold">3.</span> 3 × 3 = 9, so <RichText tint text="{3/4} of 12 is **9**." />
          </li>
        </ol>
      </div>
    ),
  },
  {
    type: "hint",
    use: "Optional help the child asks for. Bulb icon, “Hint” label, soft panel with no border.",
    render: (
      <div className="flex max-w-reading gap-3 rounded-panel bg-hint-soft px-5 py-4 text-hint-ink">
        <BulbIcon className="mt-0.5 shrink-0" />
        <p className="text-body">
          <span className="font-extrabold">Hint: </span>Fifths or thirds: which pieces are bigger?
        </p>
      </div>
    ),
  },
  {
    type: "tip",
    use: "Kip’s friendly tip inside a lesson. Kite icon and speech-bubble shape.",
    render: (
      <div className="relative max-w-reading rounded-panel rounded-bl-none border border-tip-edge bg-tip-soft px-5 py-4 text-tip-ink">
        <p className="flex items-center gap-2 text-label font-extrabold">
          <KiteIcon /> Kip’s tip
        </p>
        <p className="mt-1 text-body">Draw the two bars the same length before you shade them.</p>
      </div>
    ),
  },
  {
    type: "notice",
    use: "A message about the answer’s form (for example, nothing typed). Info icon, small bar, thin border.",
    render: (
      <p className="flex max-w-reading items-center gap-2 rounded-control border border-notice-edge bg-notice-soft px-4 py-2.5 text-label font-semibold text-notice-ink">
        <InfoIcon /> Type a whole number, like 9.
      </p>
    ),
  },
  {
    type: "misconception",
    use: "Names a likely misunderstanding, kindly. Magnifier icon, “Look closer” label, dashed border.",
    render: (
      <div className="max-w-reading rounded-panel border-2 border-dashed border-misconception-edge bg-misconception-soft px-5 py-4 text-misconception-ink">
        <p className="flex items-center gap-2 text-label font-extrabold">
          <SearchIcon /> Look closer
        </p>
        <p className="mt-1 text-body">
          <RichText tint text="You might be thinking a bigger denominator means a bigger fraction. When the same-sized whole is split into more equal parts, each part is **smaller**: {1/8} < {1/3}." />
        </p>
      </div>
    ),
  },
  {
    type: "success",
    use: "Feedback for a correct answer. Round tick badge, “Correct!” headline.",
    render: (
      <div className="flex max-w-reading items-start gap-4 rounded-panel border-2 border-success-edge bg-success-soft px-5 py-4 text-success-ink">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-success-edge text-on-strong">
          <CheckIcon strokeWidth={3} />
        </span>
        <div className="min-w-0">
          <p className="text-title font-extrabold">Correct!</p>
          <p className="text-body">
            <RichText tint text="{1/5} is less than {1/3}: with the same-sized whole, fifths are smaller pieces than thirds." />
          </p>
        </div>
      </div>
    ),
  },
  {
    type: "retry",
    use: "Feedback for an answer that isn’t right yet. Round try-again badge, “Not yet” headline. Never red.",
    render: (
      <div className="flex max-w-reading items-start gap-4 rounded-panel border-2 border-retry-edge bg-retry-soft px-5 py-4 text-retry-ink">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-retry-edge text-on-strong">
          <RefreshIcon strokeWidth={2.4} />
        </span>
        <div className="min-w-0">
          <p className="text-title font-extrabold">Not yet: have another go</p>
          <p className="text-body">Look at the size of each piece, not how many there are.</p>
        </div>
      </div>
    ),
  },
  {
    type: "challenge",
    use: "A stretch question, clearly optional. Star icon, “Optional challenge” ribbon, double border.",
    render: (
      <div className="relative max-w-reading rounded-panel border-4 border-double border-challenge-edge bg-challenge-soft px-5 pb-4 pt-7 text-challenge-ink">
        <p className="absolute -top-3 left-4 flex items-center gap-1.5 rounded-full bg-challenge-strong px-3 py-0.5 text-label font-extrabold text-on-strong">
          <StarIcon size={16} /> Optional challenge
        </p>
        <p className="text-body">
          <RichText tint text="Find a fraction between {1/3} and {1/2}. How do you know it’s between them?" />
        </p>
      </div>
    ),
  },
];

function Tile({ label, className, badge }: { label: string; className: string; badge?: ReactNode }) {
  return (
    <div className={`relative grid min-h-24 place-items-center rounded-tile border-2 px-3 py-3 text-center ${className}`}>
      {badge}
      <span className="text-heading-2 font-bold">&gt;</span>
      <span className="text-label">{label}</span>
    </div>
  );
}

export default function DesignSpecimenPage() {
  // Built with VERCEL_ENV=production (the live site), this page is a 404.
  if (process.env.VERCEL_ENV === "production") notFound();

  return (
    <main className="mx-auto max-w-page space-y-8 px-4 py-8 [overflow-wrap:anywhere] sm:px-6 sm:py-12">
      <header className="max-w-reading">
        <p className="text-label font-bold uppercase tracking-wide text-muted">Internal · not for children · R0 step 2</p>
        <h1 className="mt-2 text-heading-1 font-extrabold text-ink sm:text-display-2">Design specimen</h1>
        <p className="mt-3 text-body text-ink-2">
          The proposed tokens from UX-002 (design tokens), UX-003 (typography) and UX-004 (content types). Nothing on a
          child’s screen uses them yet: screens move to them in R1. Specs are in <code>docs/product/design/</code>.
        </p>
      </header>

      <Section id="type" item="UX-003" title="Type scale" note="One font, Nunito. Each token sets size and line height together.">
        <ul className="divide-y divide-line">
          {TYPE_SCALE.map((t) => (
            <li key={t.token} className="grid gap-2 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6">
              <div>
                <code className="text-label font-bold text-ink">text-{t.token}</code>
                <p className="text-label text-muted">
                  {t.size} · {t.role}
                </p>
              </div>
              <p className={`${t.className} min-w-0 text-ink`}>
                {/* UX-003 §6: label-size text uses the compact one-line fraction form. */}
                <RichText compact={t.token === "label"} text={SAMPLE} />
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="content" item="UX-004" title="Content types" note="Each type has its own icon, label and shape as well as colour, so none is told apart by colour alone.">
        <ul className="space-y-8">
          {CONTENT.map((c) => (
            <li key={c.type} className="grid gap-3 sm:grid-cols-[12rem_1fr] sm:gap-6">
              <div>
                <code className="text-label font-bold text-ink">{c.type}</code>
                <p className="text-label text-muted">{c.use}</p>
              </div>
              <div className="min-w-0">{c.render}</div>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="states" item="UX-002" title="Interaction and validation states" note="Answer tiles and buttons. The focus ring is shown drawn on; in the app it appears with keyboard focus.">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] gap-3">
          <Tile label="Default" className="border-line-strong bg-surface text-ink" />
          <Tile label="Focus" className="border-line-strong bg-surface text-ink outline-3 outline-offset-3 outline-focus" />
          <Tile label="Selected" className="border-selected bg-selected-soft text-selected" />
          <Tile
            label="Correct"
            className="border-correct-edge bg-correct-soft text-correct"
            badge={
              <span className="absolute -right-2 -top-2 grid size-7 place-items-center rounded-full bg-correct text-on-strong">
                <CheckIcon size={15} strokeWidth={3} />
              </span>
            }
          />
          <Tile
            label="Incorrect"
            className="border-incorrect-edge bg-incorrect-soft text-incorrect"
            badge={
              <span className="absolute -right-2 -top-2 grid size-7 place-items-center rounded-full bg-incorrect text-on-strong">
                <CloseIcon size={15} strokeWidth={3} />
              </span>
            }
          />
          <Tile label="Disabled" className="cursor-not-allowed border-disabled-soft bg-disabled-soft text-disabled-ink" />
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <span className="max-w-full rounded-full bg-brand px-6 py-3 text-title font-extrabold text-on-brand">Check</span>
          <span className="max-w-full rounded-full bg-brand px-6 py-3 text-title font-extrabold text-on-brand outline-3 outline-offset-3 outline-focus">
            Check (focus)
          </span>
          <span className="max-w-full rounded-full bg-disabled-soft px-6 py-3 text-title font-extrabold text-disabled-ink">Check (disabled)</span>
        </div>
      </Section>

      <Section id="maths" item="UX-003" title="Maths notation" note="Stacked, coloured fractions everywhere except one-line option labels. True minus and times signs. Numbers line up.">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <p className="text-label font-bold text-muted">Fraction sizes: sm · md · lg · xl</p>
            <div className="flex flex-wrap items-end gap-6">
              <FractionNotation n={3} d={5} size="sm" />
              <FractionNotation n={3} d={5} size="md" />
              <FractionNotation n={3} d={5} size="lg" />
              <FractionNotation n={3} d={5} size="xl" />
            </div>
            <p className="max-w-reading text-body-lg text-ink-2">
              <RichText text="Inline in reading text: {3/4} of 12 is 9, and {2/8} is the same as {1/4}." />
            </p>
            <p className="text-label text-ink-2">
              Compact, for one-line option labels: <RichText compact text="{3/8} and {5/8}" />
            </p>
          </div>
          <div className="space-y-4 text-body text-ink">
            <p className="text-label font-bold text-muted">Operators, powers and long calculations</p>
            {/* Each expression stays on one line; lines break only between expressions. */}
            <ul className="flex flex-wrap gap-x-8 gap-y-2">
              <li className="whitespace-nowrap">7 − 3 = 4</li>
              <li className="whitespace-nowrap">6 × 4 = 24</li>
              <li className="whitespace-nowrap">24 ÷ 6 = 4</li>
              <li className="whitespace-nowrap">
                10<sup className="text-label">2</sup> = 100
              </li>
            </ul>
            {/* Column method: digits right-aligned in place-value columns, the operator in its own column. */}
            <div className="inline-grid grid-cols-[auto_auto] rounded-control bg-sunk px-5 py-3 text-right tabular-nums">
              <span />
              <span>3,465</span>
              <span className="pr-3 text-left">+</span>
              <span>278</span>
              <span className="border-t-2 border-ink" />
              <span className="border-t-2 border-ink font-extrabold">3,743</span>
            </div>
            {/*
              Long calculation: one step per line, each starting with "=" so the signs line up. A step too wide
              for the screen wraps before an operator (hanging indent); a non-breaking space keeps each operator
              with its number.
            */}
            <div className="space-y-1 tabular-nums">
              <p>
                <RichText text="{3/4} of 120" />
              </p>
              <p className="pl-12 -indent-6">=&nbsp;120 ÷&nbsp;4 ×&nbsp;3</p>
              <p className="pl-12 -indent-6">=&nbsp;30 ×&nbsp;3</p>
              <p className="pl-12 -indent-6 font-extrabold">=&nbsp;90</p>
            </div>
          </div>
        </div>
      </Section>

      <Section id="shape" item="UX-002" title="Radii, elevation and widths">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["control", "rounded-control", "16px"],
            ["tile", "rounded-tile", "18px"],
            ["panel", "rounded-panel", "20px"],
            ["card", "rounded-[var(--radius-card)]", "24px (existing)"],
            ["hero", "rounded-hero", "32px"],
          ].map(([name, cls, px]) => (
            <div key={name} className={`grid h-24 place-items-center border-2 border-line-strong bg-raised ${cls}`}>
              <span className="text-label text-ink-2">
                <code>{name}</code> · {px}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="grid h-24 place-items-center rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)]">
            <code className="text-label text-ink-2">shadow-card</code>
          </div>
          <div className="grid h-24 place-items-center rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-lift)]">
            <code className="text-label text-ink-2">shadow-lift</code>
          </div>
          <div className="grid h-24 place-items-center rounded-t-hero bg-surface shadow-sheet">
            <code className="text-label text-ink-2">shadow-sheet</code>
          </div>
        </div>
        <div className="mt-8 space-y-2">
          <div className="max-w-reading rounded-control bg-den-soft px-3 py-1.5 text-label text-ink">max-w-reading · 640px</div>
          <div className="max-w-lesson rounded-control bg-den-soft px-3 py-1.5 text-label text-ink">max-w-lesson · 720px</div>
          <div className="max-w-page rounded-control bg-den-soft px-3 py-1.5 text-label text-ink">max-w-page · 1152px</div>
        </div>
      </Section>

      <Section id="colour" item="UX-002" title="Colour" note="Core colours are unchanged. State colours are new.">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <p className="mb-3 text-label font-bold text-muted">Core (existing)</p>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">{CORE.map((n) => <Swatch key={n} name={n} />)}</ul>
          </div>
          <div>
            <p className="mb-3 text-label font-bold text-muted">States (new)</p>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">{STATES.map((n) => <Swatch key={n} name={n} />)}</ul>
          </div>
        </div>
      </Section>
    </main>
  );
}
