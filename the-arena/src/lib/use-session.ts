"use client";

// ============================================================
// useSession — Hook that orchestrates a test session
// Wires: fighter selection → provider → mic capture → playback
// Manages session lifecycle: connect, stream, disconnect, eval.
// Supports both S2S and Cascaded pipeline modes.
// ============================================================

import { useCallback, useRef, useEffect } from "react";
import { useArena } from "./arena-context";
import { MicCapture, AudioPlayer } from "./audio";
import { OpenAIRealtimeProvider } from "./providers/openai-realtime";
import { GeminiLiveProvider } from "./providers/gemini-live";
import { HumeEVI3Provider } from "./providers/hume-evi3";
import {
  DeepgramSTTProvider,
  ElevenLabsScribeProvider,
  DeepgramTTSProvider,
  ElevenLabsTTSProvider,
  ProxiedLLMProvider,
  CascadedPipelineOrchestrator,
} from "./providers/cascaded";
import type { VoiceProvider, VoiceProviderEvents } from "./providers/voice-provider";
import type { CascadedPipelineEvents } from "./providers/cascaded-provider";
import type { OpenAIRealtimeParams, GeminiLiveParams, HumeEVI3Params, EvalMetrics } from "@/types";

/** Get input (mic) and output (playback) sample rates for each provider.
 *  Most providers use symmetric rates; Gemini is asymmetric (16k in, 24k out). */
function getSampleRates(providerId: string): { input: number; output: number } {
  switch (providerId) {
    case "openai-realtime":
      return { input: 24000, output: 24000 };
    case "gemini-live":
      return { input: 16000, output: 24000 };
    case "hume-evi3":
      return { input: 16000, output: 16000 };
    default:
      return { input: 24000, output: 24000 };
  }
}

/** Instantiate the correct S2S provider */
function createS2SProvider(providerId: string): VoiceProvider {
  switch (providerId) {
    case "openai-realtime":
      return new OpenAIRealtimeProvider();
    case "gemini-live":
      return new GeminiLiveProvider();
    case "hume-evi3":
      return new HumeEVI3Provider();
    default:
      throw new Error(`Unknown S2S provider: ${providerId}`);
  }
}

/** Create an STT provider by ID */
function createSTTProvider(id: string) {
  switch (id) {
    case "deepgram-nova3":
      return new DeepgramSTTProvider();
    case "elevenlabs-scribe":
      return new ElevenLabsScribeProvider();
    default:
      throw new Error(`Unknown STT provider: ${id}`);
  }
}

/** Create a TTS provider by ID */
function createTTSProvider(id: string) {
  switch (id) {
    case "deepgram-aura2":
      return new DeepgramTTSProvider();
    case "elevenlabs-v2":
      return new ElevenLabsTTSProvider("elevenlabs-v2");
    case "elevenlabs-flash":
      return new ElevenLabsTTSProvider("elevenlabs-flash");
    default:
      throw new Error(`Unknown TTS provider: ${id}`);
  }
}

/** Create an LLM provider by ID */
function createLLMProvider(id: string) {
  const names: Record<string, string> = {
    "openai-gpt5": "GPT-5",
    "openai-gpt4o": "GPT-4o",
    "anthropic-sonnet": "Claude Sonnet",
    "gemini-flash": "Gemini Flash",
    custom: "Custom",
  };
  return new ProxiedLLMProvider(id, names[id] || id);
}

