import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { journeyQuestionId } from "@/components/journey/stages";
import { shellMode } from "@/components/ui/AppShell";
import type { JourneyProgress } from "@/engine/topicJourney";
import type { ItemResult } from "@/engine/types";
import { getLearner, resetLearner, updateLearner } from "@/lib/store";
import { frac } from "@/maths/fraction";
import { topicById } from "@/topics";
import { TopicProvider } from "@/topics/context";
import { exploreCoach, fractionsIn } from "@/topics/fractions-2/canvas/AddDifferentLesson";
import { journeyFor, JOURNEYS } from "@/topics/kit/journeys";
import { canvasLessonFor } from "@/topics/kit/canvasLessons";
import type { KitQuestion } from "@/topics/kit/types";
import { LessonCanvas } from "./LessonCanvas";

/** D-060: the lesson canvas in jsdom, for adding fractions with different denominators (the redesign pilot). */

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {} }), usePathname: () => "/t/fractions-2/learn/add-different" }));

const KEY = "fractions-2/add-different";
const def = journeyFor("fractions-2", "add-different")!;
const at = (p: Partial<JourneyProgress>) => updateLearner((s) => ({ ...s, journeys: { [KEY]: { stage: 0, reached: 0, startedAt: 1000, practised: 0, applied: 0, ...p } } }));
const show = () => render(<TopicProvider topicId="fractions-2"><LessonCanvas concept="add-different" /></TopicProvider>);
const step = (name: RegExp) => within(screen.getByRole("navigation", { name: "Lesson steps" })).getByRole("button", { name }) as HTMLButtonElement;
const saved = () => getLearner().journeys?.[KEY];
const cut = async (user: ReturnType<typeof userEvent.setup>, who: string, times: number) => {
  for (let i = 0; i < times; i++) await user.click(screen.getByRole("button", { name: `Cut ${who} bar into smaller pieces` }));
};

beforeEach(() => resetLearner());

