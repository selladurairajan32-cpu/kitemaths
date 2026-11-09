import { describe, expect, it } from "vitest";
import { completeLesson, createInitialState, inTopic, recordResult, STATE_VERSION, type LearnerState } from "@/engine/progress";
import { LEGACY_STORAGE_KEY, loadState, saveState, STORAGE_KEY, type StorageLike } from "./persist";

/** ARCH-004 (persistence) and MAST-005 (refresh and recovery). An in-memory stand-in for `window.localStorage`. */
class MemoryStorage implements StorageLike {
  readonly items = new Map<string, string>();
  failWrites = false;
  failReads = false;
  getItem(key: string) {
    if (this.failReads) throw new Error("SecurityError");
    return this.items.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    if (this.failWrites) throw new Error("QuotaExceededError");
    this.items.set(key, value);
  }
}

function someProgress(): LearnerState {
  let s = inTopic(createInitialState(), "fractions", (t) => completeLesson(t, "wholes", 10));
  s = inTopic(s, "fractions", (t) =>
    recordResult(t, { questionId: "fractions.ls-wholes-1", skill: "fractions.equal-parts", context: "lesson", correct: true, firstTry: true, attempts: 1, hintsUsed: 0, misconceptions: [], at: 11 }),
  );
  return { ...s, profile: { ...s.profile, name: "Sam" }, settings: { ...s.settings, sound: false } };
}

describe("progress persistence (ARCH-004)", () => {
  it("survives a refresh or restart: what is saved loads back the same", () => {
    const storage = new MemoryStorage();
    const before = someProgress();
    expect(saveState(storage, before)).toBe("ok");
    // A restart is a fresh read of the same storage.
    const after = loadState(storage, 1000);
    expect(after.status).toBe("ok");
    expect(after.state).toEqual(before);
  });

  it("starts fresh, without an error, when nothing is saved", () => {
    const after = loadState(new MemoryStorage(), 1000);
    expect(after).toEqual({ state: createInitialState(), status: "ok" });
  });

  it("is versioned: an incompatible version is backed up and the learner starts fresh", () => {
    const storage = new MemoryStorage();
    const old = JSON.stringify({ ...someProgress(), version: STATE_VERSION + 1 });
    storage.items.set(STORAGE_KEY, old);
    const after = loadState(storage, 1234);
    expect(after).toEqual({ state: createInitialState(), status: "recovered" });
    expect(storage.items.get(`${STORAGE_KEY}:backup:1234`)).toBe(old);
  });

  it("fails gracefully on corrupt data, keeping a backup", () => {
    const storage = new MemoryStorage();
    storage.items.set(STORAGE_KEY, "{not json");
    const after = loadState(storage, 77);
    expect(after.status).toBe("recovered");
    expect(after.state).toEqual(createInitialState());
    expect(storage.items.get(`${STORAGE_KEY}:backup:77`)).toBe("{not json");
  });

  it("keeps working when storage is blocked or full", () => {
    const blocked = new MemoryStorage();
    blocked.failReads = true;
    expect(loadState(blocked, 1)).toEqual({ state: createInitialState(), status: "unavailable" });
    expect(loadState(null, 1).status).toBe("unavailable");
    const full = new MemoryStorage();
    full.failWrites = true;
    expect(saveState(full, someProgress())).toBe("unavailable");
  });

  it("migrates a version-1 save once and leaves the original as a backup", () => {
    const storage = new MemoryStorage();
    const v1 = JSON.stringify({ version: 1, lessons: { wholes: { step: 3, furthestStep: 3, completed: true } }, results: [] });
    storage.items.set(LEGACY_STORAGE_KEY, v1);
    const after = loadState(storage, 5);
    expect(after.status).toBe("ok");
    expect(after.state.topics.fractions?.lessons.wholes?.completed).toBe(true);
    expect(storage.items.get(LEGACY_STORAGE_KEY)).toBe(v1);
    expect(JSON.parse(storage.items.get(STORAGE_KEY)!).version).toBe(STATE_VERSION);
  });

  it("keeps an unreadable version-1 save untouched and starts fresh", () => {
    const storage = new MemoryStorage();
    storage.items.set(LEGACY_STORAGE_KEY, "garbage");
    expect(loadState(storage, 5)).toEqual({ state: createInitialState(), status: "recovered" });
    expect(storage.items.get(LEGACY_STORAGE_KEY)).toBe("garbage");
    expect(storage.items.has(STORAGE_KEY)).toBe(false);
  });

  it("collects no personal data beyond an optional first name, year and avatar", () => {
    const saved = JSON.parse(JSON.stringify(createInitialState())) as Record<string, unknown>;
    expect(Object.keys(saved).sort()).toEqual(["currentTopicId", "profile", "results", "settings", "topics", "version"]);
    expect(Object.keys(saved.profile as object).sort()).toEqual(["avatar", "name", "year"]);
    expect((saved.profile as { name: string }).name).toBe("");
  });
});
