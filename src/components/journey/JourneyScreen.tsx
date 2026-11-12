"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { ArrowRightIcon, CloseIcon, HomeIcon } from "@/components/ui/Icons";
import { Pic } from "@/components/paper/Pic";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { countApplied, countPractised, finishStage, JOURNEY_STAGES, openStage, startJourney, type JourneyProgress } from "@/engine/topicJourney";
import { setSettings } from "@/engine/progress";
import { routes } from "@/lib/routes";
import { updateLearner, useHydrated, useLearner } from "@/lib/store";
import { useTopicState } from "@/topics/context";
import { ConceptLearn, ConceptNotes } from "@/topics/kit/explanations";
import { journeyFor } from "@/topics/kit/journeys";
import { JourneyBar, LearnStrip } from "./JourneyChrome";
import { CheckStage, checkDone, CompleteStage, QuestionStage } from "./stages";

/**
 * D-043: the topic journey, one stage on screen at a time: ① Learn ② Practise ③ Apply ④ Check ⑤ Complete. A journey
 * bar shows where the child is (stages unlock in order and can be revisited); one button leads on; Notes open in a
 * panel at any stage. Progress is saved per concept, so the child can come back to the same place. D-046: in the
 * sky-and-glass look, with a journey bar of 3D pictures, a Reduced motion switch, and a strip under Learn.
 */


function NotesPanel({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/40" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="notes-title" className="flex h-full w-full max-w-md flex-col gap-4 overflow-y-auto bg-paper p-5 shadow-[var(--shadow-lift)]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3">
          <h2 id="notes-title" className="text-heading-2 font-extrabold text-ink">Notes</h2>
          <button ref={close} type="button" onClick={onClose} className="grid size-12 place-items-center rounded-full bg-surface text-ink shadow-[var(--shadow-card)] hover:bg-sunk" aria-label="Close notes">
            <CloseIcon size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function JourneyScreen({ concept }: { concept: string }) {
  const hydrated = useHydrated();
  const { topic, learner: topicLearner, links } = useTopicState();
  const learner = useLearner();
  const def = journeyFor(topic.id, concept);
  const key = `${topic.id}/${concept}`;
  const saved = learner.journeys?.[key];
  const [notes, setNotes] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (hydrated && def && !saved) updateLearner((s) => (s.journeys?.[key] ? s : { ...s, journeys: { ...s.journeys, [key]: startJourney(Date.now()) } }));
  }, [hydrated, def, saved, key]);

  if (!def) return null;
  if (!hydrated || !saved) return <ScreenSkeleton />;
  const p: JourneyProgress = saved;
  const set = (fn: (p: JourneyProgress) => JourneyProgress, focus = false) => {
    updateLearner((s) => ({ ...s, journeys: { ...s.journeys, [key]: fn(s.journeys?.[key] ?? startJourney(Date.now())) } }));
    if (focus) requestAnimationFrame(() => { heading.current?.focus({ preventScroll: true }); heading.current?.scrollIntoView?.({ behavior: "smooth", block: "start" }); });
  };
  const stage = JOURNEY_STAGES[p.stage]!;
  const ready = stage === "learn" || (stage === "practise" && p.practised >= def.practise.length) || (stage === "apply" && p.applied >= def.apply.length) || (stage === "check" && checkDone(def, p, topicLearner.rechecks));
  const nextLabel = { learn: "I'm ready: Practise", practise: "Next: Apply", apply: "Next: Check understanding", check: "See how you did", complete: "" }[stage];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-label font-bold text-ink-2">
        <Link href={routes.dashboard()} className="inline-flex min-h-11 items-center gap-1 hover:text-ink" aria-label="Home"><HomeIcon size={18} /></Link>
        <span aria-hidden>›</span>
        <Link href={routes.topics()} className="inline-flex min-h-11 items-center hover:text-ink">Topics</Link>
        <span aria-hidden>›</span>
        <Link href={links.island()} className="inline-flex min-h-11 items-center hover:text-ink">{topic.title}</Link>
        <span aria-hidden>›</span>
        <span className="text-ink" aria-current="page">{def.title}</span>
      </nav>
      <header className="flex flex-wrap items-center gap-3">
        <h1 ref={heading} tabIndex={-1} className="display min-w-0 text-heading-2 outline-none sm:text-heading-1">{def.title}</h1>
        <span className="rounded-full bg-brand px-3 py-1 text-label font-extrabold text-on-brand">Year {def.year}</span>
        <span className="flex-1" />
        <button
          type="button"
          aria-pressed={!!learner.settings.reducedMotion}
          onClick={() => updateLearner((s) => setSettings(s, { reducedMotion: !s.settings.reducedMotion }))}
          className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-label font-bold shadow-[var(--shadow-card)] ${learner.settings.reducedMotion ? "bg-ink text-white" : "bg-surface text-ink hover:bg-brand-soft"}`}
        >
          <Pic name="waving" size={22} /> Reduced motion
        </button>
        <button type="button" onClick={() => setNotes(true)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface px-4 text-label font-bold text-ink shadow-[var(--shadow-card)] hover:bg-brand-soft">
          <Pic name="memo" size={22} /> Notes
        </button>
      </header>

      <JourneyBar p={p} onOpen={(i) => set((x) => openStage(x, i), true)} />

      <section aria-labelledby="stage-title">
        <h2 id="stage-title" className={stage === "practise" || stage === "apply" || stage === "check" ? "mb-3 text-title font-extrabold text-ink" : "sr-only"}>
          {{ learn: "Learn it", practise: "Practise: build your understanding", apply: "Apply: use it in real life", check: "Mastery check: show what you understand", complete: "Complete" }[stage]}
        </h2>
        {stage === "learn" && <ConceptLearn topicId={topic.id} concept={concept} />}
        {stage === "practise" && <QuestionStage def={def} list={def.practise} done={p.practised} startedAt={p.startedAt} kind="practise" onAnswered={() => set(countPractised)} />}
        {stage === "apply" && <QuestionStage def={def} list={def.apply} done={p.applied} startedAt={p.startedAt} kind="apply" onAnswered={() => set(countApplied)} />}
        {stage === "check" && <CheckStage def={def} progress={p} />}
        {stage === "complete" && <CompleteStage def={def} progress={p} onReview={() => set((x) => openStage(x, 0), true)} onPractise={() => set((x) => ({ ...openStage(x, 1), practised: 0 }), true)} />}
      </section>

      {/* One way on. Under Learn, the strip ends with "Practise this"; question stages show the button once the child
          can move on (they have their own sticky Check bar). */}
      {stage === "learn" && <LearnStrip def={def} onNotes={() => setNotes(true)} onPractise={() => set(finishStage, true)} />}
      {stage !== "complete" && stage !== "learn" && ready && (
        <div className="flex justify-end">
          <Button variant="cta" size="xl" onClick={() => set(finishStage, true)} className="shadow-[var(--shadow-lift)]">
            {nextLabel} <ArrowRightIcon size={20} />
          </Button>
        </div>
      )}

      {notes && (
        <NotesPanel onClose={() => setNotes(false)}>
          <ConceptNotes topicId={topic.id} concept={concept} />
        </NotesPanel>
      )}
    </div>
  );
}
