import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import { longMultiplication } from "@/maths/long-multiplication";
import { topicById } from "@/topics";
import { EXPLAINERS, isKitLabDone } from "@/topics/kit/explainers";
import type { LabStepProps } from "@/topics/types";
import { blocksSteps, numbersSteps, pictureSteps, tryItBlanks } from "./captions";
import { LongMultiplicationRemedy, LongMultiplicationTry, LongMultiplicationWatch, longMultiplicationChapters } from "./LongMultiplicationLab";

/**
 * ANIM-001 pilot v2 (D-036): Long multiplication as one story in three chapters (blocks, picture, numbers) on a stage
 * with one Next button, tasks the child does, and a separate Try it yourself with "Show me again".
 * Animations are skipped in component tests, so every step shows its end state.
 */

vi.mock("@/lib/sound", () => ({ playSound: () => {} }));

const lesson = topicById("multiply-divide")!.lessonById("long")!;
const labs = lesson.steps.filter((s) => s.type === "lab") as LabStepProps["step"][];
const [watchStep, tryStep] = labs as [LabStepProps["step"], LabStepProps["step"]];
const plain = (t: string) => t.replace(/ /g, " ").replace(/\*\*/g, "");
const words = (t: string) => plain(t).split(/\s+/).filter(Boolean).length;

