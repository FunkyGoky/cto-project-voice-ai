// ============================================================
// Fighter Registry — Static metadata for all voice AI fighters
// Used by the Fight Card sidebar and eval cost calculations.
//
// Both Deepgram and ElevenLabs are full-stack voice platforms:
// - Deepgram: Nova-3 STT + Aura-2 TTS
// - ElevenLabs: Scribe v2 STT + Multilingual v2 / Flash TTS
// ============================================================

import type { FighterMeta, STTProviderId, LLMProviderId, TTSProviderId } from "@/types";

// ------------------------------------------------------------
// S2S Fighters
// ------------------------------------------------------------

export const S2S_FIGHTERS: FighterMeta[] = [
  {
    id: "openai-realtime",
    name: "OpenAI Realtime",
    category: "s2s",
    ttfaMs: 275,
    costPerMin: 0.30,
    strengths: [
      "Benchmark standard",
      "Function calling",
      "Interruption handling",
    ],
    configured: false,
  },
  {
    id: "gemini-live",
    name: "Gemini Live",
    category: "s2s",
    ttfaMs: 820,
    costPerMin: 0.02,
    strengths: [
      "Cheapest S2S (4.2x cheaper than OpenAI)",
      "70+ languages",
      "24 HD voices",
      "Affective dialog",
    ],
    configured: false,
  },
  {
    id: "hume-evi3",
    name: "Hume EVI 3",
    category: "s2s",
    ttfaMs: 300,
    costPerMin: 0.06,
    strengths: [
      "48+ emotion states",
      "200K+ voice designs",
      "Voice cloning",
      "Best emotional intelligence",
    ],
    configured: false,
  },
];

// ------------------------------------------------------------
// Cascaded Pipeline Components
// ------------------------------------------------------------

export const STT_PROVIDERS: FighterMeta[] = [
  {
    id: "deepgram-nova3",
    name: "Deepgram Nova-3",
    category: "cascaded",
    role: "stt",
    ttfaMs: 150,
    costPerMin: 0.0077,
    strengths: ["Fastest STT", "Per-second billing", "36+ languages"],
    configured: false,
  },
  {
    id: "elevenlabs-scribe",
    name: "ElevenLabs Scribe v2",
    category: "cascaded",
    role: "stt",
    ttfaMs: 150,
    costPerMin: 0.0065, // $0.39/hr = $0.0065/min (Realtime)
    strengths: ["Best-in-class accuracy", "90+ languages", "WebSocket streaming"],
    configured: false,
  },
];

export const LLM_PROVIDERS: FighterMeta[] = [
  {
    id: "openai-gpt5",
    name: "GPT-5",
    category: "cascaded",
    role: "llm",
    ttfaMs: null,
    costPerMin: null,
    strengths: ["Latest OpenAI flagship"],
    configured: false,
  },
  {
    id: "openai-gpt4o",
    name: "GPT-4o",
    category: "cascaded",
    role: "llm",
    ttfaMs: null,
    costPerMin: null,
    strengths: ["Fast, multimodal"],
    configured: false,
  },
  {
    id: "anthropic-sonnet",
    name: "Claude Sonnet",
    category: "cascaded",
    role: "llm",
    ttfaMs: null,
    costPerMin: null,
    strengths: ["Strong reasoning", "Long context"],
    configured: false,
  },
  {
    id: "gemini-flash",
    name: "Gemini 2.5 Flash",
    category: "cascaded",
    role: "llm",
    ttfaMs: null,
    costPerMin: null,
    strengths: ["Cheapest", "Fast"],
    configured: false,
  },
  {
    id: "custom",
    name: "Custom Endpoint",
    category: "cascaded",
    role: "llm",
    ttfaMs: null,
    costPerMin: null,
    strengths: ["Any OpenAI-compatible API"],
    configured: true,
  },
];

export const TTS_PROVIDERS: FighterMeta[] = [
  {
    id: "elevenlabs-v2",
    name: "ElevenLabs v2",
    category: "cascaded",
    role: "tts",
    ttfaMs: null,
    costPerMin: null, // Per-char pricing ($0.12/1K chars)
    strengths: ["Best voice quality", "Voice cloning", "29+ languages"],
    configured: false,
  },
  {
    id: "elevenlabs-flash",
    name: "ElevenLabs Flash",
    category: "cascaded",
    role: "tts",
    ttfaMs: null,
    costPerMin: null, // Per-char pricing ($0.06/1K chars)
    strengths: ["Lower latency", "Half price of v2", "29+ languages"],
    configured: false,
  },
  {
    id: "deepgram-aura2",
    name: "Deepgram Aura-2",
    category: "cascaded",
    role: "tts",
    ttfaMs: null,
    costPerMin: null, // Per-char pricing ($0.030/1K chars)
    strengths: ["Cheapest TTS", "Sub-200ms TTFB", "40+ English voices"],
    configured: false,
  },
];

// ------------------------------------------------------------
// Pipeline Presets — Quick-select common configurations
// ------------------------------------------------------------

export interface PipelinePreset {
  id: string;
  name: string;
  description: string;
  stt: STTProviderId;
  llm: LLMProviderId;
  tts: TTSProviderId;
}

export const PIPELINE_PRESETS: PipelinePreset[] = [
  {
    id: "deepgram-full",
    name: "Deepgram Full Stack",
    description: "Deepgram STT + LLM + Deepgram TTS — lowest cost, fastest",
    stt: "deepgram-nova3",
    llm: "openai-gpt5",
    tts: "deepgram-aura2",
  },
  {
    id: "elevenlabs-full",
    name: "ElevenLabs Full Stack",
    description: "ElevenLabs STT + LLM + ElevenLabs TTS — best accuracy + quality",
    stt: "elevenlabs-scribe",
    llm: "openai-gpt5",
    tts: "elevenlabs-v2",
  },
  {
    id: "best-of-both",
    name: "Best of Both",
    description: "Deepgram STT + LLM + ElevenLabs TTS — fast STT, best voice",
    stt: "deepgram-nova3",
    llm: "openai-gpt5",
    tts: "elevenlabs-v2",
  },
  {
    id: "custom",
    name: "Custom",
    description: "Manual selection — pick each component independently",
    stt: "deepgram-nova3",
    llm: "openai-gpt5",
    tts: "elevenlabs-v2",
  },
];

// ------------------------------------------------------------
// Voice Options Per Provider
// ------------------------------------------------------------

export const VOICE_OPTIONS: Record<string, { id: string; name: string }[]> = {
  "openai-realtime": [
    { id: "alloy", name: "Alloy" },
    { id: "ash", name: "Ash" },
    { id: "ballad", name: "Ballad" },
    { id: "coral", name: "Coral" },
    { id: "echo", name: "Echo" },
    { id: "sage", name: "Sage" },
    { id: "shimmer", name: "Shimmer" },
    { id: "verse", name: "Verse" },
    { id: "marin", name: "Marin" },
    { id: "cedar", name: "Cedar" },
  ],
  "gemini-live": [
    { id: "Puck", name: "Puck" },
    { id: "Charon", name: "Charon" },
    { id: "Kore", name: "Kore" },
    { id: "Fenrir", name: "Fenrir" },
    { id: "Aoede", name: "Aoede" },
  ],
  "hume-evi3": [
    { id: "ITO", name: "Ito (default)" },
    { id: "KORA", name: "Kora" },
    { id: "DACHER", name: "Dacher" },
  ],
};
