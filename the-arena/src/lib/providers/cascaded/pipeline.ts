// ============================================================
// Cascaded Pipeline Orchestrator
// Composes STT → LLM → TTS into a single conversational loop.
// Flow: Mic audio → STT (partial/final) → LLM (streaming) →
//       TTS (streaming audio) → Speaker
// ============================================================

import type {
  CascadedPipeline,
  CascadedPipelineConfig,
  CascadedPipelineEvents,
  STTProvider,
  LLMProvider,
  TTSProvider,
} from "../cascaded-provider";
import type { EvalMetrics } from "@/types";

export class CascadedPipelineOrchestrator implements CascadedPipeline {
  private stt: STTProvider | null = null;
  private llm: LLMProvider | null = null;
  private tts: TTSProvider | null = null;
  private events: CascadedPipelineEvents | null = null;
  private config: CascadedPipelineConfig | null = null;
  private connected = false;

  // Conversation state
  private conversationHistory: { role: "user" | "assistant"; content: string }[] = [];
  private isProcessing = false;

  // Timing metrics
  private firstAudioSentMs: number | null = null;
  private firstAudioReceivedMs: number | null = null;
  private interruptionCount = 0;

  async connect(
    config: CascadedPipelineConfig,
    events: CascadedPipelineEvents
  ): Promise<void> {
    this.config = config;
    this.events = events;
    this.stt = config.sttProvider;
    this.llm = config.llmProvider;
    this.tts = config.ttsProvider;
    this.conversationHistory = [];
    this.isProcessing = false;
    this.firstAudioSentMs = null;
    this.firstAudioReceivedMs = null;
    this.interruptionCount = 0;

    // Connect STT with handlers
    await this.stt.connect(config.sampleRate, {
      onPartialTranscript: (text) => {
        events.onTranscript({
          role: "user",
          text,
          timestampMs: performance.now(),
        });
      },
      onFinalTranscript: (text) => {
        events.onTranscript({
          role: "user",
          text,
          timestampMs: performance.now(),
        });
        // Trigger LLM → TTS pipeline
        this.processUserTurn(text);
      },
      onSpeechStart: () => {
        // User started speaking while agent is responding = interruption
        if (this.isProcessing) {
          this.interruptionCount++;
          events.onInterruption();
        }
      },
      onSpeechEnd: () => {},
      onError: (err) => events.onError(err),
    });

    // Connect TTS with handlers
    await this.tts.connect({
      onAudio: (audio) => {
        if (this.firstAudioReceivedMs === null) {
          this.firstAudioReceivedMs = performance.now();
        }
        events.onAudio(audio);
      },
      onDone: () => {
        this.isProcessing = false;
      },
      onError: (err) => events.onError(err),
    });

    this.connected = true;
    events.onReady();
  }

  sendAudio(audio: Int16Array): void {
    if (!this.stt || !this.connected) return;

    if (this.firstAudioSentMs === null) {
      this.firstAudioSentMs = performance.now();
    }

    this.stt.sendAudio(audio);
  }

  async disconnect(): Promise<void> {
    await this.stt?.disconnect();
    await this.tts?.disconnect();
    this.connected = false;
    this.events?.onDisconnect("Client disconnect");
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
  // Private: Process a completed user turn through LLM → TTS
  // ----------------------------------------------------------

  private async processUserTurn(userText: string) {
    if (!this.llm || !this.tts || !this.config || !this.events) return;

    this.isProcessing = true;
    this.conversationHistory.push({ role: "user", content: userText });

    try {
      // Stream LLM response
      let fullResponse = "";
      let sentenceBuffer = "";

      const stream = this.llm.streamCompletion(
        this.config.systemPrompt,
        this.conversationHistory,
        {
          temperature: this.config.temperature,
          model: "", // Determined by the proxy
        }
      );

      for await (const chunk of stream) {
        fullResponse += chunk;
        sentenceBuffer += chunk;

        // Send to TTS in sentence-sized chunks for natural delivery
        const sentenceEnd = sentenceBuffer.match(/[.!?]\s/);
        if (sentenceEnd && sentenceEnd.index !== undefined) {
          const sentence = sentenceBuffer.slice(0, sentenceEnd.index + 1);
          sentenceBuffer = sentenceBuffer.slice(sentenceEnd.index + 2);

          // Fire transcript event for the sentence
          this.events.onTranscript({
            role: "agent",
            text: sentence,
            timestampMs: performance.now(),
          });

          // Send to TTS
          await this.tts.synthesize(sentence, this.config.voice);
        }
      }

      // Send remaining text
      if (sentenceBuffer.trim()) {
        this.events.onTranscript({
          role: "agent",
          text: sentenceBuffer.trim(),
          timestampMs: performance.now(),
        });
        await this.tts.synthesize(sentenceBuffer.trim(), this.config.voice);
      }

      this.conversationHistory.push({ role: "assistant", content: fullResponse });
    } catch (err) {
      this.isProcessing = false;
      this.events.onError(
        err instanceof Error ? err : new Error("Pipeline error")
      );
    }
    // Note: isProcessing is set to false by TTS onDone callback (not here)
    // to ensure interruption detection stays active until audio finishes playing.
  }
}
