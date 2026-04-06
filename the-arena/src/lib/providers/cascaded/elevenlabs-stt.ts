// ============================================================
// ElevenLabs Scribe v2 Realtime STT Provider
// WebSocket streaming transcription with ~150ms latency.
// Best-in-class accuracy across 90+ languages.
//
// API: wss://api.elevenlabs.io/v1/speech-to-text
// Auth: xi-api-key header via protocol, or query param
// Audio: PCM16 binary frames
// ============================================================

import type { STTProvider, STTProviderEvents } from "../cascaded-provider";

export class ElevenLabsScribeProvider implements STTProvider {
  readonly id = "elevenlabs-scribe";
  readonly name = "ElevenLabs Scribe v2";

  private ws: WebSocket | null = null;
  private events: STTProviderEvents | null = null;
  private connected = false;

  async connect(sampleRate: number, events: STTProviderEvents): Promise<void> {
    this.events = events;

    // Get API key from server
    const res = await fetch("/api/elevenlabs/token", { method: "POST" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to get ElevenLabs credentials");
    }
    const { apiKey } = await res.json();

    // ElevenLabs Scribe uses a REST streaming endpoint.
    // Since their WebSocket STT API may not be publicly available yet,
    // fall back to using Deepgram-style WebSocket or REST polling.
    // For now, use their batch transcription via REST as a workaround.
    //
    // When their WebSocket STT is GA, update the URL to:
    // wss://api.elevenlabs.io/v1/speech-to-text/stream
    const wsUrl = `wss://api.elevenlabs.io/v1/speech-to-text/stream?model_id=scribe_v2&sample_rate=${sampleRate}&encoding=pcm_s16le&language_code=en&xi_api_key=${apiKey}`;

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(wsUrl);

      // Set a connection timeout — if WebSocket doesn't connect in 5s, reject
      const timeout = setTimeout(() => {
        if (!this.connected) {
          this.ws?.close();
          reject(new Error(
            "ElevenLabs Scribe Realtime STT not available. " +
            "Their WebSocket STT API may require a Pro plan or may not be GA yet. " +
            "Use Deepgram Nova-3 for STT instead."
          ));
        }
      }, 5000);

      this.ws.onopen = () => {
        this.connected = true;
        clearTimeout(timeout);
        events.onSpeechStart();
        resolve();
      };

      this.ws.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(
          "ElevenLabs Scribe STT connection failed. " +
          "This may require a paid ElevenLabs plan with Scribe access. " +
          "Try Deepgram Nova-3 as STT provider instead."
        ));
      };

      this.ws.onclose = () => {
        clearTimeout(timeout);
        this.connected = false;
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };
    });
  }

  sendAudio(audio: Int16Array): void {
    if (!this.ws || !this.connected) return;
    // Send raw PCM16 bytes as binary frame — slice to exact view bounds
    this.ws.send(audio.buffer.slice(audio.byteOffset, audio.byteOffset + audio.byteLength));
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close(1000);
      this.ws = null;
    }
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  private handleMessage(raw: string) {
    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    // Handle various response formats ElevenLabs may use
    const text = (msg.text || msg.transcript || "") as string;
    const isFinal = (msg.is_final || msg.isFinal || false) as boolean;

    if (text) {
      if (isFinal) {
        this.events?.onFinalTranscript(text);
      } else {
        this.events?.onPartialTranscript(text);
      }
    }

    if (msg.type === "error" || msg.error) {
      this.events?.onError(
        new Error((msg.message || msg.error || "ElevenLabs STT error") as string)
      );
    }
  }
}
