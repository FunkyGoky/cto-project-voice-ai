// ============================================================
// Arena Store — Client-side state management
// Single source of truth for selected fighters, params, session
// state, transcripts, and prompt. Uses React context + reducer.
// ============================================================

import type {
  FighterCategory,
  S2SFighterId,
  STTProviderId,
  LLMProviderId,
  TTSProviderId,
  SessionState,
  TranscriptEntry,
  InputMode,
  PromptTemplate,
  Session,
} from "@/types";
import { VOICE_OPTIONS } from "@/lib/providers/fighter-registry";

// ------------------------------------------------------------
// State Shape
// ------------------------------------------------------------

export interface ArenaState {
  // Fighter selection
  activeCategory: FighterCategory;
  selectedS2S: S2SFighterId;
  selectedSTT: STTProviderId;
  selectedLLM: LLMProviderId;
  selectedTTS: TTSProviderId;
  customLlmEndpoint: string;

  // Prompt
  systemPrompt: string;
  promptTemplates: PromptTemplate[];

  // Common params
  temperature: number;
  voice: string;
  language: string;

  // Provider-specific params
  turnDetection: "semantic_vad" | "server_vad" | "none";
  modalities: ("text" | "audio")[];
  thinkingBudget: number;
  emotionThreshold: number;
  byoLlm: boolean;

  // Session
  sessionState: SessionState;
  inputMode: InputMode;
  transcript: TranscriptEntry[];
  sessionStartMs: number | null;
  elapsedMs: number;

  // Reference
  referenceText: string;

  // Eval / history
  sessions: Session[];
  selectedSessionIds: string[];
}

// ------------------------------------------------------------
// Initial State
// ------------------------------------------------------------

export const initialState: ArenaState = {
  activeCategory: "s2s",
  selectedS2S: "openai-realtime",
  selectedSTT: "deepgram-nova3",
  selectedLLM: "openai-gpt5",
  selectedTTS: "elevenlabs-v2",
  customLlmEndpoint: "",

  systemPrompt:
    "You are a helpful voice assistant. Be concise and conversational.",
  promptTemplates: [],

  temperature: 0.7,
  voice: "alloy",
  language: "en",

  turnDetection: "semantic_vad",
  modalities: ["text", "audio"],
  thinkingBudget: 1024,
  emotionThreshold: 0.5,
  byoLlm: false,

  sessionState: "idle",
  inputMode: "browser-mic",
  transcript: [],
  sessionStartMs: null,
  elapsedMs: 0,

  referenceText: "",

  sessions: [],
  selectedSessionIds: [],
};

// ------------------------------------------------------------
// Actions
// ------------------------------------------------------------

export type ArenaAction =
  | { type: "SET_CATEGORY"; payload: FighterCategory }
  | { type: "SET_S2S"; payload: S2SFighterId }
  | { type: "SET_STT"; payload: STTProviderId }
  | { type: "SET_LLM"; payload: LLMProviderId }
  | { type: "SET_TTS"; payload: TTSProviderId }
  | { type: "SET_CUSTOM_LLM_ENDPOINT"; payload: string }
  | { type: "SET_PROMPT"; payload: string }
  | { type: "SET_PROMPT_TEMPLATES"; payload: PromptTemplate[] }
  | { type: "SET_TEMPERATURE"; payload: number }
  | { type: "SET_VOICE"; payload: string }
  | { type: "SET_LANGUAGE"; payload: string }
  | { type: "SET_TURN_DETECTION"; payload: "server_vad" | "none" }
  | { type: "SET_MODALITIES"; payload: ("text" | "audio")[] }
  | { type: "SET_THINKING_BUDGET"; payload: number }
  | { type: "SET_EMOTION_THRESHOLD"; payload: number }
  | { type: "SET_BYO_LLM"; payload: boolean }
  | { type: "SET_SESSION_STATE"; payload: SessionState }
  | { type: "SET_INPUT_MODE"; payload: InputMode }
  | { type: "ADD_TRANSCRIPT"; payload: TranscriptEntry }
  | { type: "CLEAR_TRANSCRIPT" }
  | { type: "SET_SESSION_START"; payload: number }
  | { type: "SET_ELAPSED"; payload: number }
  | { type: "SET_REFERENCE_TEXT"; payload: string }
  | { type: "ADD_SESSION"; payload: Session }
  | { type: "SET_SESSIONS"; payload: Session[] }
  | { type: "TOGGLE_SESSION_SELECTION"; payload: string }
  | { type: "CLEAR_SESSION_SELECTION" };

