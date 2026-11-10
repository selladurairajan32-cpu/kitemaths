/**
 * The state behind Watch & Learn controls (ANIM-001 §2): which step is showing and whether Play is on.
 * A pure reducer, so every transition is unit-tested without a browser.
 */
export interface StepperState {
  step: number;
  count: number;
  playing: boolean;
}

export type StepperAction =
  | { type: "next" }
  | { type: "back" }
  | { type: "goto"; step: number }
  | { type: "play" }
  | { type: "pause" }
  | { type: "replay" }
  /** Play's timer firing: moves on one step, and stops on the last. */
  | { type: "tick" }
  /** A new set of steps (another method): keep the step if it exists. */
  | { type: "reset"; count: number };

const clamp = (n: number, count: number) => Math.max(0, Math.min(count - 1, n));

export function initStepper(count: number): StepperState {
  if (!Number.isInteger(count) || count < 1) throw new RangeError(`A stepper needs at least one step, got ${count}`);
  return { step: 0, count, playing: false };
}

export function stepper(s: StepperState, a: StepperAction): StepperState {
  switch (a.type) {
    case "next":
      return { ...s, step: clamp(s.step + 1, s.count), playing: false };
    case "back":
      return { ...s, step: clamp(s.step - 1, s.count), playing: false };
    case "goto":
      return { ...s, step: clamp(a.step, s.count), playing: false };
    case "play":
      // Play from the end starts again, as a video player does.
      return { ...s, step: s.step >= s.count - 1 ? 0 : s.step, playing: s.count > 1 };
    case "pause":
      return { ...s, playing: false };
    case "replay":
      return { ...s, step: 0, playing: s.count > 1 };
    case "tick": {
      if (!s.playing) return s;
      const step = clamp(s.step + 1, s.count);
      return { ...s, step, playing: step < s.count - 1 };
    }
    case "reset":
      return { step: clamp(s.step, a.count), count: a.count, playing: false };
  }
}

export const isLast = (s: StepperState) => s.step === s.count - 1;
