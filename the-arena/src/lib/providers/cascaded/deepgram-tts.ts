// ============================================================
// Deepgram TTS Provider — Aura-2 streaming text-to-speech
// Sends text via REST, receives PCM audio back.
// ============================================================

import type { TTSProvider, TTSProviderEvents } from "../cascaded-provider";

export class DeepgramTTSProvider implements TTSProvider {
  readonly id = "deepgram-aura2";
  readonly name = "Deepgram Aura-2";

  private events: TTSProviderEvents | null = null;
  private apiKey: string | null = null;
  private connected = false;

  async connect(events: TTSProviderEvents): Promise<void> {
    this.events = events;

    const res = await fetch("/api/deepgram/token", { method: "POST" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to get Deepgram credentials");
    }
    const { apiKey } = await res.json();
    this.apiKey = apiKey;
    this.connected = true;
  }

  async synthesize(text: string, voice: string): Promise<void> {
    if (!this.apiKey || !this.events) return;

    const model = voice || "aura-2-en";

    const res = await fetch(
      `https://api.deepgram.com/v1/speak?model=${model}&encoding=linear16&sample_rate=24000`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      }
    );

    if (!res.ok) {
      this.events.onError(new Error(`Deepgram TTS failed: ${res.status}`));
      return;
    }

    // Read audio response as ArrayBuffer
    const audioBuffer = await res.arrayBuffer();
    const pcm16 = new Int16Array(audioBuffer);
    this.events.onAudio(pcm16);
    this.events.onDone();
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.apiKey = null;
  }

  isConnected(): boolean {
    return this.connected;
  }
}
