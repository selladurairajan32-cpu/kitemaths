"use client";

import { useState, type ReactNode } from "react";
import { topicLearner } from "@/engine/progress";
import { useHydrated, useLearner } from "@/lib/store";
import { TopicProvider } from "./context";
import { TOPICS } from "./index";
import { activeTopic } from "./recommend";

const CHOICE_KEY = "kite-maths:grown-ups-island";

function readChoice(): string | null {
  try {
    return window.sessionStorage.getItem(CHOICE_KEY);
  } catch {
    return null;
  }
}

/**
 * Provides the learner's active island to app-wide pages (home, grown-ups, report). With `choosable`, grown-ups can
 * switch to any island the child has worked on (DEF-012); the choice lasts for the browser session only.
 */
export function ActiveTopicProvider({ children, choosable = false }: { children: ReactNode; choosable?: boolean }) {
  const learner = useLearner();
  const active = activeTopic(learner).id;
  const hydrated = useHydrated();
  const [picked, setChoice] = useState<string | null>(null);
  // Read the remembered choice only after hydration, so the server and first client render agree.
  const choice = picked ?? (choosable && hydrated ? readChoice() : null);
  if (!choosable) return <TopicProvider topicId={active}>{children}</TopicProvider>;

  const worked = TOPICS.filter((t) => {
    const tl = topicLearner(learner, t.id);
    const skills = new Set(t.skills.map((s) => s.id));
    return t.id === active || Object.keys(tl.lessons).length > 0 || learner.results.some((r) => skills.has(r.skill));
  });
  const shown = worked.some((t) => t.id === choice) ? choice! : active;
  const choose = (id: string) => {
    setChoice(id);
    try {
      window.sessionStorage.setItem(CHOICE_KEY, id);
    } catch {
      // Private browsing: the choice just isn't remembered.
    }
  };

  return (
    <TopicProvider topicId={shown}>
      <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2">
        {worked.length > 1 ? (
          <>
            <label htmlFor="island-picker" className="text-label font-semibold text-ink-2">
              Island shown
            </label>
            <select
              id="island-picker"
              value={shown}
              onChange={(e) => choose(e.target.value)}
              className="h-11 min-w-0 max-w-full rounded-[12px] border border-line-strong bg-surface px-3 text-label font-semibold text-ink"
            >
              {worked.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                  {t.id === active ? " (current)" : ""}
                </option>
              ))}
            </select>
          </>
        ) : (
          <p className="text-label text-ink-2">
            Showing <strong>{worked[0]?.title}</strong>, the only island worked on so far.
          </p>
        )}
      </div>
      {children}
    </TopicProvider>
  );
}
