import { Fragment, type ReactNode } from "react";
import { FractionNotation } from "./FractionNotation";

const TOKEN = /(\*\*[^*]+\*\*|\{\d+\/\d+\})/g;

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(TOKEN).map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (!part) return null;
    const frac = /^\{(\d+)\/(\d+)\}$/.exec(part);
    if (frac) return <FractionNotation key={key} n={Number(frac[1])} d={Number(frac[2])} size="inline" />;
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={key} className="font-semibold text-ink">
          {renderInline(part.slice(2, -2), key)}
        </strong>
      );
    }
    return <Fragment key={key}>{part}</Fragment>;
  });
}

/** Renders text with **bold** and {n/d} fraction markup. */
export function RichText({ text, className }: { text: string; className?: string }) {
  return <span className={className}>{renderInline(text, "rt")}</span>;
}
