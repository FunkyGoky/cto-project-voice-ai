// ============================================================
// Gemini Live Provider
// Connects to Google's Gemini Live API via WebSocket.
// Uses the multimodal live API for audio-in / audio-out.
//
// Key differences from OpenAI Realtime:
// - Input: 16 kHz PCM16, Output: 24 kHz PCM16 (asymmetric)
// - Transcripts via inputTranscription / outputTranscription
// - Setup message with model + generation_config
// - realtime_input with media_chunks for streaming audio
// ============================================================

import type {
  VoiceProvider,
  VoiceProviderConfig,
  VoiceProviderEvents,
} from "./voice-provider";
import type { EvalMetrics, GeminiLiveParams } from "@/types";

/** Gemini Live API WebSocket base URL */
const GEMINI_LIVE_BASE = "wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent";

/** Default model — 2.5 Flash Live is stable; 3.1 is preview */
const DEFAULT_MODEL = "gemini-2.5-flash-live-001";

/** Encode Uint8Array to base64 without spread operator (safe for large buffers) */
function uint8ToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/** Decode base64 to Uint8Array */
function base64ToUint8(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export class GeminiLiveProvider implements VoiceProvider {
  readonly id = "gemini-live";
  readonly name = "Gemini Live";

  /** Gemini input sample rate */
  static readonly INPUT_SAMPLE_RATE = 16000;
  /** Gemini output sample rate */
  static readonly OUTPUT_SAMPLE_RATE = 24000;

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

    const params = config.params as GeminiLiveParams;

    // Get API key from server
    const res = await fetch("/api/gemini/session", { method: "POST" });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to get Gemini credentials");
    }
    const { apiKey } = await res.json();

    const model = params.model || DEFAULT_MODEL;
    const wsUrl = `${GEMINI_LIVE_BASE}?key=${apiKey}`;

    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        // Send setup message — must be the first message on the connection
        const setup: Record<string, unknown> = {
          model: `models/${model}`,
          generation_config: {
            response_modalities: ["AUDIO"],
            speech_config: {
              voice_config: {
                prebuilt_voice_config: {
                  voice_name: params.voice || "Puck",
                },
              },
            },
            temperature: params.temperature,
          },
          system_instruction: {
            parts: [{ text: params.systemPrompt }],
          },
          // Enable transcription for both directions
          input_audio_transcription: {},
          output_audio_transcription: {},
          // VAD configuration
          realtime_input_config: {
            automatic_activity_detection: {
              disabled: false,
              start_of_speech_sensitivity: params.vadSensitivity || "HIGH",
              end_of_speech_sensitivity: params.vadSensitivity || "HIGH",
            },
            activity_handling: "START_OF_ACTIVITY_INTERRUPTS",
          },
        };

        // Thinking config — 2.5 uses thinkingBudget (number), 3.1 uses thinkingLevel (string)
        if (params.thinkingBudget !== undefined && params.thinkingBudget > 0) {
          if (model.includes("3.1")) {
            // Map numeric budget to thinkingLevel for 3.1 models
            const level =
              params.thinkingBudget <= 1024
                ? "minimal"
                : params.thinkingBudget <= 4096
                  ? "low"
                  : params.thinkingBudget <= 8192
                    ? "medium"
                    : "high";
            (setup.generation_config as Record<string, unknown>).thinking_config = {
              thinking_level: level,
            };
          } else {
            (setup.generation_config as Record<string, unknown>).thinking_config = {
              thinking_budget: params.thinkingBudget,
            };
          }
        }

        this.ws!.send(JSON.stringify({ setup }));
      };

      this.ws.onerror = () => {
        reject(new Error("Gemini WebSocket connection failed"));
      };

      this.ws.onclose = (e) => {
        this.connected = false;
        events.onDisconnect(e.reason || "Connection closed");
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data, resolve, reject);
      };
    });
  }

  sendAudio(audio: Int16Array): void {
    if (!this.ws || !this.connected) return;

    if (this.firstAudioSentMs === null) {
      this.firstAudioSentMs = performance.now();
    }

    // Gemini expects base64 PCM audio in a realtime_input message
    const bytes = new Uint8Array(audio.buffer, audio.byteOffset, audio.byteLength);
    const base64 = uint8ToBase64(bytes);

    this.ws.send(
      JSON.stringify({
        realtime_input: {
          media_chunks: [
            {
              data: base64,
              mime_type: "audio/pcm;rate=16000",
            },
          ],
        },
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

  private handleMessage(
    raw: string | Blob,
    onReady: () => void,
    onError: (err: Error) => void
  ) {
    // Handle Blob messages (binary audio)
    if (raw instanceof Blob) {
      raw.text().then((text) => this.processJson(text, onReady, onError));
      return;
    }
    this.processJson(raw as string, onReady, onError);
  }

  private processJson(
    raw: string,
    onReady: () => void,
    _onError: (err: Error) => void
  ) {
    let msg: Record<string, unknown>;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    // Setup complete — server acknowledged our config
    if (msg.setupComplete) {
      this.connected = true;
      this.events?.onReady();
      onReady();
      return;
    }

    // Server content (audio, transcripts, interruptions)
    const serverContent = msg.serverContent as Record<string, unknown> | undefined;
    if (serverContent) {
      // Model audio/text parts
      const parts = (serverContent.modelTurn as Record<string, unknown>)
        ?.parts as Array<Record<string, unknown>> | undefined;

      if (parts) {
        for (const part of parts) {
          // Audio response — output is 24 kHz PCM16
          const inlineData = part.inlineData as Record<string, unknown> | undefined;
          if (inlineData?.data) {
            if (this.firstAudioReceivedMs === null) {
              this.firstAudioReceivedMs = performance.now();
            }
            const bytes = base64ToUint8(inlineData.data as string);
            this.events?.onAudio(new Int16Array(bytes.buffer));
          }
        }
      }

      // Output transcription (agent speech → text)
      const outputTranscription = serverContent.outputTranscription as Record<string, unknown> | undefined;
      if (outputTranscription?.text) {
        this.events?.onTranscript({
          role: "agent",
          text: outputTranscription.text as string,
          timestampMs: performance.now(),
          isDelta: true,
        });
      }

      // Input transcription (user speech → text)
      const inputTranscription = serverContent.inputTranscription as Record<string, unknown> | undefined;
      if (inputTranscription?.text) {
        this.events?.onTranscript({
          role: "user",
          text: inputTranscription.text as string,
          timestampMs: performance.now(),
        });
      }

      // Interrupted flag — model generation was cut short by user speech
      if (serverContent.interrupted) {
        this.interruptionCount++;
        this.events?.onInterruption();
      }
    }
  }
}
