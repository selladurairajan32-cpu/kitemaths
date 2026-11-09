import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { topicById } from "@/topics";
import { TopicProvider } from "@/topics/context";
import { LessonPlayer } from "./LessonPlayer";

/**
 * QA-002 (integration): a lesson played through in jsdom. Checks lesson progression, the guided step with its hint,
 * that progress is saved to storage as the child goes (persistence), and that the evidence check is recorded.
 */

vi.mock("@/lib/sound", () => ({ playSound: () => {} }));

const saved = () => JSON.parse(window.localStorage.getItem("kite-maths:v2") ?? "null");

describe("lesson player (integration)", () => {
  it("moves step by step, saves progress, and records the lesson check", async () => {
    const user = userEvent.setup();
    const lesson = topicById("fractions")!.lessonById("adding")!;
    render(
      <TopicProvider topicId="fractions">
        <LessonPlayer lesson={lesson} />
      </TopicProvider>,
    );
    // Step 1: the explanation. Continue is available at once.
    expect(screen.getByRole("heading", { name: "Sevenths and sevenths make sevenths" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /^Continue/ }));
    expect(saved().topics.fractions.lessons.adding.furthestStep).toBe(1);

    // Step 2: watch me. Every step must be shown before Continue works.
    expect((screen.getByRole("button", { name: /^Continue/ }) as HTMLButtonElement).disabled).toBe(true);
    while (screen.queryByRole("button", { name: /^Next step/ })) await user.click(screen.getByRole("button", { name: /^Next step/ }));
    await user.click(screen.getByRole("button", { name: /^Continue/ }));

    // Step 3: together. A wrong value gets the trap's feedback; the right one unlocks Continue.
    while (!screen.queryByLabelText("Sixths left") && screen.queryByRole("button", { name: /^Next step/ })) await user.click(screen.getByRole("button", { name: /^Next step/ }));
    const box = screen.getByLabelText("Sixths left");
    await user.type(box, "7");
    await user.click(screen.getByRole("button", { name: "Check" }));
    expect(screen.getByText(/That's adding. We are taking 2 sixths away./)).toBeTruthy();
    await user.clear(box);
    await user.type(box, "3");
    await user.click(screen.getByRole("button", { name: "Check" }));
    await user.click(screen.getByRole("button", { name: /^Continue/ }));
    expect(saved().topics.fractions.lessons.adding.furthestStep).toBe(3);

    // Step 4: the first evidence check, answered right first time.
    await user.click(screen.getByRole("radio", { name: "5 over 6" }));
    await user.click(screen.getByRole("button", { name: /^Check/ }));
    await user.click(await screen.findByRole("button", { name: /^Continue/ }));
    const r = saved().results.find((x: { questionId: string }) => x.questionId === "fractions.ls-add-1");
    expect(r).toMatchObject({ context: "lesson", correct: true, firstTry: true, hintsUsed: 0, skill: "fractions.add-same" });
  });
});
