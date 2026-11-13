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

const PRIMARY = "press shadow-[0_0_0_4px_rgb(37_99_235/0.16)] bg-brand text-on-brand border-brand-strong hover:bg-[color-mix(in_srgb,var(--color-brand)_86%,black)] disabled:bg-line-strong disabled:border-line-strong";

const variants: Record<Variant, string> = {
  primary: PRIMARY,
  go: PRIMARY,
  sun: PRIMARY,
  // D-046: the yellow "go on" button of the concept images (Practise this, Start learning, Check answer). Ink on it.
  cta: "press shadow-[0_0_0_4px_rgb(255_200_61/0.35)] bg-cta text-ink border-cta-strong font-extrabold hover:bg-[color-mix(in_srgb,var(--color-cta)_88%,black)] disabled:bg-line-strong disabled:border-line-strong disabled:text-ink-2",
  secondary: "bg-surface text-brand-strong border-2 border-card-edge hover:bg-raised disabled:text-muted disabled:border-line",
  soft: "bg-surface text-ink border-[1.5px] border-line-strong hover:bg-raised disabled:text-muted disabled:border-line",
  ghost: "text-ink-2 hover:bg-sunk disabled:text-muted",
  quiet: "text-ink-2 hover:bg-sunk disabled:text-muted",
  ink: "bg-ink text-white hover:bg-ink-2 disabled:bg-line-strong",
};

const sizes: Record<Size, string> = {
  md: "min-h-12 py-1.5 px-5 text-[1.0625rem] gap-2 text-center",
  lg: "min-h-14 py-2 px-7 text-lg gap-2.5 text-center",
  xl: "min-h-[3.75rem] py-2 px-8 text-[1.1875rem] gap-3 text-center",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `inline-flex items-center justify-center rounded-full font-bold select-none transition-colors disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${extra}`;
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
