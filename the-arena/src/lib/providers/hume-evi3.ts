// ============================================================
// Hume EVI 3 Provider
// Connects to Hume's EVI WebSocket API for emotion-aware voice.
// Unique features: 48+ emotion states detected per utterance,
// 200K+ voice designs, BYO-LLM toggle.
// ============================================================

import type {
  VoiceProvider,
  VoiceProviderConfig,
  VoiceProviderEvents,
} from "./voice-provider";
import type { EvalMetrics, HumeEVI3Params } from "@/types";

const HUME_EVI_WS = "wss://api.hume.ai/v0/evi/chat";

/** Emotion scores returned by Hume for each utterance */
export interface EmotionScore {
  name: string;
  score: number;
}

export class HumeEVI3Provider implements VoiceProvider {
  readonly id = "hume-evi3";
  readonly name = "Hume EVI 3";

  private ws: WebSocket | null = null;
  private events: VoiceProviderEvents | null = null;
  private connected = false;

  // Timing metrics
  private firstAudioSentMs: number | null = null;
  private firstAudioReceivedMs: number | null = null;
  private interruptionCount = 0;

  // Emotion tracking — exposed for eval
  public lastEmotionScores: EmotionScore[] = [];
  public allEmotionScores: EmotionScore[][] = [];

  async connect(
    config: VoiceProviderConfig,
    events: VoiceProviderEvents
  ): Promise<void> {
    this.events = events;
    this.resetMetrics();

    const params = config.params as HumeEVI3Params;

    // Get access token from server
    const res = await fetch("/api/hume/token", { method: "POST" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to get Hume credentials");
    }
    const { accessToken } = await res.json();

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`${HUME_EVI_WS}?access_token=${accessToken}`);

      this.ws.onopen = () => {
        // Send session settings after connection opens
        const settings: Record<string, unknown> = {
          type: "session_settings",
          system_prompt: params.systemPrompt,
        };

        // Only set voice if not the default
        if (params.voice && params.voice !== "ITO") {
          settings.voice = { name: params.voice };
        }

        // Only set language_model if NOT using BYO-LLM
        if (!params.byoLlm) {
          settings.language_model = {
            model_provider: "OPEN_AI",
            model_resource: "gpt-4o",
          };
        }

        this.ws!.send(JSON.stringify(settings));
        this.connected = true;
        events.onReady();
        resolve();
      };

      this.ws.onerror = () => {
        reject(new Error("Hume WebSocket connection failed"));
      };

      this.ws.onclose = (e) => {
        this.connected = false;
        events.onDisconnect(e.reason || "Connection closed");
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };
    });
  }

  sendAudio(audio: Int16Array): void {
    if (!this.ws || !this.connected) return;

    if (this.firstAudioSentMs === null) {
      this.firstAudioSentMs = performance.now();
    }

    // Hume expects base64 PCM audio
    const bytes = new Uint8Array(audio.buffer);
    const base64 = btoa(String.fromCharCode(...bytes));

    this.ws.send(
      JSON.stringify({
        type: "audio_input",
        data: base64,
      })
    );
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
    }
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  getMetrics(): Pick<EvalMetrics, "ttfaMs" | "interruptionCount"> {
    let ttfaMs: number | null = null;
    if (this.firstAudioSentMs && this.firstAudioReceivedMs) {
      ttfaMs = this.firstAudioReceivedMs - this.firstAudioSentMs;
    }
    return { ttfaMs, interruptionCount: this.interruptionCount };
  }

  /** Get emotional alignment score (avg top-emotion confidence) */
  getEmotionalAlignment(): number | null {
    if (this.allEmotionScores.length === 0) return null;
    const topScores = this.allEmotionScores.map((scores) => {
      const sorted = [...scores].sort((a, b) => b.score - a.score);
      return sorted[0]?.score ?? 0;
    });
    return topScores.reduce((a, b) => a + b, 0) / topScores.length;
  }

  // ----------------------------------------------------------
  // Private
  // ----------------------------------------------------------

  private resetMetrics() {
    this.firstAudioSentMs = null;
    this.firstAudioReceivedMs = null;
    this.interruptionCount = 0;
    this.lastEmotionScores = [];
    this.allEmotionScores = [];
  }

  private handleMessage(raw: string) {
    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    const type = msg.type as string;

    switch (type) {
      case "audio_output": {
        if (this.firstAudioReceivedMs === null) {
          this.firstAudioReceivedMs = performance.now();
        }
        const b64 = msg.data as string;
        if (b64 && this.events) {
          const binary = atob(b64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          this.events.onAudio(new Int16Array(bytes.buffer));
        }
        break;
      }

      case "assistant_message": {
        const content = msg.message as Record<string, unknown>;
        if (content?.content && this.events) {
          this.events.onTranscript({
            role: "agent",
            text: content.content as string,
            timestampMs: performance.now(),
          });
        }
        // Extract emotion scores from models output
        const models = msg.models as Record<string, unknown>;
        if (models?.prosody) {
          const prosody = models.prosody as Record<string, unknown>;
          const scores = prosody.scores as Record<string, number>;
          if (scores) {
            const emotionScores: EmotionScore[] = Object.entries(scores).map(
              ([name, score]) => ({ name, score })
            );
            this.lastEmotionScores = emotionScores;
            this.allEmotionScores.push(emotionScores);
          }
        }
        break;
      }

      case "user_message": {
        const content = msg.message as Record<string, unknown>;
        if (content?.content && this.events) {
          this.events.onTranscript({
            role: "user",
            text: content.content as string,
            timestampMs: performance.now(),
          });
        }
        break;
      }

      case "user_interruption": {
        this.interruptionCount++;
        this.events?.onInterruption();
        break;
      }

      case "error": {
        const error = msg.message as string;
        this.events?.onError(new Error(error || "Hume EVI error"));
        break;
      }
    }
  }
}
