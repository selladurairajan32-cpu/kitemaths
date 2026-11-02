import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "soft";
type Size = "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-white hover:bg-ink-2 disabled:bg-line-strong disabled:text-white/90 shadow-[0_1px_0_rgb(255_255_255/0.08)_inset]",
  secondary:
    "bg-surface text-ink border border-line-strong hover:border-ink-2 hover:bg-sunk disabled:text-muted disabled:border-line",
  ghost: "text-ink-2 hover:bg-sunk disabled:text-muted",
  soft: "bg-den-soft text-den-strong hover:bg-[#d3e0f8] disabled:opacity-50",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-4 text-[0.95rem] gap-2 rounded-xl",
  lg: "h-13 px-6 text-base gap-2.5 rounded-2xl",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = "") {
  return `inline-flex items-center justify-center font-medium transition-colors duration-150 select-none disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${extra}`;
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
