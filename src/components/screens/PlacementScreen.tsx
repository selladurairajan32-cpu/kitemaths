"use client";

import { AnimatePresence, motion } from "motion/react";
import { PaperIcon } from "@/components/paper/PaperIcon";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Confetti } from "@/components/kid/Celebrate";
import { Kip, KipSays } from "@/components/kid/Kip";
import { ReadAloud } from "@/components/kid/ReadAloud";
import { RichText } from "@/components/math/RichText";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { ScreenSkeleton } from "@/components/ui/Screen";
import { answerPlacement, finishPlacement, inTopic, setProfile, skipPlacement, startPlacement, type LearnerState, type TopicLearner } from "@/engine/progress";
import { recommendNext } from "@/engine/journey";
import { topicRoutes } from "@/lib/routes";
import { playSound } from "@/lib/sound";
import { updateLearner, useHydrated, useLearner } from "@/lib/store";
import { useTopic, useTopicState } from "@/topics/context";
import type { AnswerResponse as Response, PlacementKit } from "@/topics/types";

const YEARS = [3, 4, 5, 6];

function answersSoFar(s: TopicLearner): boolean[] {
  const { order, correct } = s.placement;
  return order.slice(0, s.placement.index).map((id) => correct.includes(id));
}

function Intro() {
  const learner = useLearner();
  const topic = useTopic();
  const placement = topic.placement!;
  const links = topicRoutes(topic.id);
  const router = useRouter();
  const [name, setName] = useState(learner.profile.name);
  const [year, setYear] = useState<number | null>(learner.profile.year);

  const saveProfile = (s: LearnerState) => setProfile(s, { name: name.trim().slice(0, 24), year });

  const play = (e: FormEvent) => {
    e.preventDefault();
    playSound("tap");
    updateLearner((s) => inTopic(saveProfile(s), topic.id, (t) => startPlacement(t, placement.order(Date.now()))));
  };

  return (
    <motion.form onSubmit={play} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-xl space-y-6">
      <div className="flex flex-col items-center text-center">
        <Kip mood="cheer" size={120} />
        <h1 className="display mt-2 text-4xl leading-tight">Hi! I&apos;m Kip.</h1>
        <p className="mt-2 text-lg text-ink-2">I&apos;ll be your guide on a fractions adventure. Let&apos;s get to know each other!</p>
      </div>

      <section className="card space-y-5 p-5 sm:p-7">
        <label className="block">
          <span className="display text-xl">What&apos;s your name?</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={24}
            autoComplete="given-name"
            placeholder="Your first name"
            className="mt-2 h-14 w-full rounded-2xl border-2 border-line-strong bg-surface px-4 text-lg font-medium focus:border-brand focus:outline-none"
          />
          <span className="mt-1 block text-sm text-muted">Just your first name — it stays on this device.</span>
        </label>

        <fieldset>
          <legend className="display text-xl">Which school year are you in?</legend>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {YEARS.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setYear(y)}
                aria-pressed={year === y}
                className={`press h-14 rounded-2xl border-2 text-lg font-bold ${
                  year === y ? "border-brand bg-brand text-white shadow-[0_4px_0_var(--color-brand-strong)]" : "border-line-strong bg-surface shadow-[0_3px_0_var(--color-line-strong)]"
                }`}
              >
                Y{y}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setYear(null)}
              aria-pressed={year === null}
              className={`press h-14 rounded-2xl border-2 text-sm font-bold ${
                year === null ? "border-brand bg-brand text-white shadow-[0_4px_0_var(--color-brand-strong)]" : "border-line-strong bg-surface shadow-[0_3px_0_var(--color-line-strong)]"
              }`}
            >
              Not sure
            </button>
          </div>
        </fieldset>
      </section>

      <KipSays mood="happy" tone="sky" speak="Let's play a quick warm-up game. Up to 8 questions, so I know where your adventure should start. It's not a test. Just try your best!">
        Let&apos;s play a quick <strong>warm-up game</strong> — up to 8 questions — so I know where your adventure should start. It&apos;s not a test!
      </KipSays>

      <div className="flex flex-col gap-3 sm:flex-row-reverse sm:justify-start">
        <Button type="submit" variant="go" size="xl">
          Play the warm-up <ArrowRightIcon size={20} />
        </Button>
        <Button
          variant="secondary"
          size="xl"
          onClick={() => {
            updateLearner((s) => inTopic(saveProfile(s), topic.id, skipPlacement));
            router.push(links.lesson(topic.lessons[0].id));
          }}
        >
          Start from the beginning
        </Button>
      </div>
    </motion.form>
  );
}

