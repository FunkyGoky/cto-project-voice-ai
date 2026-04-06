// ============================================================
// CascadedProvider — Composes STT + LLM + TTS into a pipeline
// This mirrors enterprise voice AI (e.g. Zendesk: PolyAI + GPT-5).
// Audio flows: Mic -> STT -> LLM -> TTS -> Speaker
// ============================================================

import type { TranscriptEntry, EvalMetrics } from "@/types";

// ------------------------------------------------------------
// STT Provider Interface
// ------------------------------------------------------------

export interface STTProviderEvents {
  /** Partial (interim) transcript */
  onPartialTranscript: (text: string) => void;
  /** Final transcript for a user turn */
  onFinalTranscript: (text: string) => void;
  /** Speech started detected */
  onSpeechStart: () => void;
  /** Speech ended detected */
  onSpeechEnd: () => void;
  onError: (error: Error) => void;
}

export interface STTProvider {
  readonly id: string;
  readonly name: string;
  connect(sampleRate: number, events: STTProviderEvents): Promise<void>;
  sendAudio(audio: Int16Array): void;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}

// ------------------------------------------------------------
// LLM Provider Interface
// ------------------------------------------------------------

export interface LLMProvider {
  readonly id: string;
  readonly name: string;
  /**
   * Stream a chat completion. Yields text chunks as they arrive.
   * Uses OpenAI-compatible chat completions format.
   */
  streamCompletion(
    systemPrompt: string,
    messages: { role: "user" | "assistant"; content: string }[],
    options: { temperature: number; model: string }
  ): AsyncGenerator<string, void, unknown>;
}

// ------------------------------------------------------------
// TTS Provider Interface
// ------------------------------------------------------------

export interface TTSProviderEvents {
  /** Audio chunk ready for playback (PCM Int16, 24kHz mono) */
  onAudio: (audio: Int16Array) => void;
  /** TTS finished producing audio for this utterance */
  onDone: () => void;
  onError: (error: Error) => void;
}

export interface TTSProvider {
  readonly id: string;
  readonly name: string;
  connect(events: TTSProviderEvents): Promise<void>;
  /** Send text to synthesize. Streams audio via onAudio events. */
  synthesize(text: string, voice: string): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}

// ------------------------------------------------------------
// Composed Cascaded Provider
// ------------------------------------------------------------

/**
 * Orchestrates the STT -> LLM -> TTS pipeline.
 * Manages turn detection and coordinates the three components.
 */
export interface CascadedPipelineEvents {
  onReady: () => void;
  onAudio: (audio: Int16Array) => void;
  onTranscript: (entry: TranscriptEntry) => void;
  onInterruption: () => void;
  onDisconnect: (reason?: string) => void;
  onError: (error: Error) => void;
}

export interface CascadedPipelineConfig {
  systemPrompt: string;
  temperature: number;
  voice: string;
  sampleRate: number;
  sttProvider: STTProvider;
  llmProvider: LLMProvider;
  ttsProvider: TTSProvider;
}

export interface CascadedPipeline {
  connect(
    config: CascadedPipelineConfig,
    events: CascadedPipelineEvents
  ): Promise<void>;
  sendAudio(audio: Int16Array): void;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  getMetrics(): Pick<EvalMetrics, "ttfaMs" | "interruptionCount">;
}
