import { Fragment, type ReactNode } from "react";
import { FractionNotation } from "./FractionNotation";

const TOKEN = /(\*\*[^*]+\*\*|\{\d+\/\d+\})/g;

function renderInline(text: string, keyPrefix: string, compact: boolean, tint = false): ReactNode[] {
  return text.split(TOKEN).map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (!part) return null;
    const frac = /^\{(\d+)\/(\d+)\}$/.exec(part);
    if (frac && compact) {
      // One line high, for lists and labels: 1/4 with the same numerator and denominator colours.
      return (
        <span key={key} className="whitespace-nowrap font-semibold">
          <span className="text-num-strong">{frac[1]}</span>/<span className="text-den-strong">{frac[2]}</span>
        </span>
      );
    }
    if (frac) return <FractionNotation key={key} n={Number(frac[1])} d={Number(frac[2])} size="inline" tint={tint} />;
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={key} className="font-extrabold text-ink">
          {renderInline(part.slice(2, -2), key, compact, tint)}
        </strong>
      );
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
}

/**
 * Renders text with **bold** and {n/d} fraction markup. `compact` keeps fractions on one line (for lists).
 * `tint` is for text on a tinted content panel: fractions use the darker denominator blue (UX-004, DEF-022).
 */
export function RichText({ text, className, compact = false, tint = false }: { text: string; className?: string; compact?: boolean; tint?: boolean }) {
  return <span className={className}>{renderInline(text, "rt", compact, tint)}</span>;
}
