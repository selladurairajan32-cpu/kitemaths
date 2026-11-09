import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TopicProvider } from "@/topics/context";
import { questionById } from "@/topics";
import type { Question } from "@/topics/types";
import { QuestionPlayer, type ResultDraft } from "./QuestionPlayer";

/**
 * QA-002 and PRACT-002 to PRACT-004, PRACT-008: the question player with real Fractions questions, in jsdom.
 * Each test drives the UI as a child would (pointer or keyboard) and checks what is shown and what is recorded.
 */

vi.mock("@/lib/sound", () => ({ playSound: () => {} }));
vi.mock("@/lib/speech", async (orig) => ({ ...(await orig<typeof import("@/lib/speech")>()), speak: () => {}, speechSupported: () => false }));

function play(id: string) {
  const onComplete = vi.fn<(r: ResultDraft) => void>();
  const q = questionById(id) as Question;
  render(
    <TopicProvider topicId="fractions">
      <QuestionPlayer question={q} context="practice" onComplete={onComplete} />
    </TopicProvider>,
  );
  return { q, onComplete };
}

const check = () => screen.getByRole("button", { name: /^Check/ });
/** A radio found by its visible label text (choice labels are rich text, not an aria-label). */
const radioByText = (re: RegExp) => screen.getAllByRole("radio").find((r) => re.test(r.getAttribute("aria-label") ?? r.closest("label")?.textContent ?? ""))!;

describe("question player (component)", () => {
  it("single-answer choice: clear selected state, submit, and informative confirmation (PRACT-002 AC1, PRACT-008 AC1)", async () => {
    const user = userEvent.setup();
    const { onComplete } = play("fractions.ad-1"); // {1/5} + {2/5}
    expect((check() as HTMLButtonElement).disabled).toBe(true);
    const right = screen.getByRole("radio", { name: /3 over 5|3\/5|three fifths/i });
    await user.click(right);
    expect((right as HTMLInputElement).checked).toBe(true);
    await user.click(check());
    // Confirmation explains why, not just "correct".
    expect(await screen.findByText(/1 fifth \+ 2 fifths = 3 fifths/)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /Continue/ }));
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ correct: true, firstTry: true, attempts: 1, hintsUsed: 0 }));
  });

  it("a tagged wrong answer gets a hedged diagnosis and a guided step before any reveal, and the retry is recorded (PRACT-008 AC2, AC3)", async () => {
    const user = userEvent.setup();
    const { onComplete } = play("fractions.ad-1");
    await user.click(screen.getByRole("radio", { name: /3 over 10|3\/10|three tenths/i }));
    await user.click(check());
    // Not revealed: a possible cause, then a follow-up question.
    expect(await screen.findByText(/It looks like the bottom numbers might have been added/)).toBeTruthy();
    expect(screen.queryByText(/The answer is/)).toBeNull();
    // A guided follow-up question on the same idea, then back to the original.
    await user.click(screen.getByRole("button", { name: /Try a quick question/ }));
    await user.click(radioByText(/5, so the answer is in fifths/));
    // The follow-up may submit on choosing; press Check only if it is still offered.
    const followUpCheck = screen.queryAllByRole("button", { name: /^Check/ }).at(-1);
    if (followUpCheck) await user.click(followUpCheck);
    await user.click(await screen.findByRole("button", { name: /Back to the question/ }));
    await user.click(screen.getByRole("radio", { name: /3 over 5|3\/5|three fifths/i }));
    await user.click(check());
    await user.click(await screen.findByRole("button", { name: /Continue/ }));
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ correct: true, firstTry: false, attempts: 2, misconceptions: ["fractions.added-denominators"] }));
  });

  it("shade: asks for a fraction, sections can be selected by keyboard, and validation checks the amount (PRACT-003)", async () => {
    const user = userEvent.setup();
    const q = questionById("fractions.as-15"); // shade 3/4 of a circle with 8 slices
    expect(q.prompt).toMatch(/Shade \{3\/4\}/);
    const onComplete = vi.fn();
    render(
      <TopicProvider topicId="fractions">
        <QuestionPlayer question={q as Question} context="practice" onComplete={onComplete} />
      </TopicProvider>,
    );
    const parts = screen.getAllByRole("checkbox", { name: /^Part \d+ of 8$/ });
    expect(parts).toHaveLength(8);
    parts[0].focus();
    for (let i = 0; i < 6; i++) await user.keyboard(i === 0 ? " " : "{ArrowRight} ");
    expect(parts.filter((p) => p.getAttribute("aria-checked") === "true")).toHaveLength(6);
    await user.click(check());
    await user.click(await screen.findByRole("button", { name: /Continue/ }));
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ correct: true }));
  });

  it("match: every picture is matched with the keyboard alone (PRACT-004 AC3)", async () => {
    const user = userEvent.setup();
    const { onComplete } = play("fractions.nm-6"); // A 1/4, B 2/3, C 3/5
    const answers: Record<string, string> = { A: "1 over 4", B: "2 over 3", C: "3 over 5" };
    for (const [letter, fr] of Object.entries(answers)) {
      const group = screen.getByRole("group", { name: `Picture ${letter}: choose its fraction` });
      const option = within(group).getByRole("radio", { name: `Picture ${letter} is ${fr}` });
      option.focus();
      await user.keyboard(" ");
      expect((option as HTMLInputElement).checked).toBe(true);
    }
    check().focus();
    await user.keyboard("{Enter}");
    await act(async () => {});
    await user.click(await screen.findByRole("button", { name: /Continue/ }));
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ correct: true }));
  });
});
