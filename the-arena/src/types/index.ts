// ============================================================
// The Arena — Core Type System
// All shared types for sessions, providers, eval, and fighters
// ============================================================

// ------------------------------------------------------------
// Fighter & Provider Categories
// ------------------------------------------------------------

/** The two architectural categories we benchmark */
export type FighterCategory = "s2s" | "cascaded";

/** Unique identifier for each S2S fighter */
export type S2SFighterId = "openai-realtime" | "gemini-live" | "hume-evi3";

/** Unique identifier for each cascaded component */
export type STTProviderId = "deepgram-nova3" | "elevenlabs-scribe";
export type TTSProviderId = "deepgram-aura2" | "elevenlabs-v2" | "elevenlabs-flash";
export type LLMProviderId = "openai-gpt5" | "openai-gpt4o" | "anthropic-sonnet" | "gemini-flash" | "custom";

/** Combined fighter identifier — either a single S2S or a composed cascaded triple */
export type FighterId = S2SFighterId | `${STTProviderId}+${LLMProviderId}+${TTSProviderId}`;

// ------------------------------------------------------------
// Fighter Metadata (static info shown in fight card)
// ------------------------------------------------------------

export interface FighterMeta {
  id: S2SFighterId | STTProviderId | TTSProviderId | LLMProviderId;
  name: string;
  category: FighterCategory;
  /** Component role within cascaded pipeline */
  role?: "stt" | "tts" | "llm";
  /** Typical time-to-first-audio in ms */
  ttfaMs: number | null;
  /** Cost per minute in USD (null if varies) */
  costPerMin: number | null;
  /** Brief description of key strengths */
  strengths: string[];
  /** Whether the provider is configured (API key present) */
  configured: boolean;
}

// ------------------------------------------------------------
// Provider Parameters
// ------------------------------------------------------------

/** Common params shared across all providers */
export interface CommonParams {
  systemPrompt: string;
  temperature: number;
  voice: string;
  language: string;
}

/** OpenAI Realtime-specific params */
export interface OpenAIRealtimeParams extends CommonParams {
  turnDetection: "semantic_vad" | "server_vad" | "none";
  modalities: ("text" | "audio")[];
}

/** Gemini Live-specific params */
export interface GeminiLiveParams extends CommonParams {
  thinkingBudget: number;
  /** Model ID override (default: gemini-2.5-flash-live-001) */
  model?: string;
  /** VAD sensitivity: HIGH or LOW (default: HIGH) */
  vadSensitivity?: "HIGH" | "LOW";
}

/** Hume EVI 3-specific params */
export interface HumeEVI3Params extends CommonParams {
  emotionThreshold: number;
  byoLlm: boolean;
}

/** Cascaded pipeline params */
export interface CascadedParams extends CommonParams {
  sttProvider: STTProviderId;
  sttModel: string;
  llmProvider: LLMProviderId;
  llmModel: string;
  ttsProvider: TTSProviderId;
  ttsModel: string;
  ttsVoice: string;
  /** Custom OpenAI-compatible endpoint URL */
  customLlmEndpoint?: string;
}

/** Union of all provider param types */
export type ProviderParams =
  | OpenAIRealtimeParams
  | GeminiLiveParams
  | HumeEVI3Params
  | CascadedParams;

// ------------------------------------------------------------
// Transcript
// ------------------------------------------------------------

export interface TranscriptEntry {
  /** "user" or "agent" */
  role: "user" | "agent";
  /** Transcribed text */
  text: string;
  /** Timestamp relative to session start (ms) */
  timestampMs: number;
  /** Whether this was an interruption */
  isInterruption?: boolean;
  /** If true, this text should be appended to the previous entry of the same role */
  isDelta?: boolean;
}

// ------------------------------------------------------------
// Eval Metrics
// ------------------------------------------------------------

export interface EvalMetrics {
  /** Time to first audio (ms) — from first user audio sent to first agent audio received */
  ttfaMs: number | null;
  /** Turn-taking: number of interruptions detected */
  interruptionCount: number;
  /** Turn-taking: number of dead air gaps > 500ms */
  deadAirGaps: number;
  /** Word Error Rate (0–1) — STT vs reference transcript */
  wer: number | null;
  /** Emotion alignment (Hume only) — detected vs expected */
  emotionalAlignment: number | null;
  /** Tool call success rate (0–1) — if tools configured */
  toolCallSuccessRate: number | null;
  /** Total session cost in USD */
  costUsd: number;
  /** Manual naturalness rating (1–5) */
  naturalnessRating: number | null;
}

// ------------------------------------------------------------
// Test Session
// ------------------------------------------------------------

export interface Session {
  id: string;
  timestamp: string;
  category: FighterCategory;
  /** e.g. "openai-realtime" or "deepgram-nova3+openai-gpt5+elevenlabs" */
  fighterIds: string;
  /** Hash of the prompt used (for grouping comparisons) */
  promptHash: string;
  /** Full system prompt text */
  prompt: string;
  /** Provider params as JSON */
  params: ProviderParams;
  /** Full transcript */
  transcript: TranscriptEntry[];
  /** Eval metrics */
  metrics: EvalMetrics;
  /** Reference text for WER / hallucination scoring */
  referenceText: string | null;
  /** User notes */
  notes: string;
  /** Session duration in ms */
  durationMs: number;
}

// ------------------------------------------------------------
// Prompt Template
// ------------------------------------------------------------

export interface PromptTemplate {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

// ------------------------------------------------------------
// UI State
// ------------------------------------------------------------

/** Which input mode is active in the test console */
export type InputMode = "browser-mic" | "twilio-phone";

/** Current session state */
export type SessionState = "idle" | "connecting" | "active" | "ending" | "evaluating";
