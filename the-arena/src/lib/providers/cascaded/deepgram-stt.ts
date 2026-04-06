// ============================================================
// Deepgram STT Provider — Nova-3 streaming transcription
// Connects via WebSocket for real-time STT.
// Sends PCM16 audio, receives partial + final transcripts.
// ============================================================

import type { STTProvider, STTProviderEvents } from "../cascaded-provider";

const DEEPGRAM_WS_BASE = "wss://api.deepgram.com/v1/listen";

export class DeepgramSTTProvider implements STTProvider {
  readonly id = "deepgram-nova3";
  readonly name = "Deepgram Nova-3";

  private ws: WebSocket | null = null;
  private events: STTProviderEvents | null = null;
  private connected = false;

  async connect(sampleRate: number, events: STTProviderEvents): Promise<void> {
    this.events = events;

    // Get API key from server
    const res = await fetch("/api/deepgram/token", { method: "POST" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to get Deepgram credentials");
    }
    const { apiKey } = await res.json();

    const params = new URLSearchParams({
      model: "nova-3",
      encoding: "linear16",
      sample_rate: String(sampleRate),
      channels: "1",
      interim_results: "true",
      utterance_end_ms: "1000",
      vad_events: "true",
      punctuate: "true",
      smart_format: "true",
    });

    const wsUrl = `${DEEPGRAM_WS_BASE}?${params}`;

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(wsUrl, ["token", apiKey]);

      this.ws.onopen = () => {
        this.connected = true;
        resolve();
      };

      this.ws.onerror = () => {
        reject(new Error("Deepgram WebSocket connection failed"));
      };

      this.ws.onclose = () => {
        this.connected = false;
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };
    });
  }

  sendAudio(audio: Int16Array): void {
    if (!this.ws || !this.connected) return;
    // Send raw PCM16 bytes — slice to exact view bounds to avoid sending extra data
    this.ws.send(audio.buffer.slice(audio.byteOffset, audio.byteOffset + audio.byteLength));
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      // Send close frame to Deepgram
      this.ws.send(JSON.stringify({ type: "CloseStream" }));
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

    const type = msg.type as string;

    if (type === "Results") {
      const channel = msg.channel as Record<string, unknown>;
      const alternatives = (channel?.alternatives as Array<Record<string, unknown>>) || [];
      const transcript = alternatives[0]?.transcript as string;
      const isFinal = msg.is_final as boolean;
      const speechFinal = msg.speech_final as boolean;

      if (transcript) {
        if (isFinal && speechFinal) {
          this.events?.onFinalTranscript(transcript);
        } else {
          this.events?.onPartialTranscript(transcript);
        }
      }
    }

    if (type === "SpeechStarted") {
      this.events?.onSpeechStart();
    }

    if (type === "UtteranceEnd") {
      this.events?.onSpeechEnd();
    }
  }
}
