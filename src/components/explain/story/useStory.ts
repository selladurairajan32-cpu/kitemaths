"use client";

import { useEffect, useReducer, type Dispatch } from "react";
import { initialStory, storyReducer, type Chapter, type StoryEvent, type StoryState } from "@/engine/story";

/**
 * Runs a story (D-040): the pure `storyReducer` plus a clock that ticks while playing. Playback never starts by
 * itself; it pauses when the tab is hidden, and the clock stops whenever the story isn't playing.
 */
export function useStory<S>(chapters: Chapter<S>[]): [StoryState, Dispatch<StoryEvent>] {
  const [state, dispatch] = useReducer((s: StoryState, e: StoryEvent) => storyReducer(chapters, s, e), undefined, initialStory);

  useEffect(() => {
    if (!state.playing) return;
    let last = performance.now();
    const step = () => {
      const now = performance.now();
      dispatch({ type: "tick", ms: now - last });
      last = now;
    };
    if (typeof requestAnimationFrame === "function") {
      let id = requestAnimationFrame(function frame() {
        step();
        id = requestAnimationFrame(frame);
      });
      return () => cancelAnimationFrame(id);
    }
    const id = setInterval(step, 50);
    return () => clearInterval(id);
  }, [state.playing]);

  useEffect(() => {
    const onHide = () => document.hidden && dispatch({ type: "pause" });
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);

  return [state, dispatch];
}
