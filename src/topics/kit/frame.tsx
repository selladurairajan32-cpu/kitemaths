import type { ReactNode } from "react";

/** Shared colours and the figure wrapper for the kit's pictures. */
export const INK = "#1b2559";
export const BRAND = "#2563eb";
export const CORAL = "#f4623a";
export const GREEN = "#22a565";
export const TONE = { brand: BRAND, num: CORAL, ok: GREEN } as const;
/** Pastel fills that sit behind ink outlines. */
export const FILL = { brand: "#dbe6ff", num: "#ffe1d6", ok: "#d6f3e3", sun: "#fff1c2", pink: "#ffe0ef", plain: "#ffffff" } as const;

export function Frame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <figure className="m-0 flex w-full flex-col items-center" role="img" aria-label={label}>
      {children}
    </figure>
  );
}
