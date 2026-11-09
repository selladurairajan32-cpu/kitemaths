"use client";

import { useMemo, useSyncExternalStore } from "react";
import { createInitialState, inTopic, topicLearner, type LearnerState, type TopicLearner } from "@/engine/progress";
import { loadState, saveState, STORAGE_KEY, type StorageLike, type StorageStatus } from "./persist";

export { LEGACY_STORAGE_KEY, STORAGE_KEY, type StorageStatus } from "./persist";
const SERVER_STATE = createInitialState();

let state: LearnerState = SERVER_STATE;
let status: StorageStatus = "ok";
let loaded = false;
const listeners = new Set<() => void>();

function browserStorage(): StorageLike | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  ({ state, status } = loadState(browserStorage(), Date.now()));
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
  if (saveState(browserStorage(), state) === "unavailable") status = "unavailable";
  emit();
}

/** Applies a change to one topic's progress (results are shared across topics). */
export function updateTopic(topicId: string, fn: (t: TopicLearner) => TopicLearner) {
  updateLearner((s) => inTopic(s, topicId, fn));
}

/** One topic's progress plus every result, kept stable between renders. */
export function useTopicLearner(topicId: string): TopicLearner {
  const state = useLearner();
  return useMemo(() => topicLearner(state, topicId), [state, topicId]);
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

let clientNow: number | null = null;
const readNow = () => (clientNow ??= Date.now());

/**
 * The current time, read once in the browser (0 while prerendering), so
 * day-based things like streaks never touch the clock on the server.
 */
export function useNow(): number {
  return useSyncExternalStore(noop, readNow, () => 0);
}
