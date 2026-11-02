"use client";

import { useSyncExternalStore } from "react";
import { createInitialState, hydrateState, isCompatibleState, type LearnerState } from "@/engine/progress";

export const STORAGE_KEY = "kite-maths:fractions:v1";
const SERVER_STATE = createInitialState();

export type StorageStatus = "ok" | "unavailable" | "recovered";

let state: LearnerState = SERVER_STATE;
let status: StorageStatus = "ok";
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    status = "unavailable";
    state = createInitialState();
    return;
  }
  if (raw === null) {
    state = createInitialState();
    return;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isCompatibleState(parsed)) throw new Error("incompatible");
    state = hydrateState(parsed);
  } catch {
    try {
      window.localStorage.setItem(`${STORAGE_KEY}:backup:${Date.now()}`, raw);
    } catch {
    }
    status = "recovered";
    state = createInitialState();
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function onStorage(e: StorageEvent) {
  if (e.key !== STORAGE_KEY) return;
  loaded = false;
  load();
  emit();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

export function getLearner(): LearnerState {
  load();
  return state;
}

export function updateLearner(fn: (s: LearnerState) => LearnerState) {
  load();
  const next = fn(state);
  if (next === state) return;
  state = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    status = "unavailable";
  }
  emit();
}

export function resetLearner() {
  updateLearner(() => createInitialState());
}

export function useLearner(): LearnerState {
  return useSyncExternalStore(subscribe, getLearner, () => SERVER_STATE);
}

export function useStorageStatus(): StorageStatus {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return status;
    },
    () => "ok" as const,
  );
}

const noop = () => () => {};

/** False during server render and hydration, true afterwards. */
export function useHydrated(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}
