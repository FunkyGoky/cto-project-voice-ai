// ============================================================
// ElevenLabs TTS Provider — WebSocket streaming TTS
// Supports two models:
//   - Multilingual v2 ($0.12/1K chars) — best quality
//   - Flash ($0.06/1K chars) — lower latency, half price
// Model is selected based on provider ID passed from the UI.
// ============================================================

import type { TTSProvider, TTSProviderEvents } from "../cascaded-provider";

const ELEVENLABS_WS_BASE = "wss://api.elevenlabs.io/v1/text-to-speech";

/** Model IDs mapped from our TTS provider IDs */
const MODEL_MAP: Record<string, string> = {
  "elevenlabs-v2": "eleven_multilingual_v2",
  "elevenlabs-flash": "eleven_flash_v2_5",
};

export class ElevenLabsTTSProvider implements TTSProvider {
  readonly id: string;
  readonly name: string;

  private ws: WebSocket | null = null;
  private events: TTSProviderEvents | null = null;
  private apiKey: string | null = null;
  private connected = false;
  private modelId: string;

  /**
   * @param variant — "elevenlabs-v2" or "elevenlabs-flash"
   */
  constructor(variant: string = "elevenlabs-v2") {
    this.id = variant;
    this.name = variant === "elevenlabs-flash" ? "ElevenLabs Flash" : "ElevenLabs v2";
    this.modelId = MODEL_MAP[variant] || "eleven_multilingual_v2";
  }

  async connect(events: TTSProviderEvents): Promise<void> {
    this.events = events;

    const res = await fetch("/api/elevenlabs/token", { method: "POST" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to get ElevenLabs credentials");
    }
    const { apiKey } = await res.json();
    this.apiKey = apiKey;
    this.connected = true;
  }

  async synthesize(text: string, voice: string): Promise<void> {
    if (!this.apiKey || !this.events) return;

    const voiceId = voice || "21m00Tcm4TlvDq8ikWAM"; // Default: Rachel
    const wsUrl = `${ELEVENLABS_WS_BASE}/${voiceId}/stream-input?model_id=${this.modelId}&output_format=pcm_24000`;

    return new Promise<void>((resolve) => {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        // Send initial config + text
        this.ws!.send(
          JSON.stringify({
            text: " ",
            xi_api_key: this.apiKey,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.8,
            },
          })
        );

        // Send actual text
        this.ws!.send(JSON.stringify({ text }));

        // Signal end of text
        this.ws!.send(JSON.stringify({ text: "" }));
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.audio) {
            const binary = atob(msg.audio);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              bytes[i] = binary.charCodeAt(i);
            }
            this.events?.onAudio(new Int16Array(bytes.buffer));
          }

          if (msg.isFinal) {
            this.events?.onDone();
            this.ws?.close();
            resolve();
          }
        } catch {
          // Skip malformed messages
        }
      };

      this.ws.onerror = () => {
        this.events?.onError(new Error("ElevenLabs TTS WebSocket error"));
        resolve();
      };

      this.ws.onclose = () => {
        resolve();
      };
    });
  }

  async disconnect(): Promise<void> {
    this.ws?.close();
    this.ws = null;
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }
}
