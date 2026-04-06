// ============================================================
// VoiceProvider — Common interface for all S2S fighters
// Each S2S fighter (OpenAI Realtime, Gemini Live, Hume EVI3)
// implements this interface to enable uniform UI + eval treatment.
// ============================================================

import type { TranscriptEntry, EvalMetrics, ProviderParams } from "@/types";

/** Events emitted by a VoiceProvider during a session */
export interface VoiceProviderEvents {
  /** Provider is connected and ready to receive audio */
  onReady: () => void;
  /** Agent produced audio data (PCM Int16, 24kHz mono) */
  onAudio: (audio: Int16Array) => void;
  /** New transcript entry (user or agent) */
  onTranscript: (entry: TranscriptEntry) => void;
  /** Agent interrupted by user */
  onInterruption: () => void;
  /** Session ended (from provider side) */
  onDisconnect: (reason?: string) => void;
  /** Error occurred */
  onError: (error: Error) => void;
}

/** Configuration passed to connect() */
export interface VoiceProviderConfig {
  params: ProviderParams;
  /** Audio sample rate from client mic */
  sampleRate: number;
}

/**
 * Abstract interface for S2S voice providers.
 * Handles the full loop: audio in -> reasoning -> audio out.
 */
export interface VoiceProvider {
  /** Provider identifier */
  readonly id: string;
  /** Human-readable name */
  readonly name: string;

  /** Establish WebSocket connection to the provider */
  connect(config: VoiceProviderConfig, events: VoiceProviderEvents): Promise<void>;

  /** Stream audio data to the provider (PCM Int16) */
  sendAudio(audio: Int16Array): void;

  /** Gracefully end the session */
  disconnect(): Promise<void>;

  /** Whether the provider is currently connected */
  isConnected(): boolean;

  /**
   * Get timing metrics collected during the session.
   * Called after disconnect to feed the eval pipeline.
   */
  getMetrics(): Pick<EvalMetrics, "ttfaMs" | "interruptionCount">;
}
