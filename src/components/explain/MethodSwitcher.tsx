"use client";

import { useRef, type KeyboardEvent } from "react";

export interface MethodTab {
  id: string;
  /** Short, child-friendly name: "In real life". */
  label: string;
  /** One line under the name: "Chairs in a hall". */
  hint: string;
}

/**
 * The three ways to explain an idea (ANIM-001 §1), as tabs. Arrow keys, Home and End move between them; the chosen
 * tab's panel is `${idBase}-panel`.
 */
export function MethodSwitcher({ methods, value, onChange, idBase }: { methods: MethodTab[]; value: string; onChange: (id: string) => void; idBase: string }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(0, methods.findIndex((m) => m.id === value));

  const move = (to: number) => {
    const i = (to + methods.length) % methods.length;
    onChange(methods[i]!.id);
    refs.current[i]?.focus();
  };
  const onKeyDown = (e: KeyboardEvent) => {
    const keys: Record<string, number> = { ArrowRight: index + 1, ArrowDown: index + 1, ArrowLeft: index - 1, ArrowUp: index - 1, Home: 0, End: methods.length - 1 };
    if (e.key in keys) {
      e.preventDefault();
      move(keys[e.key]!);
    }
  };

  return (
    <div role="tablist" aria-label="Ways to see it" onKeyDown={onKeyDown} className="grid grid-cols-3 gap-1.5 rounded-[22px] bg-sunk p-1.5">
      {methods.map((m, i) => {
        const on = m.id === value;
        return (
          <button
            key={m.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${idBase}-tab-${m.id}`}
            aria-selected={on}
            aria-controls={`${idBase}-panel`}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(m.id)}
            className={`flex min-h-14 flex-col items-center justify-center rounded-[16px] px-2 py-2 text-center transition-colors ${on ? "bg-surface text-ink shadow-[var(--shadow-card)] ring-2 ring-brand" : "text-ink-2 hover:bg-raised"}`}
          >
            <span className="text-base font-extrabold leading-tight">{m.label}</span>
            <span className={`hidden text-label leading-tight sm:block ${on ? "text-ink-2" : "text-muted"}`}>{m.hint}</span>
          </button>
        );
      })}
    </div>
  );
}
