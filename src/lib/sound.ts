"use client";

import { getLearner } from "./store";

/**
 * Tiny synthesised sound effects (no audio files to download).
 * Respects the learner's sound setting and never throws.
 */
export type SoundName = "correct" | "tryAgain" | "tap" | "star" | "levelUp" | "complete";

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx ??= new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(c: AudioContext, freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.18) {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + start);
  g.gain.setValueAtTime(0.0001, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(gain, c.currentTime + start + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  osc.connect(g).connect(c.destination);
  osc.start(c.currentTime + start);
  osc.stop(c.currentTime + start + dur + 0.05);
}

const SONGS: Record<SoundName, [number, number, number, OscillatorType?][]> = {
  // [frequency, start, duration, wave]
  correct: [
    [659, 0, 0.12, "triangle"],
    [880, 0.09, 0.22, "triangle"],
  ],
  tryAgain: [
    [392, 0, 0.14, "sine"],
    [349, 0.12, 0.2, "sine"],
  ],
  tap: [[880, 0, 0.05, "sine"]],
  star: [
    [1047, 0, 0.08, "triangle"],
    [1319, 0.06, 0.12, "triangle"],
  ],
  levelUp: [
    [523, 0, 0.12, "triangle"],
    [659, 0.1, 0.12, "triangle"],
    [784, 0.2, 0.12, "triangle"],
    [1047, 0.3, 0.35, "triangle"],
  ],
  complete: [
    [523, 0, 0.1, "triangle"],
    [784, 0.1, 0.1, "triangle"],
    [659, 0.2, 0.1, "triangle"],
    [1047, 0.3, 0.4, "triangle"],
  ],
};

export function playSound(name: SoundName) {
  try {
    if (!getLearner().settings.sound) return;
    const c = audio();
    if (!c) return;
    for (const [f, s, d, w] of SONGS[name]) tone(c, f, s, d, w, name === "tap" ? 0.08 : 0.16);
  } catch {
    /* sound is a nice-to-have */
  }
}
