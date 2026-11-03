import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";

/**
 * Buttons are fully round pills with one flat fill (design system v2).
 * - primary: kite red, the one action on a kids' screen. Its darker bottom edge
 *   sinks when pressed (kid exception 3).
 * - secondary: paper with a quiet control edge.
 * - quiet: text only, for hints and back links.
 * - ink: near-black, the one action in the grown-ups' area.
 * "go", "sun" and "soft" are older names kept so callers read naturally.
 */
type Variant = "primary" | "go" | "sun" | "secondary" | "ghost" | "quiet" | "soft" | "ink";
type Size = "md" | "lg" | "xl";

const PRIMARY = "press bg-brand text-on-brand border-brand-strong hover:bg-[color-mix(in_srgb,var(--color-brand)_86%,black)] disabled:bg-line-strong disabled:border-line-strong";

const variants: Record<Variant, string> = {
  primary: PRIMARY,
  go: PRIMARY,
  sun: PRIMARY,
  secondary: "bg-surface text-ink border border-line-strong hover:bg-raised disabled:text-muted disabled:border-line",
  soft: "bg-surface text-ink border border-line-strong hover:bg-raised disabled:text-muted disabled:border-line",
  ghost: "text-ink-2 hover:bg-sunk disabled:text-muted",
  quiet: "text-ink-2 hover:bg-sunk disabled:text-muted",
  ink: "bg-ink text-white hover:bg-ink-2 disabled:bg-line-strong",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-base gap-2",
  lg: "h-13 px-6 text-[1.0625rem] gap-2.5",
  xl: "h-14 px-7 text-lg gap-3",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `inline-flex items-center justify-center rounded-full font-semibold select-none transition-colors disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${extra}`;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
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
