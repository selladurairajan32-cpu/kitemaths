import type { ComponentType } from "react";

/**
 * D-060: what a concept supplies to be taught on the lesson canvas. The canvas owns the frame, the order of the phases,
 * the questions, the marking and the saved progress; the concept owns the three Learn phases and its hands-on help.
 */
export interface CanvasLesson {
  /** A puzzle before any teaching: the child commits to a guess, then sees it tested. */
  Discover: ComponentType<{ guess?: string; onGuess: (guess: string) => void; onDone: () => void }>;
  /** The hands-on model, with a goal the child reaches by acting on it. */
  Explore: ComponentType<{ onDone: () => void }>;
  /** The same steps seen several ways (picture, story, numbers), with a quick check that the idea has landed. */
  Understand: ComponentType<{ onDone: () => void }>;
  /** The hands-on model for one practice question, or nothing when it would not help. `open` is whether it starts open. */
  Aid?: ComponentType<{ templateKey: string; prompt: string; open: boolean; labelled: boolean }>;
  /** One sentence for the summary that sets the first guess beside what the child now knows. */
  lookBack?: (guess: string | undefined) => string | null;
}
