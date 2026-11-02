"use client";

import { useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { Button } from "./Button";
import { LockIcon } from "./Icons";
import { useHydrated, useNow } from "@/lib/store";

/**
 * A light "grown-ups only" check so children land in their own space, not in
 * the detailed reports. It is a speed bump, not security.
 */
const KEY = "kite-maths:parent-ok";
let unlocked = false;
const listeners = new Set<() => void>();

function isUnlocked() {
  if (unlocked) return true;
  try {
    unlocked = window.sessionStorage.getItem(KEY) === "1";
  } catch {
    /* storage blocked: ask each time */
  }
  return unlocked;
}

function unlock() {
  unlocked = true;
  try {
    window.sessionStorage.setItem(KEY, "1");
  } catch {
    /* fine */
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function ParentGate({ children }: { children: ReactNode }) {
  const hydrated = useHydrated();
  const ok = useSyncExternalStore(subscribe, isUnlocked, () => false);
  const now = useNow();
  const a = 6 + (Math.floor(now / 1000) % 4);
  const b = 6 + (Math.floor(now / 7000) % 4);
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);

  if (!hydrated) return null;
  if (ok) return <>{children}</>;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (Number(value) === a * b) unlock();
    else {
      setWrong(true);
      setValue("");
    }
  };

  return (
    <section className="card mx-auto mt-6 max-w-md p-6 text-center sm:p-8" aria-labelledby="gate-title">
      <span className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-sunk text-ink-2">
        <LockIcon size={26} />
      </span>
      <h1 id="gate-title" className="display text-2xl">
        Grown-ups only
      </h1>
      <p className="mt-2 text-ink-2">This area has detailed progress reports and settings. To continue, please answer:</p>
      <form onSubmit={submit} className="mt-5 flex flex-col items-center gap-3">
        <label className="flex items-center gap-3 text-xl font-semibold">
          <span>
            {a} × {b} =
          </span>
          <input
            inputMode="numeric"
            autoComplete="off"
            value={value}
            onChange={(e) => {
              setValue(e.target.value.replace(/\D/g, ""));
              setWrong(false);
            }}
            className="h-12 w-24 rounded-xl border-2 border-line-strong bg-surface text-center text-xl"
            aria-label={`${a} times ${b}`}
            autoFocus
          />
        </label>
        {wrong && (
          <p role="alert" className="text-sm text-num-strong">
            That&apos;s not it — try again.
          </p>
        )}
        <Button type="submit" size="lg" disabled={!value}>
          Continue
        </Button>
      </form>
    </section>
  );
}
