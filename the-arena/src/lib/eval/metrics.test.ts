import { describe, it, expect } from "vitest";
import {
  calculateWER,
  analyzeTurnTaking,
  calculateCost,
  evaluateSession,
} from "./metrics";
import type { TranscriptEntry } from "@/types";

// ─── WER ───────────────────────────────────────────────────

describe("calculateWER", () => {
  it("returns 0 for identical strings", () => {
    expect(calculateWER("hello world", "hello world")).toBe(0);
  });

  it("returns 1 for completely different strings", () => {
    expect(calculateWER("foo bar", "baz qux quux corge")).toBe(1);
  });

  it("returns fractional WER for partial overlap", () => {
    // ref: "the cat sat on the mat" (6 words)
    // hyp: "the cat sat on a mat"  — 1 substitution → WER = 1/6
    const wer = calculateWER(
      "the cat sat on a mat",
      "the cat sat on the mat"
    );
    expect(wer).toBeCloseTo(1 / 6, 5);
  });

  it("returns null for empty reference", () => {
    expect(calculateWER("anything", "")).toBeNull();
    expect(calculateWER("anything", "   ")).toBeNull();
  });

  it("ignores punctuation and case", () => {
    expect(calculateWER("Hello, World!", "hello world")).toBe(0);
  });
});

// ─── Turn-Taking ───────────────────────────────────────────

describe("analyzeTurnTaking", () => {
  it("returns 0 dead air gaps for back-to-back turns", () => {
    const transcript: TranscriptEntry[] = [
      { role: "user", text: "hi", timestampMs: 0 },
      { role: "agent", text: "hello", timestampMs: 200 },
      { role: "user", text: "how are you", timestampMs: 400 },
    ];
    expect(analyzeTurnTaking(transcript).deadAirGaps).toBe(0);
  });

  it("counts gaps > 500ms between different speakers", () => {
    const transcript: TranscriptEntry[] = [
      { role: "user", text: "hi", timestampMs: 0 },
      { role: "agent", text: "hello", timestampMs: 800 }, // 800ms gap
      { role: "user", text: "ok", timestampMs: 1500 },    // 700ms gap
    ];
    expect(analyzeTurnTaking(transcript).deadAirGaps).toBe(2);
  });

  it("ignores gaps between same speaker", () => {
    const transcript: TranscriptEntry[] = [
      { role: "agent", text: "let me", timestampMs: 0 },
      { role: "agent", text: "think about that", timestampMs: 1000 }, // same speaker
    ];
    expect(analyzeTurnTaking(transcript).deadAirGaps).toBe(0);
  });

  it("returns 0 for empty or single-entry transcript", () => {
    expect(analyzeTurnTaking([]).deadAirGaps).toBe(0);
    expect(
      analyzeTurnTaking([{ role: "user", text: "hi", timestampMs: 0 }])
        .deadAirGaps
    ).toBe(0);
  });
});

// ─── Cost ──────────────────────────────────────────────────

describe("calculateCost", () => {
  it("calculates S2S cost using fighter registry", () => {
    // OpenAI Realtime: $0.30/min, 60s = 1 min
    expect(calculateCost(60000, "s2s", "openai-realtime")).toBeCloseTo(0.3, 5);
  });

  it("calculates cascaded cost as STT + TTS", () => {
    // Deepgram Nova-3 STT: $0.0077/min, Deepgram Aura-2 TTS: $0/min (null → 0)
    // 2 minutes
    const cost = calculateCost(
      120000,
      "cascaded",
      "deepgram-nova3+openai-gpt5+deepgram-aura2"
    );
    // STT: 2 * 0.0077 = 0.0154, TTS: 2 * 0 = 0
    expect(cost).toBeCloseTo(0.0154, 4);
  });

  it("returns 0 for unknown fighter", () => {
    expect(calculateCost(60000, "s2s", "nonexistent-fighter")).toBe(0);
  });
});

// ─── evaluateSession (full pipeline) ───────────────────────

describe("evaluateSession", () => {
  it("composes all metrics into EvalMetrics", () => {
    const transcript: TranscriptEntry[] = [
      { role: "user", text: "hello", timestampMs: 0 },
      { role: "agent", text: "hi there", timestampMs: 300 },
      { role: "user", text: "bye", timestampMs: 1200 },
      { role: "agent", text: "goodbye", timestampMs: 2000 },
    ];

    const result = evaluateSession({
      transcript,
      referenceText: "hi there goodbye",
      durationMs: 60000,
      category: "s2s",
      fighterIds: "openai-realtime",
      providerMetrics: { ttfaMs: 275, interruptionCount: 1 },
    });

    expect(result.ttfaMs).toBe(275);
    expect(result.interruptionCount).toBe(1);
    expect(result.deadAirGaps).toBeGreaterThanOrEqual(0);
    expect(result.wer).toBeDefined();
    expect(result.wer).not.toBeNull();
    expect(result.costUsd).toBeCloseTo(0.3, 2);
    expect(result.emotionalAlignment).toBeNull();
    expect(result.toolCallSuccessRate).toBeNull();
    expect(result.naturalnessRating).toBeNull();
  });

  it("returns null WER when no reference text", () => {
    const result = evaluateSession({
      transcript: [{ role: "agent", text: "hello", timestampMs: 0 }],
      referenceText: null,
      durationMs: 10000,
      category: "s2s",
      fighterIds: "openai-realtime",
      providerMetrics: { ttfaMs: null, interruptionCount: 0 },
    });

    expect(result.wer).toBeNull();
  });
});