function renderWatch(completed: string[] = []) {
  const onChallengeComplete = vi.fn();
  const utils = render(<LongMultiplicationWatch step={watchStep} completed={completed} onChallengeComplete={onChallengeComplete} />);
  return { ...utils, onChallengeComplete };
}
const kip = () => plain(screen.getByText(/step \d+ of \d+\./).previousElementSibling!.textContent!);
const nextButton = () => screen.getByRole("button", { name: /^(Next|Your turn first|I've got it!|Watched it all)$/ });
const chapterButton = (name: string) => screen.getByRole("button", { name: new RegExp(name) });

describe("long multiplication story (ANIM-001 v2)", () => {
  const m = longMultiplication(23, 14);

  it("tells the story in three chapters, with a task for the child in each", () => {
    expect(blocksSteps(m).map((s) => !!s.task)).toEqual([false, false, false, false, true, false]);
    expect(pictureSteps(m).map((s) => !!s.task)).toEqual([false, true, false, false]);
    expect(numbersSteps(m).map((s) => !!s.task)).toEqual([false, false, true, false]);
    expect(longMultiplicationChapters(m).map((c) => c.label)).toEqual(["Blocks", "Picture", "Numbers"]);
  });

  it("keeps what Kip says short: about 12 words a step", () => {
    const all = [...blocksSteps(m), ...pictureSteps(m), ...numbersSteps(m)].flatMap((s) => [s.say, s.doneSay ?? ""]).filter(Boolean);
    expect(all.filter((t) => words(t) > 14)).toEqual([]);
    expect(plain(blocksSteps(m)[4]!.doneSay!)).toBe("Brilliant! 9 tens and 2 ones make 92.");
    expect(plain(numbersSteps(m)[1]!.say)).toBe("3 × 4 = 12 ones. Ten ones make a ten: carry it!");
  });

  it("refuses numbers the scenes cannot draw", () => {
    expect(() => longMultiplicationChapters(longMultiplication(34, 12))).toThrow(RangeError);
    expect(() => longMultiplicationChapters(longMultiplication(23, 24))).toThrow(RangeError);
  });

  it("builds the try-it parts for 34 × 12, each with the step to show again", () => {
    expect(tryItBlanks(longMultiplication(34, 12)).map((b) => [plain(b.prompt), b.answer, b.traps.map((t) => t.value), `${b.show.chapter}:${b.show.step}`])).toEqual([
      ["34 × 2 =", 68, [], "numbers:1"],
      ["34 × 10 =", 340, [34], "numbers:2"],
      ["68 + 340 =", 408, [102], "numbers:3"],
    ]);
  });
});

describe("long multiplication lesson wiring (ANIM-001 v2)", () => {
  it("adds a watch step and a try step after the worked examples, keeping the checks", () => {
    expect(lesson.steps.map((s) => (s.type === "lab" ? (s as unknown as { explainer: string }).explainer : s.type))).toEqual([
      "explain",
      "worked",
      "worked",
      "long-multiplication-watch",
      "long-multiplication-try",
      "check",
      "check",
    ]);
    for (const s of labs) expect(EXPLAINERS).toContain((s as unknown as { explainer: string }).explainer);
  });

  it("holds each step until it is finished", () => {
    expect(isKitLabDone(watchStep, [])).toBe(false);
    expect(isKitLabDone(watchStep, ["multiply-divide.long-watch"])).toBe(true);
    expect(isKitLabDone(tryStep, ["multiply-divide.long-watch"])).toBe(false);
    expect(isKitLabDone(tryStep, ["multiply-divide.long-try"])).toBe(true);
  });
});

describe("long multiplication stage (ANIM-001 v2)", () => {
  it("starts with the blocks and moves on with one Next button", async () => {
    const user = userEvent.setup();
    renderWatch();
    expect(chapterButton("Blocks").getAttribute("aria-current")).toBe("step");
    expect(kip()).toBe("One row is 23: 2 tens and 3 ones.");
    expect(screen.getByText("= 23")).toBeTruthy();
    await user.click(nextButton());
    expect(kip()).toBe("Now make 14 rows of 23.");
    await user.click(nextButton());
    await user.click(nextButton());
    // Ten rods joined into hundreds, ten ones into tens.
    expect(screen.getByText("2 hundreds")).toBeTruthy();
    expect(screen.getByText("3 tens")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Back a step" }));
    expect(kip()).toBe("Split them: 10 rows and 4 rows.");
    await user.click(screen.getByRole("button", { name: /Watch again/ }));
    expect(kip()).toBe("Split them: 10 rows and 4 rows.");
  });

  it("waits for the child to swap ten ones for a ten, then praises it", async () => {
    const user = userEvent.setup();
    renderWatch();
    for (let i = 0; i < 4; i++) await user.click(nextButton());
    expect(nextButton().textContent).toContain("Your turn first");
    expect(nextButton()).toHaveProperty("disabled", true);
    expect(screen.getByText("12 ones: too many!")).toBeTruthy();
    // The ones themselves can be tapped (or used with the keyboard), as well as the big button.
    screen.getAllByRole("button", { name: "Swap 10 ones for a ten" })[0]!.focus();
    await user.keyboard("{Enter}");
    expect(kip()).toBe("Brilliant! 9 tens and 2 ones make 92.");
    expect(screen.getByText("9 tens")).toBeTruthy();
    expect(nextButton()).toHaveProperty("disabled", false);
    await user.click(nextButton());
    expect(screen.getByText("3 hundreds, 2 tens, 2 ones")).toBeTruthy();
  });

  it("lets the child cut the picture with the scissors, and nudges a wrong cut", async () => {
    const user = userEvent.setup();
    renderWatch();
    await user.click(chapterButton("Picture"));
    expect(kip()).toBe("The blocks make a rectangle: 23 long, 14 high.");
    await user.click(nextButton());
    const scissors = screen.getByRole("slider", { name: /Scissors/ });
    scissors.focus();
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(scissors.getAttribute("aria-valuenow")).toBe("5");
    expect(screen.getByText("Try 10 rows: tens are easy to multiply.")).toBeTruthy();
    expect(nextButton()).toHaveProperty("disabled", true);
    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}{Enter}");
    expect(kip()).toBe("Great cut! Now 23 splits into 20 + 3 too.");
    await user.click(nextButton());
    expect(kip()).toBe("Four easy pieces: 200, 30, 80, 12.");
  });

  it("has the child fill the gap after the digits step left for × 10", async () => {
    const user = userEvent.setup();
    renderWatch();
    await user.click(chapterButton("Numbers"));
    await user.click(nextButton());
    expect(screen.getByText("23 × 4")).toBeTruthy();
    await user.click(nextButton());
    expect(screen.getByLabelText("Empty ones place")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Put a 0 in the ones place" }));
    expect(kip()).toBe("Yes! The 0 keeps the digits in place: 230.");
    expect(screen.getByText("Digits moved one place: 23 × 10 = 230")).toBeTruthy();
    await user.click(nextButton());
    expect(nextButton().textContent).toContain("I've got it!");
  });

  it("finishes the step with the last button and moves with the arrow keys", async () => {
    const user = userEvent.setup();
    const { onChallengeComplete } = renderWatch();
    await user.click(chapterButton("Numbers"));
    await user.keyboard("{ArrowRight}");
    expect(kip()).toBe("3 × 4 = 12 ones. Ten ones make a ten: carry it!");
    await user.keyboard("{ArrowRight}");
    await user.click(screen.getByRole("button", { name: "Put a 0 in the ones place" }));
    // The 0 tile is gone once placed, so focus moves to the way forward.
    await waitFor(() => expect(document.activeElement).toBe(nextButton()));
    await user.keyboard("{ArrowRight}");
    expect(kip()).toBe("Add the rows: 92 + 230 = 322.");
    await user.click(nextButton());
    expect(onChallengeComplete).toHaveBeenCalledWith("multiply-divide.long-watch");
    expect(nextButton().textContent).toContain("Watched it all");
  });

  it("has no automated accessibility violations", async () => {
    const { container } = renderWatch();
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });
});

describe("long multiplication try-it (ANIM-001 v2)", () => {
  it("gives specific feedback, shows the matching step again, and completes when every part is right", async () => {
    const user = userEvent.setup();
    const onChallengeComplete = vi.fn();
    render(<LongMultiplicationTry step={tryStep} completed={[]} onChallengeComplete={onChallengeComplete} />);
    const answer = async (v: string) => {
      const box = screen.getByRole("textbox");
      await user.clear(box);
      await user.type(box, v);
      await user.click(screen.getByRole("button", { name: "Check" }));
    };
    expect(screen.getByText("Part 1 of 3")).toBeTruthy();
    await answer("68");
    await answer("34");
    expect(screen.getByRole("status").textContent).toContain("Did you forget the 0?");
    await user.click(screen.getByRole("button", { name: /Show me again/ }));
    const replay = screen.getByRole("region", { name: "Show me again" });
    expect(within(replay).getByText(/how it worked for 23 × 14/)).toBeTruthy();
    expect(plain(replay.textContent!)).toContain("The 0 keeps the digits in place");
    await answer("340");
    await answer("400");
    expect(screen.getByRole("status").textContent).toContain("Add the ones");
    expect(onChallengeComplete).not.toHaveBeenCalled();
    await answer("408");
    expect(onChallengeComplete).toHaveBeenCalledWith("multiply-divide.long-try");
    expect(screen.getByText(/Every part is right/)).toBeTruthy();
  });

  it("shows the finished try-it when it was done before", () => {
    render(<LongMultiplicationTry step={tryStep} completed={["multiply-divide.long-try"]} onChallengeComplete={() => {}} />);
    expect(screen.getByText(/Every part is right/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Check" })).toBeNull();
  });

  it("shows how × 10 works after a tens-place slip in practice", () => {
    render(<LongMultiplicationRemedy />);
    expect(screen.getByText("Watch how times 10 works:")).toBeTruthy();
    expect(screen.getByText("Digits moved one place: 23 × 10 = 230")).toBeTruthy();
  });
});