describe("lesson canvas: Discover, Explore, Understand, Practise, Apply, Prove it (D-060)", () => {
  it("is switched on for the pilot concept only, inside the site's normal header and navigation (the Lesson Studio)", () => {
    expect(JOURNEYS.filter((j) => j.canvas).map((j) => `${j.topicId}/${j.concept}`)).toEqual([KEY]);
    expect(canvasLessonFor("fractions-2", "add-different")).toBeTruthy();
    expect(shellMode("/t/fractions-2/learn/add-different", () => false)).toBe("kid");
    expect(shellMode("/t/fractions-2/learn/multiply-fractions", () => false)).toBe("kid");
    expect(shellMode("/t/fractions-2", () => false)).toBe("kid");
  });

  it("starts on Discover with one question and a guess to make; the other steps are locked and nothing is taught yet", async () => {
    show();
    expect(await screen.findByRole("heading", { level: 2, name: "How much chocolate did they eat altogether?" })).toBeTruthy();
    expect(step(/^Discover, this step$/).getAttribute("aria-current")).toBe("step");
    for (const s of [/^Explore, locked$/, /^Understand, locked$/, /^Practise, locked$/, /^Apply, locked$/, /^Prove it, locked$/]) expect(step(s).disabled).toBe(true);
    expect(screen.getByRole("group", { name: "What do you think? Have a guess." })).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Find out why/ })).toBeNull();
    expect(screen.queryByText("Together")).toBeNull();
    // D-066: the Lesson Studio header: the topic's name, a chooser of its lessons (this one picked), and the free lab.
    expect(screen.getByRole("heading", { level: 1, name: "Fractions 2" })).toBeTruthy();
    expect((screen.getByRole("combobox", { name: "Choose a lesson" }) as HTMLSelectElement).value).toBe("/t/fractions-2/learn/add-different");
    expect(screen.getByRole("link", { name: /Free lab/ }).getAttribute("href")).toBe("/t/fractions-2/lab");
  });

  it("tests the common wrong guess against the real amount, saves the guess, and only then leads on", async () => {
    const user = userEvent.setup();
    show();
    const guesses = await screen.findByRole("group", { name: "What do you think? Have a guess." });
    await user.click(within(guesses).getAllByRole("button")[0]!);
    expect(saved()?.guess).toBe("2/7");
    expect(screen.getByRole("img", { name: /Sam's piece and Zara's piece end to end/ })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Your guess: 2 of 7 sevenths shaded" })).toBeTruthy();
    expect(screen.getByText(/is shorter than Sam's piece on its own/)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /Find out why/ }));
    expect(step(/^Explore, this step$/).getAttribute("aria-current")).toBe("step");
    expect(step(/^Discover, done$/).disabled).toBe(false);
  });

  it("lets the child cut the bars: the join is offered only when the pieces match, and then they are counted together", async () => {
    const user = userEvent.setup();
    at({ learn: 1, learnReached: 1 });
    show();
    expect(await screen.findByRole("heading", { level: 2, name: "Make every piece the same size" })).toBeTruthy();
    expect(screen.getByText("Press + to cut a bar into smaller pieces.")).toBeTruthy();
    await cut(user, "Sam's", 1);
    // Sixths and quarters: Zara's pieces are now the bigger ones, and nothing can be joined.
    expect(screen.getByRole("img", { name: "Sam's bar: 2 of 6 sixths shaded" })).toBeTruthy();
    expect(screen.getByText("Zara's pieces are bigger. Cut Zara's bar some more.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Join them/ })).toBeNull();
    await cut(user, "Sam's", 2);
    await cut(user, "Zara's", 2);
    expect(screen.getByText(/Every piece is the same size now: twelfths/)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /Join them/ }));
    expect(screen.getByRole("img", { name: "Together: 7 twelfths" })).toBeTruthy();
    expect(screen.getByText("4 twelfths and 3 twelfths make 7 twelfths.")).toBeTruthy();
    // A second pair, then on to Understand.
    await user.click(screen.getByRole("button", { name: /Try another pair/ }));
    await cut(user, "Ben's", 4);
    await cut(user, "Mia's", 1);
    await user.click(screen.getByRole("button", { name: /Join them/ }));
    expect(screen.getByRole("img", { name: "Together: 9 tenths" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /See why it works/ }));
    expect(saved()).toMatchObject({ stage: 0, learn: 2 });
  });

  it("coaches by what the child has done: where to look first, the exact cuts only after many tries", () => {
    const rows = [{ f: frac(1, 3), who: "Sam's", name: "Sam" }, { f: frac(1, 4), who: "Zara's", name: "Zara" }] as const;
    expect(exploreCoach([...rows], [1, 1], 1)).toBe("Sam's pieces are bigger. Cut Sam's bar some more.");
    expect(exploreCoach([...rows], [3, 2], 3)).toBe("Zara's pieces are bigger. Cut Zara's bar some more.");
    expect(exploreCoach([...rows], [3, 2], 7)).toBe("Try this: cut each of Sam's pieces into 4, and each of Zara's pieces into 3.");
  });

  it("shows the same step as a picture, a story or numbers, keeps the step when the view changes, and checks the idea before going on", async () => {
    const user = userEvent.setup();
    at({ learn: 2, learnReached: 2 });
    show();
    expect(await screen.findByRole("heading", { level: 2, name: "Different sizes can't be counted together" })).toBeTruthy();
    const tabs = screen.getByRole("tablist", { name: "Ways to see it" });
    expect(within(tabs).getAllByRole("tab").map((t) => t.textContent)).toEqual(["Picture", "Story", "Numbers"]);
    await user.click(screen.getByRole("button", { name: /^Next/ }));
    await user.click(within(tabs).getByRole("tab", { name: "Story" }));
    expect(screen.getByRole("heading", { level: 2, name: "Find a piece size that fits both" })).toBeTruthy();
    expect(screen.getByText(/A clock face has 12 five-minute slices/)).toBeTruthy();
    await user.click(within(tabs).getByRole("tab", { name: "Numbers" }));
    expect(screen.getByRole("heading", { level: 2, name: "Find a piece size that fits both" })).toBeTruthy();
    expect(screen.getByText("3 times table")).toBeTruthy();
    // Step 3 asks one question on a new fraction; a wrong answer is explained and Next stays shut.
    await user.click(screen.getByRole("button", { name: /^Next/ }));
    const next = screen.getByRole("button", { name: /^Next/ }) as HTMLButtonElement;
    expect(next.disabled).toBe(true);
    await user.click(screen.getByRole("button", { name: "1" }));
    expect(screen.getByText(/there must be more of them/)).toBeTruthy();
    expect(next.disabled).toBe(true);
    await user.click(screen.getByRole("button", { name: "6" }));
    expect(screen.getByText(/1 half is 6 twelfths/)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /^Next/ }));
    await user.click(screen.getByRole("button", { name: /Start practising/ }));
    expect(saved()).toMatchObject({ stage: 1, reached: 1 });
    expect(step(/^Practise, this step$/).getAttribute("aria-current")).toBe("step");
  });

  it("practises with the island's own questions and marking, with the bars open at the first level, and records each answer", async () => {
    const user = userEvent.setup();
    at({ stage: 1, reached: 1 });
    show();
    expect(await screen.findByText("Question 1 of 7")).toBeTruthy();
    expect(screen.getByText(/With help/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Hide the bars" }).getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("group", { name: "Cut the first bar" })).toBeTruthy();
    const q = topicById("fractions-2")!.questionById(journeyQuestionId(def, def.practise, 0, 1000, 0)) as KitQuestion;
    if (q.kind !== "number") throw new Error("expected a number question first");
    await user.type(screen.getByRole("textbox"), String(q.answer));
    await user.click(screen.getByRole("button", { name: /^Check/ }));
    await user.click(await screen.findByRole("button", { name: /Next question/ }));
    expect(saved()?.practised).toBe(1);
    expect(screen.getByText("Question 2 of 7")).toBeTruthy();
    expect(getLearner().results.some((r) => r.questionId === q.id && r.context === "practice" && r.correct && r.skill === def.skill)).toBe(true);
  });

  it("offers the bars closed once the child works alone, and finds the two fractions of a question for them", async () => {
    at({ stage: 1, reached: 1, practised: 5 });
    show();
    expect(await screen.findByText("Question 6 of 7")).toBeTruthy();
    expect(screen.getByText(/Harder ones/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Work it out with bars" }).getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("group", { name: "Cut the first bar" })).toBeNull();
    expect(fractionsIn("Work out **{3/4} + {2/5}**.")).toEqual([frac(3, 4), frac(2, 5)]);
    // Nothing to model: one fraction, the same denominators, or an improper fraction.
    expect(fractionsIn("How many twelfths is {1/3}?")).toBeNull();
    expect(fractionsIn("{1/4} + {3/4}")).toBeNull();
    expect(fractionsIn("{7/4} + {2/5}")).toBeNull();
  });

  it("proves it with the unchanged check: new questions, no hints", async () => {
    const user = userEvent.setup();
    at({ stage: 3, reached: 3 });
    show();
    expect(await screen.findByRole("heading", { level: 2, name: "Show what you know" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /Start the check/ }));
    const learner = getLearner().topics["fractions-2"]!;
    expect(learner.recheck?.skill).toBe(def.skill);
    expect(learner.recheck?.order.length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: /Hint/ })).toBeNull();
  });

  it("sums up what the answers show in plain words, with the first guess to look back on, and keeps the island's mastery level", async () => {
    const r = (key: string, correct: boolean, t: number): ItemResult => ({ questionId: `g:fractions-2.${key}:2:${t}`, skill: def.skill, context: "practice", correct, firstTry: correct, attempts: 1, hintsUsed: 0, misconceptions: [], at: t });
    updateLearner((s) => ({ ...s, results: [r("f2-add-diff", true, 2000), r("f2-diff-apply", true, 2001), r("f2-diff-why", false, 2002)] }));
    at({ stage: 4, reached: 4, guess: "2/7" });
    show();
    expect(await screen.findByRole("heading", { level: 1 })).toBeTruthy();
    expect(screen.getByText(/At the start you guessed/)).toBeTruthy();
    const evidence = screen.getByRole("heading", { name: "What your answers show" }).closest("section")!;
    expect(within(evidence).getByText("You can make the pieces match and add them.")).toBeTruthy();
    expect(within(evidence).getByText("You can spot it inside a problem and use it.")).toBeTruthy();
    expect(within(evidence).getByText("Saying why it works needs another look.")).toBeTruthy();
    // Three answers are not enough to be secure (MAST-001 unchanged), and the canvas says so.
    expect(within(evidence).getByText("Developing")).toBeTruthy();
    for (const s of [/^Discover, done$/, /^Prove it, done$/]) expect(step(s).disabled).toBe(false);
  });

  it("carries on a journey saved by the older layout in the same place", async () => {
    at({ stage: 2, reached: 2, practised: 7, applied: 1 });
    show();
    expect(await screen.findByText("Question 2 of 3")).toBeTruthy();
    expect(step(/^Apply, this step$/).getAttribute("aria-current")).toBe("step");
    expect(step(/^Understand, done$/).disabled).toBe(false);
    expect(step(/^Prove it, locked$/).disabled).toBe(true);
  });
});
