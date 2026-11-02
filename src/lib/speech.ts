"use client";

import { useSyncExternalStore } from "react";
import { toWords } from "@/topics/fractions/math";

/** Turns lesson markup into natural speech: **bold** → plain, {3/4} → "three quarters". */
export function toSpeech(text: string): string {
  return text
    .replace(/\{(\d+)\/(\d+)\}/g, (_, n, d) => toWords({ n: Number(n), d: Number(d) }))
    .replace(/\*\*/g, "")
    .replace(/£(\d+)/g, "$1 pounds")
    .replace(/(\d+)\s*km\b/g, "$1 kilometres")
    .replace(/[“”]/g, "")
    .replace(/—/g, ", ")
    .replace(/×/g, " times ")
    .replace(/÷/g, " divided by ")
    .replace(/\s+/g, " ")
    .trim();
}

let speakingId: string | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
}

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === "en-GB" && /female|libby|sonia|serena|kate|martha/i.test(v.name)) ??
    voices.find((v) => v.lang === "en-GB") ??
    voices.find((v) => v.lang.startsWith("en"))
  );
}

export function speak(text: string, id = text) {
  if (!speechSupported()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(toSpeech(text));
  const voice = pickVoice();
  if (voice) u.voice = voice;
  u.lang = voice?.lang ?? "en-GB";
  u.rate = 0.92;
  u.pitch = 1.08;
  const done = () => {
    if (speakingId === id) {
      speakingId = null;
      emit();
    }
  };
  u.onend = done;
  u.onerror = done;
  speakingId = id;
  emit();
  synth.speak(u);
}

export function stopSpeaking() {
  if (!speechSupported()) return;
  window.speechSynthesis.cancel();
  speakingId = null;
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** The id of whatever is being read aloud right now, or null. */
export function useSpeakingId(): string | null {
  return useSyncExternalStore(subscribe, () => speakingId, () => null);
}