// ------------------------------------------------------------
// Reducer
// ------------------------------------------------------------

export function arenaReducer(
  state: ArenaState,
  action: ArenaAction
): ArenaState {
  switch (action.type) {
    case "SET_CATEGORY":
      return { ...state, activeCategory: action.payload };
    case "SET_S2S": {
      // Auto-set voice to the first option for the new fighter
      const voices = VOICE_OPTIONS[action.payload];
      const newVoice = voices?.[0]?.id ?? state.voice;
      return { ...state, selectedS2S: action.payload, voice: newVoice };
    }
    case "SET_STT":
      return { ...state, selectedSTT: action.payload };
    case "SET_LLM":
      return { ...state, selectedLLM: action.payload };
    case "SET_TTS":
      return { ...state, selectedTTS: action.payload };
    case "SET_CUSTOM_LLM_ENDPOINT":
      return { ...state, customLlmEndpoint: action.payload };
    case "SET_PROMPT":
      return { ...state, systemPrompt: action.payload };
    case "SET_PROMPT_TEMPLATES":
      return { ...state, promptTemplates: action.payload };
    case "SET_TEMPERATURE":
      return { ...state, temperature: action.payload };
    case "SET_VOICE":
      return { ...state, voice: action.payload };
    case "SET_LANGUAGE":
      return { ...state, language: action.payload };
    case "SET_TURN_DETECTION":
      return { ...state, turnDetection: action.payload };
    case "SET_MODALITIES":
      return { ...state, modalities: action.payload };
    case "SET_THINKING_BUDGET":
      return { ...state, thinkingBudget: action.payload };
    case "SET_EMOTION_THRESHOLD":
      return { ...state, emotionThreshold: action.payload };
    case "SET_BYO_LLM":
      return { ...state, byoLlm: action.payload };
    case "SET_SESSION_STATE":
      return { ...state, sessionState: action.payload };
    case "SET_INPUT_MODE":
      return { ...state, inputMode: action.payload };
    case "ADD_TRANSCRIPT": {
      const entry = action.payload;
      // Delta transcript: append text to the last entry if same role
      if (entry.isDelta && state.transcript.length > 0) {
        const last = state.transcript[state.transcript.length - 1];
        if (last.role === entry.role) {
          const updated = [...state.transcript];
          updated[updated.length - 1] = {
            ...last,
            text: last.text + entry.text,
          };
          return { ...state, transcript: updated };
        }
      }
      return { ...state, transcript: [...state.transcript, entry] };
    }
    case "CLEAR_TRANSCRIPT":
      return { ...state, transcript: [] };
    case "SET_SESSION_START":
      return { ...state, sessionStartMs: action.payload };
    case "SET_ELAPSED":
      return { ...state, elapsedMs: action.payload };
    case "SET_REFERENCE_TEXT":
      return { ...state, referenceText: action.payload };
    case "ADD_SESSION":
      return { ...state, sessions: [action.payload, ...state.sessions] };
    case "SET_SESSIONS":
      return { ...state, sessions: action.payload };
    case "TOGGLE_SESSION_SELECTION": {
      const id = action.payload;
      const selected = state.selectedSessionIds.includes(id)
        ? state.selectedSessionIds.filter((s) => s !== id)
        : [...state.selectedSessionIds, id];
      return { ...state, selectedSessionIds: selected };
    }
    case "CLEAR_SESSION_SELECTION":
      return { ...state, selectedSessionIds: [] };
    default:
      return state;
  }
}
