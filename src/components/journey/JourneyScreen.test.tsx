import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { JourneyProgress } from "@/engine/topicJourney";
import type { ItemResult } from "@/engine/types";
import { getLearner, resetLearner, updateLearner } from "@/lib/store";
import { topicById } from "@/topics";
import { TopicProvider } from "@/topics/context";
import { journeyFor } from "@/topics/kit/journeys";
import type { KitQuestion } from "@/topics/kit/types";
import { JourneyScreen } from "./JourneyScreen";
import { journeyQuestionId } from "./stages";

/** D-043: the topic journey in jsdom: one stage at a time, unlocking in order, saved and resumed. */

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {} }), usePathname: () => "/t/fractions-2/learn/add-different" }));

const KEY = "fractions-2/add-different";
const def = journeyFor("fractions-2", "add-different")!;
const at = (p: Partial<JourneyProgress>) => updateLearner((s) => ({ ...s, journeys: { [KEY]: { stage: 0, reached: 0, startedAt: 1000, practised: 0, applied: 0, ...p } } }));
const show = () => render(<TopicProvider topicId="fractions-2"><JourneyScreen concept="add-different" /></TopicProvider>);
const stageButton = (name: RegExp) => within(screen.getByRole("list", { name: "Your learning journey" })).getByRole("button", { name });

beforeEach(() => {
  resetLearner();
  history.replaceState(null, "", "/t/fractions-2/learn/add-different");
});

describe("topic journey: Learn, Practise, Apply, Check, Complete (D-043)", () => {
  it("starts on Learn with the journey bar, the breadcrumb and the year; later stages are locked", async () => {
    show();
    expect(await screen.findByRole("heading", { level: 1, name: def.title })).toBeTruthy();
    expect(screen.getByText("Year 6")).toBeTruthy();
    expect(within(screen.getByRole("navigation", { name: "Breadcrumb" })).getByRole("link", { name: "Fractions 2" })).toBeTruthy();
    expect(stageButton(/^1\. Learn$/).getAttribute("aria-current")).toBe("step");
    for (const s of [/^2\. Practise, locked/, /^3\. Apply, locked/, /^4\. Check, locked/, /^5\. Complete, locked/]) expect((stageButton(s) as HTMLButtonElement).disabled).toBe(true);
    expect(await screen.findByRole("heading", { name: "Choose how you want to learn" })).toBeTruthy();
    expect(getLearner().journeys?.[KEY]?.stage).toBe(0);
  });

  it("goes on to Practise when the child is ready, and Learn stays open to revisit", async () => {
    const user = userEvent.setup();
    show();
    await user.click(await screen.findByRole("button", { name: /I'm ready: Practise/ }));
    expect(stageButton(/^2\. Practise$/).getAttribute("aria-current")).toBe("step");
    expect(screen.getByRole("list", { name: "Practice levels" })).toBeTruthy();
    expect((stageButton(/^1\. Learn, done/) as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByRole("button", { name: /Next: Apply/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("practises one question at a time at the Guided level, with Method and Why to hand, and counts each answer", async () => {
    const user = userEvent.setup();
    at({ stage: 1, reached: 1 });
    show();
    const levels = await screen.findByRole("list", { name: "Practice levels" });
    expect(within(levels).getByText("Guided").getAttribute("aria-current")).toBe("step");
    expect(screen.getByText("Question 1 of 7")).toBeTruthy();
    expect(screen.getByText("Concept")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Method" }));
    expect(screen.getByText(def.method[0]!)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Why?" }));
    expect(screen.getByText(def.why)).toBeTruthy();
    // Answer the first question (a number) correctly; the oracle is the island's own generated answer.
    const q = topicById("fractions-2")!.questionById(journeyQuestionId(def, def.practise, 0, 1000, 0)) as KitQuestion;
    if (q.kind !== "number") throw new Error("expected a number question first");
    const section = screen.getByRole("region", { name: "Question 1" });
    await user.type(within(section).getByRole("textbox"), String(q.answer));
    await user.click(within(section).getByRole("button", { name: /^Check/ }));
    await user.click(await within(section).findByRole("button", { name: /Next question/ }));
    expect(getLearner().journeys?.[KEY]?.practised).toBe(1);
    expect(screen.getByText("Question 2 of 7")).toBeTruthy();
    expect(getLearner().results.some((r) => r.questionId === q.id && r.context === "practice" && r.correct)).toBe(true);
  });

  it("opens the Notes at any stage and closes them with Escape", async () => {
    const user = userEvent.setup();
    at({ stage: 2, reached: 2 });
    show();
    await user.click(await screen.findByRole("button", { name: "Notes" }));
    const dialog = screen.getByRole("dialog", { name: "Notes" });
    expect(await within(dialog).findByText("Common denominator")).toBeTruthy();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("starts the understanding check: new questions, no hints, results at the end", async () => {
    const user = userEvent.setup();
    at({ stage: 3, reached: 3 });
    show();
    expect(await screen.findByText("Show what you know!")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /Start the check/ }));
    const learner = getLearner().topics["fractions-2"]!;
    expect(learner.recheck?.skill).toBe(def.skill);
    expect(learner.recheck?.order.length).toBeGreaterThan(0);
    expect(screen.getByText(new RegExp(`Check: ${def.title}`))).toBeTruthy();
  });

  it("completes with the island's mastery level and this topic's strands, and comes back to the same stage", async () => {
    const r = (key: string, correct: boolean, t: number): ItemResult => ({ questionId: `g:fractions-2.${key}:2:${t}`, skill: def.skill, context: "practice", correct, firstTry: correct, attempts: 1, hintsUsed: 0, misconceptions: [], at: t });
    updateLearner((s) => ({ ...s, results: [r("f2-add-diff", true, 2000), r("f2-diff-apply", true, 2001), r("f2-diff-why", false, 2002)] }));
    at({ stage: 4, reached: 4 });
    const { unmount } = show();
    expect(await screen.findByRole("heading", { name: "Topic complete!" })).toBeTruthy();
    const strands = screen.getByRole("heading", { name: "How well you understand it" }).closest("section")!;
    expect(within(strands).getByText("Concept")).toBeTruthy();
    expect(within(strands).getByText("Reasoning")).toBeTruthy();
    expect(within(strands).getAllByText("1 of 1").length).toBe(2);
    expect(within(strands).getByText("0 of 1")).toBeTruthy();
    // Not yet secure after three answers (MAST-001 unchanged): the level says so.
    expect(screen.getByText("Developing")).toBeTruthy();
    unmount();
    show();
    expect(await screen.findByRole("heading", { name: "Topic complete!" })).toBeTruthy();
    await act(async () => {});
  });
});
