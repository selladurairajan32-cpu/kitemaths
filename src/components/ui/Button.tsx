import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";

type Variant = "primary" | "go" | "secondary" | "ghost" | "soft" | "sun";
type Size = "md" | "lg" | "xl";

/** Chunky game-style buttons: a coloured bottom edge that sinks when pressed. */
const variants: Record<Variant, string> = {
  primary:
    "press bg-brand text-white shadow-[0_4px_0_var(--color-brand-strong)] [--press-edge:var(--color-brand-strong)] disabled:bg-line-strong disabled:text-white/90",
  go: "press bg-ok-bright text-white shadow-[0_4px_0_#139656] [--press-edge:#139656] disabled:bg-line-strong disabled:text-white/90",
  sun: "press bg-sun text-ink shadow-[0_4px_0_var(--color-sun-strong)] [--press-edge:var(--color-sun-strong)] disabled:opacity-50",
  secondary:
    "press bg-surface text-ink border-2 border-line-strong shadow-[0_3px_0_var(--color-line-strong)] [--press-edge:var(--color-line-strong)] hover:bg-sunk disabled:text-muted disabled:border-line",
  ghost: "text-ink-2 hover:bg-sunk disabled:text-muted transition-colors",
  soft: "bg-brand-soft text-brand-strong hover:bg-[#e0d8ff] disabled:opacity-50 transition-colors",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-4 text-[0.95rem] gap-2 rounded-2xl",
  lg: "h-13 px-6 text-base gap-2.5 rounded-2xl",
  xl: "h-15 px-8 text-lg gap-3 rounded-[1.25rem]",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `inline-flex items-center justify-center font-semibold select-none disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${extra}`;
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
