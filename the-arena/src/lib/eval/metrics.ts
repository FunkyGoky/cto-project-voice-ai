// ============================================================
// Eval Metrics — Post-session evaluation pipeline
// Calculates: TTFA, turn-taking score, WER, cost, and more.
// Runs async after every test session.
// ============================================================

import type { TranscriptEntry, EvalMetrics, FighterCategory } from "@/types";
import { S2S_FIGHTERS, STT_PROVIDERS, TTS_PROVIDERS } from "@/lib/providers";

// ------------------------------------------------------------
// Word Error Rate (WER) — Levenshtein-based
// Compares STT transcript against a reference transcript.
// Returns 0-1 (0 = perfect, 1 = completely wrong).
// ------------------------------------------------------------

function normalizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

export function calculateWER(
  hypothesis: string,
  reference: string
): number | null {
  if (!reference.trim()) return null;

  const hyp = normalizeText(hypothesis);
  const ref = normalizeText(reference);

  if (ref.length === 0) return null;

  // Levenshtein distance on word level
  const m = ref.length;
  const n = hyp.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (ref[i - 1] === hyp[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return Math.min(1, dp[m][n] / m);
}

// ------------------------------------------------------------
// Turn-Taking Analysis
// Counts dead air gaps > 500ms between turns.
// ------------------------------------------------------------

const DEAD_AIR_THRESHOLD_MS = 500;

export function analyzeTurnTaking(transcript: TranscriptEntry[]): {
  deadAirGaps: number;
} {
  let deadAirGaps = 0;

  for (let i = 1; i < transcript.length; i++) {
    const gap = transcript[i].timestampMs - transcript[i - 1].timestampMs;
    // Only count gaps between different speakers
    if (transcript[i].role !== transcript[i - 1].role && gap > DEAD_AIR_THRESHOLD_MS) {
      deadAirGaps++;
    }
  }

  return { deadAirGaps };
}

// ------------------------------------------------------------
// Cost Calculation
// ------------------------------------------------------------

export function calculateCost(
  durationMs: number,
  category: FighterCategory,
  fighterIds: string
): number {
  const minutes = durationMs / 60000;

  if (category === "s2s") {
    const fighter = S2S_FIGHTERS.find((f) => f.id === fighterIds);
    return minutes * (fighter?.costPerMin ?? 0);
  }

  // Cascaded: extract component IDs and sum costs
  const parts = fighterIds.split("+");
  const sttId = parts[0];
  const ttsId = parts[2];

  const sttCost = STT_PROVIDERS.find((p) => p.id === sttId)?.costPerMin ?? 0;
  const ttsCost = TTS_PROVIDERS.find((p) => p.id === ttsId)?.costPerMin ?? 0;

  // LLM cost is token-based and hard to estimate per-minute; exclude from live calc
  return minutes * (sttCost + ttsCost);
}

// ------------------------------------------------------------
// Full Eval Pipeline
// Composes all metrics into a single EvalMetrics object.
// ------------------------------------------------------------

export function evaluateSession(params: {
  transcript: TranscriptEntry[];
  referenceText: string | null;
  durationMs: number;
  category: FighterCategory;
  fighterIds: string;
  /** TTFA and interruption count from the provider */
  providerMetrics: Pick<EvalMetrics, "ttfaMs" | "interruptionCount">;
}): EvalMetrics {
  const { transcript, referenceText, durationMs, category, fighterIds, providerMetrics } = params;

  // Combine agent transcript for WER comparison
  const agentText = transcript
    .filter((t) => t.role === "agent")
    .map((t) => t.text)
    .join(" ");

  const wer = referenceText ? calculateWER(agentText, referenceText) : null;
  const { deadAirGaps } = analyzeTurnTaking(transcript);
  const costUsd = calculateCost(durationMs, category, fighterIds);

  return {
    ttfaMs: providerMetrics.ttfaMs,
    interruptionCount: providerMetrics.interruptionCount,
    deadAirGaps,
    wer,
    emotionalAlignment: null, // Hume only — Step 10
    toolCallSuccessRate: null, // When tools are configured
    costUsd,
    naturalnessRating: null, // Set manually by user post-session
  };
}