function PlacementQuestion({ id, index }: { id: string; index: number }) {
  const { topic, update } = useTopicState();
  const { Input: QuestionInput, evaluate, inputProblem, isComplete: isResponseComplete } = topic.questions;
  const placement: PlacementKit = topic.placement!;
  const q = topic.questionById(id);
  const [response, setResponse] = useState<Response | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<boolean | null>(null);
  const [episode] = useState(() => `placement:${id}:${index}`);
  const complete = isResponseComplete(q, response);

  const check = (e: FormEvent) => {
    e.preventDefault();
    if (outcome !== null || !response || !complete) return;
    const issue = inputProblem(q, response);
    if (issue) return setProblem(issue);
    const ev = evaluate(q, response);
    setOutcome(ev.correct);
    playSound(ev.correct ? "correct" : "tap");
  };

  const next = () => {
    const ok = outcome === true;
    update((s) => {
      let n = answerPlacement(s, {
        id: episode,
        questionId: id,
        skill: q.skill,
        context: "placement",
        difficulty: q.difficulty,
        correct: ok,
        firstTry: ok,
        attempts: 1,
        hintsUsed: 0,
        misconceptions: ok ? [] : evaluate(q, response!).misconceptions,
        at: Date.now(),
      });
      const answers = answersSoFar(n);
      if (n.placement.index >= n.placement.order.length || placement.shouldStop(answers)) {
        n = finishPlacement(n, placement.placedOut(answers), Date.now());
      }
      return n;
    });
  };

  return (
    <form onSubmit={check} className="space-y-6">
      <div className="flex items-start gap-3">
        <h2 className="min-w-0 flex-1 text-xl font-semibold leading-relaxed sm:text-2xl">
          <RichText text={q.prompt} />
        </h2>
        <ReadAloud text={q.prompt} size="lg" />
      </div>
      <QuestionInput
        question={q}
        response={response}
        onChange={(r) => {
          setResponse(r);
          setProblem(null);
        }}
        locked={outcome !== null}
        orderKey={episode}
      />
      {problem && <p className="rounded-2xl bg-warn-soft px-4 py-3 text-sm text-ink-2">{problem}</p>}
      <AnimatePresence mode="wait">
        {outcome !== null && (
          <motion.div key="fb" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <KipSays mood={outcome ? "cheer" : "happy"} tone={outcome ? "sky" : "sun"} size={60}>
              {outcome ? "Nice one — you know this already!" : "No worries! We'll learn this one together."}
            </KipSays>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="sticky bottom-0 -mx-5 flex justify-end border-t-2 border-line bg-surface/95 px-5 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
        {outcome === null ? (
          <Button type="submit" variant="go" size="xl" disabled={!complete} className="w-full sm:w-auto">
            Check
          </Button>
        ) : (
          <Button size="xl" onClick={next} className="w-full sm:w-auto" autoFocus>
            Next <ArrowRightIcon size={20} />
          </Button>
        )}
      </div>
    </form>
  );
}

function Done() {
  const { topic, learner, links } = useTopicState();
  const profile = useLearner().profile;
  const LESSONS = topic.lessons;
  const { placedOut } = learner.placement;
  const rec = recommendNext(topic, learner);
  const first = rec.kind === "lesson" ? LESSONS.find((l) => l.id === rec.lessonId) : null;
  const name = profile.name.trim();
  return (
    <motion.section initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="card relative mx-auto max-w-xl overflow-visible p-6 text-center sm:p-10">
      <Confetti burstKey="placement-done" />
      <div className="flex justify-center">
        <Kip mood="cheer" size={110} />
      </div>
      <h1 className="display mt-2 text-3xl sm:text-4xl" tabIndex={-1} ref={(el) => el?.focus()}>
        Warm-up done{name ? `, ${name}` : ""}!
      </h1>
      <p className="mt-2 text-lg text-ink-2">
        {placedOut.length
          ? `You already know ${placedOut.length} of the ${topic.placement?.plan.length ?? LESSONS.length} topics — so we'll skip ahead.`
          : "We'll start right at the beginning and build up step by step. Every expert starts here!"}
      </p>
      {placedOut.length > 0 && (
        <ul className="mt-5 flex flex-wrap justify-center gap-2">
          {placedOut.map((id) => {
            const l = LESSONS.find((x) => x.id === id)!;
            return (
              <li key={id} className="inline-flex items-center gap-1.5 rounded-full bg-ok-soft px-3 py-1 text-sm font-semibold text-ok">
                <PaperIcon name={topic.lessonLook(id).icon} size={24} /> {l.title}
              </li>
            );
          })}
        </ul>
      )}
      {first && (
        <div className="mt-6 rounded-3xl bg-brand-soft p-4">
          <p className="text-sm font-bold uppercase tracking-wide text-brand-strong">Your first adventure</p>
          <p className="display mt-1 text-2xl">
            <PaperIcon name={topic.lessonLook(first.id).icon} size={32} className="inline-block align-middle" /> {first.title}
          </p>
        </div>
      )}
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <ButtonLink href={first ? links.lesson(first.id) : links.practice()} variant="go" size="xl">
          Let&apos;s go! <ArrowRightIcon size={20} />
        </ButtonLink>
        <ButtonLink href={links.island()} variant="secondary" size="xl">
          See my map
        </ButtonLink>
      </div>
    </motion.section>
  );
}

export function PlacementScreen() {
  const hydrated = useHydrated();
  const { learner } = useTopicState();
  if (!hydrated) return <ScreenSkeleton />;
  const p = learner.placement;

  if (p.status === "complete") return <Done />;
  if (p.status !== "in-progress") return <Intro />;

  const index = Math.min(p.index, p.order.length - 1);
  const answers = answersSoFar(learner);
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <Kip size={44} mood="think" />
        <div className="min-w-0 flex-1">
          <p className="display text-lg leading-tight">Warm-up game</p>
          <ol className="mt-1.5 flex gap-1.5" aria-label={`Question ${index + 1} of ${p.order.length}`}>
            {p.order.map((id, i) => (
              <li
                key={id}
                className={`h-2.5 flex-1 rounded-full ${i < answers.length ? (answers[i] ? "bg-ok-bright" : "bg-sun") : i === index ? "bg-brand" : "bg-line"}`}
              />
            ))}
          </ol>
        </div>
      </div>
      <section className="card p-5 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div key={p.order[index]} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <PlacementQuestion id={p.order[index]} index={index} />
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}
