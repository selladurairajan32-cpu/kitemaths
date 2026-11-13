import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode, Ref } from "react";

/**
 * Buttons are fully round pills with one flat fill (design system v3, "Crystal").
 * - primary: friendly blue, the one action on a screen. Its darker bottom edge
 *   sinks when pressed.
 * - secondary: paper with a quiet control edge.
 * - quiet: text only, for hints and back links.
 * - ink: near-black, the one action in the grown-ups' area.
 * - cta: yellow with ink text, the "go on" action in the topic journey (D-046).
 * "go", "sun" and "soft" are older names kept so callers read naturally.
 */
type Variant = "primary" | "go" | "sun" | "cta" | "secondary" | "ghost" | "quiet" | "soft" | "ink";
type Size = "md" | "lg" | "xl";

// D-066: the first prototype's buttons. One ink button for the main action; a white outlined one beside it.
const PRIMARY = "bg-ink text-white hover:bg-ink-2 disabled:bg-line-strong disabled:text-white";

const variants: Record<Variant, string> = {
  primary: PRIMARY,
  go: PRIMARY,
  sun: PRIMARY,
  cta: PRIMARY,
  secondary: "bg-surface text-ink border border-line-strong hover:border-ink-2 hover:bg-sunk disabled:text-muted disabled:border-line",
  soft: "bg-den-soft text-den-strong hover:bg-sunk disabled:opacity-50",
  ghost: "text-ink-2 hover:bg-sunk disabled:text-muted",
  quiet: "text-ink-2 hover:bg-sunk disabled:text-muted",
  ink: PRIMARY,
};

const sizes: Record<Size, string> = {
  md: "min-h-11 py-1.5 px-4 text-body gap-2 rounded-xl text-center",
  lg: "min-h-13 py-2 px-6 text-body gap-2.5 rounded-2xl text-center",
  xl: "min-h-14 py-2 px-7 text-body-lg gap-2.5 rounded-2xl text-center",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `inline-flex items-center justify-center font-medium select-none transition-colors duration-150 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${extra}`;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; ref?: Ref<HTMLButtonElement> }) {
  return <button type="button" className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size; children: ReactNode }) {
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
