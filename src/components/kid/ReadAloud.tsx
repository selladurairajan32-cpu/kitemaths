"use client";

import { useId } from "react";
import { speak, speechSupported, stopSpeaking, useSpeakingId } from "@/lib/speech";
import { useHydrated } from "@/lib/store";

export function SpeakerIcon({ size = 20, waves = true }: { size?: number; waves?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" fillOpacity="0.15" />
      {waves && (
        <>
          <path d="M15.5 9a4 4 0 0 1 0 6" />
          <path d="M18.3 6.5a7.5 7.5 0 0 1 0 11" />
        </>
      )}
    </svg>
  );
}

/** A big friendly "read it to me" button. Hidden when the browser can't speak. */
export function ReadAloud({
  text,
  className = "",
  label = "Read aloud",
  size = "md",
}: {
  text: string;
  className?: string;
  label?: string;
  size?: "md" | "lg";
}) {
  const hydrated = useHydrated();
  const id = useId();
  const speakingId = useSpeakingId();
  if (!hydrated || !speechSupported()) return null;
  const active = speakingId === id;
  const dims = size === "lg" ? "size-12" : "size-10";
  return (
    <button
      type="button"
      onClick={() => (active ? stopSpeaking() : speak(text, id))}
      aria-label={active ? "Stop reading" : label}
      aria-pressed={active}
      title={active ? "Stop reading" : label}
      className={`grid ${dims} shrink-0 place-items-center rounded-full border-2 transition-colors ${
        active ? "border-brand bg-brand text-white" : "border-sky/50 bg-sky-soft text-den-strong hover:bg-[#cce8ff]"
      } ${className}`}
    >
      <span className={active ? "animate-pulse" : ""}>
        <SpeakerIcon size={size === "lg" ? 24 : 20} />
      </span>
    </button>
  );
}
