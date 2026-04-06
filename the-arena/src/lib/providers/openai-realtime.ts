// ============================================================
// OpenAI Realtime Provider (GA API — April 2026)
//
// GA API changes from beta:
// - Model: "gpt-realtime" (not "gpt-4o-realtime-preview")
// - Endpoint: /v1/realtime/client_secrets (not /sessions)
// - session.update requires type: "realtime", model field
// - output_modalities (not modalities)
// - Audio config nested under audio.input / audio.output
// - Server events renamed: response.output_audio.delta, etc.
// - Default VAD: semantic_vad (not server_vad)
// - Temperature removed from session config
// ============================================================

import type {
  VoiceProvider,
  VoiceProviderConfig,
  VoiceProviderEvents,
} from "./voice-provider";
import type { EvalMetrics, OpenAIRealtimeParams } from "@/types";

const GA_MODEL = "gpt-realtime";

export class OpenAIRealtimeProvider implements VoiceProvider {
  readonly id = "openai-realtime";
  readonly name = "OpenAI Realtime";

  private ws: WebSocket | null = null;
  private events: VoiceProviderEvents | null = null;
  private connected = false;

  // Timing metrics
  private firstAudioSentMs: number | null = null;
  private firstAudioReceivedMs: number | null = null;
  private interruptionCount = 0;

  async connect(
    config: VoiceProviderConfig,
    events: VoiceProviderEvents
  ): Promise<void> {
    this.events = events;
    this.resetMetrics();

    const params = config.params as OpenAIRealtimeParams;

    // Step 1: Get ephemeral client secret from our server
    const sessionRes = await fetch("/api/openai/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!sessionRes.ok) {
      const err = await sessionRes.json();
      throw new Error(err.error || "Failed to create session");
    }

    const data = await sessionRes.json();
    const token = data.client_secret?.value || data.value;
    if (!token) {
      throw new Error("No ephemeral token received from OpenAI");
    }

    // Step 2: Connect to GA WebSocket — model in URL query param
    const wsUrl = `wss://api.openai.com/v1/realtime?model=${GA_MODEL}`;

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(wsUrl, [
        "realtime",
        `openai-insecure-api-key.${token}`,
      ]);

      this.ws.onopen = () => {
        // Step 3: Configure session via session.update
        this.ws!.send(
          JSON.stringify({
            type: "session.update",
            session: {
              type: "realtime",
              model: GA_MODEL,
              output_modalities: ["audio"],
              instructions: params.systemPrompt,
              audio: {
                input: {
                  format: { type: "audio/pcm", rate: 24000 },
                  transcription: { model: "gpt-4o-mini-transcribe" },
                  turn_detection:
                    params.turnDetection === "none"
                      ? null
                      : { type: params.turnDetection || "semantic_vad" },
                },
                output: {
                  format: { type: "audio/pcm", rate: 24000 },
                  voice: params.voice || "alloy",
                },
              },
            },
          })
        );

        this.connected = true;
        events.onReady();
        resolve();
      };

      this.ws.onerror = () => {
        reject(new Error("WebSocket connection failed"));
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

    // Base64-encode PCM16 audio, sliced to exact view bounds
    const bytes = new Uint8Array(
      audio.buffer.slice(audio.byteOffset, audio.byteOffset + audio.byteLength)
    );
    const base64 = btoa(String.fromCharCode(...bytes));

    this.ws.send(
      JSON.stringify({
        type: "input_audio_buffer.append",
        audio: base64,
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

  // ----------------------------------------------------------
  // Private
  // ----------------------------------------------------------

  private resetMetrics() {
    this.firstAudioSentMs = null;
    this.firstAudioReceivedMs = null;
    this.interruptionCount = 0;
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
      // GA audio output event (renamed from response.audio.delta)
      case "response.output_audio.delta":
      case "response.audio.delta": {
        if (this.firstAudioReceivedMs === null) {
          this.firstAudioReceivedMs = performance.now();
        }
        const b64 = msg.delta as string;
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

      // GA transcript event — arrives word-by-word, so mark as delta to append
      case "response.output_audio_transcript.delta":
      case "response.audio_transcript.delta": {
        if (this.events && msg.delta) {
          this.events.onTranscript({
            role: "agent",
            text: msg.delta as string,
            timestampMs: performance.now(),
            isDelta: true,
          });
        }
        break;
      }

      // User speech transcribed
      case "conversation.item.input_audio_transcription.completed": {
        if (this.events && msg.transcript) {
          this.events.onTranscript({
            role: "user",
            text: msg.transcript as string,
            timestampMs: performance.now(),
          });
        }
        break;
      }

      // User started speaking — interruption
      case "input_audio_buffer.speech_started": {
        this.interruptionCount++;
        this.events?.onInterruption();
        break;
      }

      // Error
      case "error": {
        const error = msg.error as { message?: string } | undefined;
        this.events?.onError(
          new Error(error?.message || "OpenAI Realtime error")
        );
        break;
      }
    }
  }
}
