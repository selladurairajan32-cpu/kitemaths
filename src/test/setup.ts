import { cleanup } from "@testing-library/react";
import { MotionGlobalConfig } from "motion/react";
import { afterEach } from "vitest";

// Component tests (QA-002) run in jsdom. Each test starts from a clean document and empty storage.
afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

// jsdom has no matchMedia; motion and reduced-motion checks read it.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({ matches: false, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false }) as MediaQueryList;
}

// jsdom has no PointerEvent; without it pointer events lose clientX and pointerId.
if (typeof window.PointerEvent === "undefined") {
  class PointerEventPolyfill extends MouseEvent {
    pointerId: number;
    pointerType: string;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 0;
      this.pointerType = init.pointerType ?? "mouse";
    }
  }
  window.PointerEvent = PointerEventPolyfill as unknown as typeof PointerEvent;
}

// Animations finish instantly in component tests, so AnimatePresence swaps panels without waiting for frames.
MotionGlobalConfig.skipAnimations = true;
