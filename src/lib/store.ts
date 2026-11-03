"use client";

import { useMemo, useSyncExternalStore } from "react";
import { createInitialState, hydrateState, inTopic, isCompatibleState, topicLearner, type LearnerState, type TopicLearner } from "@/engine/progress";
import { migrateV1 } from "./migrate";

export const STORAGE_KEY = "kite-maths:v2";
/** Version-1 saves (fractions only). Read once to migrate, then left untouched as a backup. */
export const LEGACY_STORAGE_KEY = "kite-maths:fractions:v1";
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
    if (raw === null) {
      const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy !== null) {
        if (migrateLegacy(legacy)) return;
        // Unreadable old save: it stays where it is as the backup, and we start fresh.
        status = "recovered";
      }
    }
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

/** Migrates version-1 progress into a new version-2 save. Returns false if it couldn't be read. */
function migrateLegacy(raw: string): boolean {
  let migrated: LearnerState | null = null;
  try {
    migrated = migrateV1(JSON.parse(raw));
  } catch {
    migrated = null;
  }
  if (!migrated) return false;
  state = migrated;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    status = "unavailable";
  }
  return true;
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
