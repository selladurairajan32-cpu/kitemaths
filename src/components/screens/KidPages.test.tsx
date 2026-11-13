import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppShell, isActive } from "@/components/ui/AppShell";
import { masterySummary, topicOverview } from "@/engine/overview";
import { topicLearner } from "@/engine/progress";
import type { ItemResult } from "@/engine/types";
import { getLearner, resetLearner, updateLearner } from "@/lib/store";
import { TOPICS, topicById } from "@/topics";
import { journeyFor, JOURNEYS } from "@/topics/kit/journeys";
import { activeTopic } from "@/topics/recommend";
import { WORLDS } from "@/topics/worlds";
import { KidHomeScreen } from "./KidHomeScreen";
import { PracticeHubScreen } from "./PracticeHubScreen";
import { ProgressScreen } from "./ProgressScreen";
import { TestsScreen } from "./TestsScreen";
import { TopicsScreen } from "./TopicsScreen";

/** D-043 step 3: the kid pages and their navigation, in jsdom, from a saved learner. */

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {} }), usePathname: () => "/" }));

const answer = (skill: string, correct: boolean, at: number): ItemResult => ({ questionId: `${skill}:${at}`, skill, context: "practice", correct, firstTry: correct, attempts: 1, hintsUsed: 0, misconceptions: [], at });

beforeEach(() => resetLearner());

describe("kid pages (D-043 step 3)", () => {
  it("navigates by Home, Topics, Practice, Tests and Progress, and marks the section a page belongs to", () => {
    render(<AppShell>page</AppShell>);
    const navs = screen.getAllByRole("navigation", { name: "Main" });
    for (const nav of navs) {
      expect(within(nav).getAllByRole("link").map((a) => [a.textContent, a.getAttribute("href")])).toEqual([
        ["Home", "/"],
        ["Topics", "/topics"],
        ["Practice", "/practice"],
        ["Tests", "/tests"],
        ["Progress", "/progress"],
      ]);
    }
    const section = (path: string) => ["/", "/topics", "/practice", "/tests", "/progress"].filter((h) => isActive(path, h));
    expect(section("/")).toEqual(["/"]);
    expect(section("/journey")).toEqual(["/topics"]);
    expect(section("/t/fractions")).toEqual(["/topics"]);
    expect(section("/t/fractions-2/learn/add-different")).toEqual(["/topics"]);
    expect(section("/t/fractions/practice/compare")).toEqual(["/practice"]);
    expect(section("/t/fractions/check")).toEqual(["/tests"]);
    expect(section("/t/mock-exams/mock")).toEqual(["/tests"]);
    expect(section("/badges")).toEqual(["/progress"]);
  });

  it("continues the topic journey worked in last, at its step, from Home", async () => {
    const def = journeyFor("fractions-2", "add-different")!;
    updateLearner((s) => ({ ...s, results: [answer("fractions.compare", true, 500)], journeys: { "fractions-2/add-different": { stage: 2, reached: 2, startedAt: 1000, practised: 7, applied: 0 } } }));
    render(<KidHomeScreen />);
    expect(await screen.findByRole("heading", { level: 1, name: /^Hi there!/ })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2, name: def.title })).toBeTruthy();
    expect(screen.getByText(/Fractions 2 · Step 3 of 5: Apply/)).toBeTruthy();
    expect(screen.getByRole("link", { name: /^Continue/ }).getAttribute("href")).toBe("/t/fractions-2/learn/add-different");
    expect(screen.getByRole("heading", { name: "Today's plan" })).toBeTruthy();
    expect(within(screen.getByRole("heading", { name: "Learn a new idea with Emma" }).closest("section")!).getAllByRole("link")).toHaveLength(JOURNEYS.length);
  });

  it("shows every topic in a grid with its progress, filtered by world", async () => {
    const user = userEvent.setup();
    render(<TopicsScreen />);
    // D-058: one list per world, each in its own band.
    const items = (lists: HTMLElement[]) => lists.flatMap((l) => within(l).getAllByRole("listitem"));
    expect(items(await screen.findAllByRole("list", { name: / topics$/ }))).toHaveLength(TOPICS.length);
    const fdp = WORLDS.find((w) => w.id === "fdp")!;
    await user.click(screen.getByRole("button", { name: fdp.title }));
    const shown = items(screen.getAllByRole("list", { name: / topics$/ }));
    expect(shown).toHaveLength(TOPICS.filter((t) => t.world === "fdp").length);
    expect(screen.getByRole("button", { name: fdp.title }).getAttribute("aria-pressed")).toBe("true");
    expect(within(shown[0]!).getByRole("img", { name: new RegExp(`skills mastered`) })).toBeTruthy();
  });

  it("draws the mastery ring and a bar per topic from the engine's own counts", async () => {
    const results = [answer("fractions.compare", true, 1), answer("fractions.compare", true, 2), answer("fractions.compare", true, 3), answer("fractions.equivalent", false, 4)];
    updateLearner((s) => ({ ...s, results }));
    render(<ProgressScreen />);
    // The ring covers the topic the child is in and every topic with answers: here, the start topic and Fractions.
    const here = activeTopic(getLearner());
    const fractions = topicById("fractions")!;
    expect(here.id).not.toBe("fractions");
    const over = (t: typeof here) => topicOverview(t, topicLearner(getLearner(), t.id));
    const o = over(fractions);
    const s = masterySummary([over(here), o]);
    expect(await screen.findByRole("img", { name: `Mastery: 0 of ${s.skills} skills mastered, 0%` })).toBeTruthy();
    expect(screen.getByRole("img", { name: `Fractions foundations: 0 of ${o.skills} skills mastered, 1 nearly there, 1 learning` })).toBeTruthy();
    expect([o.onTheWay, o.developing]).toEqual([1, 1]);
  });

  it("lists the big challenge for each started topic and the practice mocks", async () => {
    render(<TestsScreen />);
    const here = activeTopic(getLearner());
    expect(await screen.findByRole("heading", { name: "Big challenges" })).toBeTruthy();
    expect(screen.getByRole("link", { name: new RegExp(here.title) }).getAttribute("href")).toBe(`/t/${here.id}/check`);
    expect(screen.getByRole("link", { name: /Try a mock/ }).getAttribute("href")).toBe("/t/mock-exams/mock");
  });

  it("offers practice in the current topic first, then quick practice", async () => {
    render(<PracticeHubScreen />);
    const here = activeTopic(getLearner());
    expect((await screen.findByRole("link", { name: `Practise ${here.title}` })).getAttribute("href")).toBe(`/t/${here.id}/practice`);
    expect(screen.getByRole("heading", { name: "Quick practice" })).toBeTruthy();
    expect(topicById("times-tables")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Times-table facts/ }).getAttribute("href")).toBe("/t/times-tables/facts/practice");
  });
});
