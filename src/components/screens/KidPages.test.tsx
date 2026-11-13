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
import { TopicProvider } from "@/topics/context";
import { KidHomeScreen } from "./KidHomeScreen";
import { SkyMapScreen } from "./SkyMapScreen";
import { PracticeHubScreen } from "./PracticeHubScreen";
import { ProgressScreen } from "./ProgressScreen";
import { TestsScreen } from "./TestsScreen";
import { TopicsScreen } from "./TopicsScreen";

/** D-043 step 3: the kid pages and their navigation, in jsdom, from a saved learner. */

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {} }), usePathname: () => "/" }));

const answer = (skill: string, correct: boolean, at: number): ItemResult => ({ questionId: `${skill}:${at}`, skill, context: "practice", correct, firstTry: correct, attempts: 1, hintsUsed: 0, misconceptions: [], at });

beforeEach(() => resetLearner());

describe("kid pages (D-043 step 3)", () => {
  it("navigates by Dashboard, Topics, Practice, Tests and Progress, and marks the section a page belongs to", () => {
    render(<AppShell>page</AppShell>);
    const navs = screen.getAllByRole("navigation", { name: "Main" });
    for (const nav of navs) {
      expect(within(nav).getAllByRole("link").map((a) => [a.textContent, a.getAttribute("href")])).toEqual([
        // D-066: the first prototype's name for Home on the wide bar; the phone's bar says "Home".
        [navs.length > 1 && nav === navs[1] ? "Home" : "Dashboard", "/"],
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
    expect(await screen.findByRole("heading", { level: 1, name: "Your maths dashboard" })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 3, name: def.title })).toBeTruthy();
    // The lesson is on the canvas, so Home counts its six steps (Apply is the fifth).
    expect(screen.getByText(/Fractions 2 · Step 5 of 6: Apply/)).toBeTruthy();
    expect(screen.getByRole("link", { name: /^Continue/ }).getAttribute("href")).toBe("/t/fractions-2/learn/add-different");
    // D-066: the prototype's dashboard has no plan; the weekly plan stays in the grown-ups' area.
    expect(screen.queryByRole("heading", { name: "Today's plan" })).toBeNull();
    // D-062: the lesson being continued is not listed a second time under "Hands-on lessons".
    expect(screen.queryByRole("heading", { name: "Hands-on lessons" })).toBeNull();
    expect(JOURNEYS.filter((j) => j.canvas)).toHaveLength(1);
    // D-066: the dashboard's current topic card names the topic and its learning phases.
    expect(screen.getByRole("list", { name: "Learning phases" })).toBeTruthy();
  });

  it("offers to continue a lesson begun on the canvas even before any question is answered", async () => {
    updateLearner((s) => ({ ...s, journeys: { "fractions-2/add-different": { stage: 0, reached: 0, startedAt: 1000, practised: 0, applied: 0, learn: 1, learnReached: 1 } } }));
    render(<KidHomeScreen />);
    expect((await screen.findByRole("link", { name: /^Continue/ })).getAttribute("href")).toBe("/t/fractions-2/learn/add-different");
    expect(screen.getByText(/Fractions 2 · Step 2 of 6: Explore/)).toBeTruthy();
    // The dark button continues the lesson; the warm-up is only offered as a link in a note.
    expect(screen.getByRole("link", { name: /^Continue lesson/ }).className).toContain("bg-ink");
    expect(screen.queryByRole("link", { name: /^Play the warm-up/ })?.className ?? "").not.toContain("bg-ink");
  });

  it("shows every topic in a list with its progress, filtered by world", async () => {
    const user = userEvent.setup();
    render(<TopicsScreen />);
    // D-062: one plain list per world, and every topic opens its own page of sub-topics.
    const items = (lists: HTMLElement[]) => lists.flatMap((l) => within(l).getAllByRole("listitem"));
    expect(items(await screen.findAllByRole("list", { name: / topics$/ }))).toHaveLength(TOPICS.length);
    const fdp = WORLDS.find((w) => w.id === "fdp")!;
    await user.click(screen.getByRole("button", { name: fdp.title }));
    const shown = items(screen.getAllByRole("list", { name: / topics$/ }));
    expect(shown).toHaveLength(TOPICS.filter((t) => t.world === "fdp").length);
    expect(screen.getByRole("button", { name: fdp.title }).getAttribute("aria-pressed")).toBe("true");
    expect(within(shown[0]!).getByRole("img", { name: new RegExp(`skills mastered`) })).toBeTruthy();
    expect(shown.map((li) => within(li).getByRole("link").getAttribute("href")).sort()).toEqual(TOPICS.filter((t) => t.world === "fdp").map((t) => `/t/${t.id}`).sort());
    expect(shown.some((li) => within(li).getByRole("link").getAttribute("href") === "/t/fractions-2")).toBe(true);
  });

  it("lists a topic's sub-topics in teaching order with one thing to do next, and opens each where it is taught", async () => {
    render(<TopicProvider topicId="fractions-2"><SkyMapScreen /></TopicProvider>);
    // D-066: the first prototype's "Your learning journey", for this topic.
    expect(await screen.findByRole("heading", { level: 1, name: "Your learning journey" })).toBeTruthy();
    expect(screen.getByText("Fractions 2", { selector: "p" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /All topics/ }).getAttribute("href")).toBe("/topics");
    const list = screen.getByRole("list", { name: "Lessons and challenges" });
    const links = [...new Set(within(list).getAllByRole("link").map((a) => a.getAttribute("href")))];
    // D-064: every stop opens one place. The lesson on the canvas opens the canvas; the others open their lesson.
    expect(links).toContain("/t/fractions-2/learn/add-different");
    expect(links).toContain("/t/fractions-2/lesson/simplify");
    expect(links.filter((h) => h!.includes("/study") || h!.includes("/learn/multiply"))).toEqual([]);
    expect(links.slice(-2)).toEqual(["/t/fractions-2/practice", "/t/fractions-2/check"]);
    expect(within(list).getByText("Part 2: Adding and subtracting")).toBeTruthy();
    // New learner: the first sub-topic is recommended next, with the page's dark Start button.
    const here = within(list).getAllByRole("listitem").find((li) => li.getAttribute("aria-current") === "step")!;
    expect(within(here).getByRole("heading", { name: "Simplest form" })).toBeTruthy();
    expect(new Set(within(here).getAllByRole("link", { name: /^Start/ }).map((a) => a.getAttribute("href")))).toEqual(new Set(["/t/fractions-2/lesson/simplify"]));
    expect(screen.getByRole("heading", { name: "How you'll learn" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /Free lab/ }).getAttribute("href")).toBe("/t/fractions-2/lab");
  });

  it("shows how far a lesson on the canvas has got, and a topic without a study plan opens its lessons", async () => {
    updateLearner((s) => ({ ...s, journeys: { "fractions-2/add-different": { stage: 1, reached: 1, startedAt: 1000, practised: 2, applied: 0 } } }));
    const { unmount } = render(<TopicProvider topicId="fractions-2"><SkyMapScreen /></TopicProvider>);
    expect(await screen.findByText("Carry on: Practise, step 4 of 6.")).toBeTruthy();
    unmount();
    render(<TopicProvider topicId="decimals"><SkyMapScreen /></TopicProvider>);
    const first = topicById("decimals")!.lessons[0]!;
    const list = await screen.findByRole("list", { name: "Lessons and challenges" });
    expect(within(list).getAllByRole("link")[0]!.getAttribute("href")).toBe(`/t/decimals/lesson/${first.id}`);
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
