import { describe, it, expect } from "vitest";
import { arenaReducer, initialState } from "./store";
import type { TranscriptEntry } from "@/types";

describe("initialState", () => {
  it("has all expected keys", () => {
    expect(initialState.activeCategory).toBe("s2s");
    expect(initialState.selectedS2S).toBe("openai-realtime");
    expect(initialState.sessionState).toBe("idle");
    expect(initialState.transcript).toEqual([]);
    expect(initialState.sessions).toEqual([]);
    expect(initialState.temperature).toBe(0.7);
  });
});

describe("arenaReducer", () => {
  it("SET_CATEGORY switches category", () => {
    const state = arenaReducer(initialState, {
      type: "SET_CATEGORY",
      payload: "cascaded",
    });
    expect(state.activeCategory).toBe("cascaded");
  });

  it("SET_S2S updates fighter and auto-sets voice", () => {
    const state = arenaReducer(initialState, {
      type: "SET_S2S",
      payload: "gemini-live",
    });
    expect(state.selectedS2S).toBe("gemini-live");
    expect(state.voice).toBe("Puck"); // first Gemini voice
  });

  it("SET_TEMPERATURE updates temperature", () => {
    const state = arenaReducer(initialState, {
      type: "SET_TEMPERATURE",
      payload: 1.5,
    });
    expect(state.temperature).toBe(1.5);
  });

  it("ADD_TRANSCRIPT appends entry", () => {
    const entry: TranscriptEntry = {
      role: "user",
      text: "hello",
      timestampMs: 100,
    };
    const state = arenaReducer(initialState, {
      type: "ADD_TRANSCRIPT",
      payload: entry,
    });
    expect(state.transcript).toHaveLength(1);
    expect(state.transcript[0]).toEqual(entry);
  });

  it("CLEAR_TRANSCRIPT resets to empty", () => {
    const withEntry = arenaReducer(initialState, {
      type: "ADD_TRANSCRIPT",
      payload: { role: "user", text: "hi", timestampMs: 0 },
    });
    const cleared = arenaReducer(withEntry, { type: "CLEAR_TRANSCRIPT" });
    expect(cleared.transcript).toEqual([]);
  });

  it("TOGGLE_SESSION_SELECTION adds and removes", () => {
    const added = arenaReducer(initialState, {
      type: "TOGGLE_SESSION_SELECTION",
      payload: "session-1",
    });
    expect(added.selectedSessionIds).toContain("session-1");

    const removed = arenaReducer(added, {
      type: "TOGGLE_SESSION_SELECTION",
      payload: "session-1",
    });
    expect(removed.selectedSessionIds).not.toContain("session-1");
  });

  it("returns same state for unknown action", () => {
    // @ts-expect-error — testing unknown action type
    const state = arenaReducer(initialState, { type: "UNKNOWN_ACTION" });
    expect(state).toBe(initialState);
  });
});
