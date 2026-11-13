import { useId } from "react";

/** D-057: a row of half-circles that rounds off the bottom of a banner into the white page below. */
export function Scallop({ className = "" }: { className?: string }) {
  const id = useId();
  return (
    <svg className={`pointer-events-none absolute inset-x-0 bottom-0 h-4 w-full ${className}`} aria-hidden preserveAspectRatio="none">
      <defs>
        <pattern id={id} width="32" height="16" patternUnits="userSpaceOnUse">
          <circle cx="16" cy="16" r="16" fill="var(--color-paper)" />
        </pattern>
      </defs>
      <rect width="100%" height="16" fill={`url(#${id})`} />
    </svg>
  );
}