export function useSession() {
  const { state, dispatch } = useArena();
  const providerRef = useRef<VoiceProvider | null>(null);
  const cascadedRef = useRef<CascadedPipelineOrchestrator | null>(null);
  const micRef = useRef<MicCapture | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Keep a ref to the latest state to avoid stale closures in session callbacks
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ----------------------------------------------------------
  // Shared: start mic + timer + player
  // ----------------------------------------------------------
  async function startAudioPipeline(
    inputSampleRate: number,
    outputSampleRate: number,
    onAudio: (pcm16: Int16Array) => void
  ) {
    playerRef.current = new AudioPlayer(outputSampleRate);

    const mic = new MicCapture();
    micRef.current = mic;
    const analyser = await mic.start(inputSampleRate, onAudio);
    analyserRef.current = analyser;

    const startTime = Date.now();
    dispatch({ type: "SET_SESSION_START", payload: startTime });
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      dispatch({ type: "SET_ELAPSED", payload: Date.now() - startTime });
    }, 100);
  }

  function cleanupSession() {
    micRef.current?.stop();
    micRef.current = null;
    playerRef.current?.close();
    playerRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    analyserRef.current = null;
    providerRef.current = null;
    cascadedRef.current = null;
    dispatch({ type: "SET_SESSION_STATE", payload: "idle" });
  }

  // ----------------------------------------------------------
  // S2S Session
  // ----------------------------------------------------------
  async function startS2SSession() {
    const s = stateRef.current;
    const providerId = s.selectedS2S;
    const { input: inputRate, output: outputRate } = getSampleRates(providerId);

    const provider = createS2SProvider(providerId);
    providerRef.current = provider;

    let params;
    if (providerId === "openai-realtime") {
      params = {
        systemPrompt: s.systemPrompt,
        temperature: s.temperature,
        voice: s.voice,
        language: s.language,
        turnDetection: s.turnDetection,
        modalities: s.modalities,
      } as OpenAIRealtimeParams;
    } else if (providerId === "hume-evi3") {
      params = {
        systemPrompt: s.systemPrompt,
        temperature: s.temperature,
        voice: s.voice,
        language: s.language,
        emotionThreshold: s.emotionThreshold,
        byoLlm: s.byoLlm,
      } as HumeEVI3Params;
    } else {
      params = {
        systemPrompt: s.systemPrompt,
        temperature: s.temperature,
        voice: s.voice,
        language: s.language,
        thinkingBudget: s.thinkingBudget,
      } as GeminiLiveParams;
    }

    const events: VoiceProviderEvents = {
      onReady: () => {
        dispatch({ type: "SET_SESSION_STATE", payload: "active" });
      },
      onAudio: (audio) => playerRef.current?.play(audio),
      onTranscript: (entry) => dispatch({ type: "ADD_TRANSCRIPT", payload: entry }),
      onInterruption: () => playerRef.current?.flush(),
      onDisconnect: () => cleanupSession(),
      onError: (error) => {
        console.error(`[${providerId}]`, error.message);
        cleanupSession();
      },
    };

    await provider.connect({ params, sampleRate: inputRate }, events);
    await startAudioPipeline(inputRate, outputRate, (pcm16) => provider.sendAudio(pcm16));
  }

  // ----------------------------------------------------------
  // Cascaded Session
  // ----------------------------------------------------------
  async function startCascadedSession() {
    const s = stateRef.current;
    const sampleRate = 24000; // Standard for cascaded pipeline

    const sttProvider = createSTTProvider(s.selectedSTT);
    const llmProvider = createLLMProvider(s.selectedLLM);
    const ttsProvider = createTTSProvider(s.selectedTTS);

    const pipeline = new CascadedPipelineOrchestrator();
    cascadedRef.current = pipeline;

    const events: CascadedPipelineEvents = {
      onReady: () => {
        dispatch({ type: "SET_SESSION_STATE", payload: "active" });
      },
      onAudio: (audio) => playerRef.current?.play(audio),
      onTranscript: (entry) => dispatch({ type: "ADD_TRANSCRIPT", payload: entry }),
      onInterruption: () => playerRef.current?.flush(),
      onDisconnect: () => cleanupSession(),
      onError: (error) => {
        console.error("[cascaded]", error.message);
        cleanupSession();
      },
    };

    await pipeline.connect(
      {
        systemPrompt: s.systemPrompt,
        temperature: s.temperature,
        voice: s.voice,
        sampleRate,
        sttProvider,
        llmProvider,
        ttsProvider,
      },
      events
    );

    await startAudioPipeline(sampleRate, sampleRate, (pcm16) => pipeline.sendAudio(pcm16));
  }

  // ----------------------------------------------------------
  // Public API
  // ----------------------------------------------------------
  const startSession = useCallback(async () => {
    dispatch({ type: "CLEAR_TRANSCRIPT" });
    dispatch({ type: "SET_SESSION_STATE", payload: "connecting" });

    try {
      if (stateRef.current.activeCategory === "s2s") {
        await startS2SSession();
      } else {
        await startCascadedSession();
      }
    } catch (err) {
      console.error("Failed to start session:", err);
      dispatch({ type: "SET_SESSION_STATE", payload: "idle" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const endSession = useCallback(async () => {
    dispatch({ type: "SET_SESSION_STATE", payload: "ending" });
    if (providerRef.current) {
      await providerRef.current.disconnect();
    }
    if (cascadedRef.current) {
      await cascadedRef.current.disconnect();
    }
    cleanupSession();
  }, [dispatch]);

  /** Get metrics from whichever provider was active */
  function getProviderMetrics(): Pick<EvalMetrics, "ttfaMs" | "interruptionCount"> {
    if (providerRef.current) return providerRef.current.getMetrics();
    if (cascadedRef.current) return cascadedRef.current.getMetrics();
    return { ttfaMs: null, interruptionCount: 0 };
  }

  return {
    startSession,
    endSession,
    analyserRef,
    providerRef,
    cascadedRef,
    getProviderMetrics,
  };
}
