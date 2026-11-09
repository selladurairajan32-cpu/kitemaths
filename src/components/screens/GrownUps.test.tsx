import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { activityProgress, lessonsEvidenced, masteredSkills, reviewSkills, strongSkills } from "@/engine/journey";
import { topicLearner } from "@/engine/progress";
import { seededLearner } from "@/test/seed";
import { topicById } from "@/topics";
import { ParentScreen } from "./ParentScreen";

/**
 * MAST-003 (progress dashboard), MAST-004 (results) and MAST-005 AC3 (reset), rendered in jsdom from a saved learner
 * built with the engine. Every number on screen is compared with the engine's own calculation from the same attempts.
 */

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => {}, replace: () => {} }), usePathname: () => "/parent" }));

const learner = seededLearner();
const topic = topicById("fractions")!;
const t = topicLearner(learner, "fractions");

beforeAll(() => {
  window.localStorage.setItem("kite-maths:v2", JSON.stringify(learner));
});

/** The value next to a label in the overview's stats list (`<dt>` then `<dd>`). */
const stat = (label: string) => [...document.querySelectorAll("dt")].find((dt) => dt.textContent === label)?.nextElementSibling?.textContent;

describe("grown-ups overview (MAST-003)", () => {
  it("shows completed lessons, developing and mastered skills, and the next activity, all from recorded attempts", () => {
    render(<ParentScreen />);
    expect(lessonsEvidenced(topic, t)).toBe(2);
    expect(stat("Lessons done")).toBe(`2 / ${topic.lessons.length}`);
    expect(stat("Secure in practice")).toBe(`${strongSkills(topic, t).length} / ${topic.skills.length}`);
    expect(stat("Mastered")).toBe(`${masteredSkills(topic, t).length} / ${topic.skills.length}`);
    expect(stat("Needs review")).toBe(String(reviewSkills(topic, t).length));
    expect(screen.getByText("Recommended next")).toBeTruthy();
    // The ring is the real activity figure, not a decorative value (MAST-003 AC3).
    expect(screen.getByText(`${Math.round(activityProgress(topic, t) * 100)}%`)).toBeTruthy();
  });
});

describe("reset (MAST-005 AC3)", () => {
  it("asks before clearing, can be cancelled, and clears saved progress when confirmed", async () => {
    const user = userEvent.setup();
    render(<ParentScreen />);
    await user.click(screen.getByRole("button", { name: /Reset progress/ }));
    expect(screen.getByText("Clear all progress saved in this browser?")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    // Cancelled: nothing changed.
    expect(stat("Lessons done")).toBe(`2 / ${topic.lessons.length}`);
    await user.click(screen.getByRole("button", { name: /Reset progress/ }));
    await user.click(screen.getByRole("button", { name: "Yes, reset" }));
    const after = JSON.parse(window.localStorage.getItem("kite-maths:v2")!);
    expect(after.results).toEqual([]);
    expect(after.topics).toEqual({});
  });
});
