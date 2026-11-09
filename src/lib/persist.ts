import { createInitialState, hydrateState, isCompatibleState, type LearnerState } from "@/engine/progress";
import { migrateV1 } from "./migrate";

/**
 * ARCH-004: reading and writing the saved learner state, separated from the browser so it can be tested with any
 * storage. `store.ts` passes `window.localStorage`.
 *
 * The saved state is versioned (`version`, `STATE_VERSION` in `engine/progress.ts`) and holds no personal data beyond an
 * optional first name the child or grown-up types in; there is no account, e-mail or tracking id.
 */

export const STORAGE_KEY = "kite-maths:v2";
/** Version-1 saves (fractions only). Read once to migrate, then left untouched as a backup. */
export const LEGACY_STORAGE_KEY = "kite-maths:fractions:v1";

export type StorageStatus = "ok" | "unavailable" | "recovered";

/** The parts of the Web Storage API this uses. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface Loaded {
  state: LearnerState;
  status: StorageStatus;
}

/**
 * Loads progress. Missing data starts fresh; unreadable or incompatible data is kept as a timestamped backup and the
 * learner starts fresh with status "recovered"; storage that throws gives status "unavailable". It never throws.
 */
export function loadState(storage: StorageLike | null, now: number): Loaded {
  if (!storage) return { state: createInitialState(), status: "unavailable" };
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
    if (raw === null) {
      const legacy = storage.getItem(LEGACY_STORAGE_KEY);
      if (legacy !== null) return migrateLegacy(storage, legacy);
    }
  } catch {
    return { state: createInitialState(), status: "unavailable" };
  }
  if (raw === null) return { state: createInitialState(), status: "ok" };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isCompatibleState(parsed)) throw new Error("incompatible");
    return { state: hydrateState(parsed), status: "ok" };
  } catch {
    try {
      storage.setItem(`${STORAGE_KEY}:backup:${now}`, raw);
    } catch {
      // Nothing more can be done: the learner still starts fresh.
    }
    return { state: createInitialState(), status: "recovered" };
  }
}

function migrateLegacy(storage: StorageLike, raw: string): Loaded {
  let migrated: LearnerState | null = null;
  try {
    migrated = migrateV1(JSON.parse(raw));
  } catch {
    migrated = null;
  }
  // An unreadable old save stays where it is as the backup, and the learner starts fresh.
  if (!migrated) return { state: createInitialState(), status: "recovered" };
  return { state: migrated, status: saveState(storage, migrated) };
}

/** Saves progress. Returns "unavailable" if storage refuses (full, or blocked). */
export function saveState(storage: StorageLike | null, state: LearnerState): StorageStatus {
  if (!storage) return "unavailable";
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return "ok";
  } catch {
    return "unavailable";
  }
}
