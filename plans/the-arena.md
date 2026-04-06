# The Arena — Voice AI Testing Lab

**Overall Progress:** `100%`

## TLDR

A personal benchmarking lab to test voice AI providers side-by-side. Two categories — S2S (end-to-end) and Cascaded (STT + LLM + TTS) — share the same prompt, reference data, and eval metrics. Next.js 16 app with 5-panel layout: fight card, prompt editor, parameter controls, test console, and eval dashboard.

## Critical Decisions

- **Next.js 16 App Router + TypeScript** — modern React server components, API routes for provider auth proxying, single deployable unit
- **SQLite via better-sqlite3** — zero infrastructure, self-contained and portable
- **Direct Web Audio API for mic capture** — simpler than LiveKit for benchmarking. `MicCapture` class handles getUserMedia + PCM16 encoding. LiveKit can be added later for production.
- **Ephemeral token pattern for API keys** — server creates session/token, client connects directly to provider WebSocket. API keys never touch the browser.
- **Common `VoiceProvider` interface for S2S, composable `CascadedPipelineOrchestrator` for cascaded** — abstracts all providers behind uniform API
- **Eval runs async post-session** — non-blocking, writes metrics to DB. WER via Levenshtein distance.
- **Twilio via REST API + TwiML** — outbound calls with Media Streams webhook. Full WebSocket bridge requires custom server (documented).

## Tasks

- [x] 🟩 **Step 1: Project Scaffold**
  - [x] 🟩 `create-next-app` with App Router, TypeScript, Tailwind CSS, ESLint
  - [x] 🟩 Dark theme base styles (monospaced editor font, minimal palette)
  - [x] 🟩 `.env.local` template with all provider API key placeholders
  - [x] 🟩 Project structure: `app/`, `lib/providers/`, `lib/eval/`, `lib/db/`, `components/`, `types/`

- [x] 🟩 **Step 2: Type System + Provider Interfaces**
  - [x] 🟩 Core types: `Session`, `Transcript`, `EvalMetrics`, `FighterConfig`, `ProviderParams`
  - [x] 🟩 `VoiceProvider` interface: `connect()`, `sendAudio()`, `onTranscript()`, `onAudio()`, `disconnect()`, `getMetrics()`
  - [x] 🟩 `CascadedProvider` interface composing `STTProvider` + `LLMProvider` + `TTSProvider`
  - [x] 🟩 Fighter registry: metadata (name, category, cost, TTFA, strengths) for all 5 fighters

- [x] 🟩 **Step 3: 5-Panel Layout Shell**
  - [x] 🟩 Fight Card sidebar — S2S section (3 fighters) + Cascaded section (STT/LLM/TTS dropdowns)
  - [x] 🟩 Prompt Editor — monospaced textarea with token counter, save/load prompt templates (localStorage)
  - [x] 🟩 Parameter Controls — dynamic form that swaps fields based on selected fighter
  - [x] 🟩 Test Console — mic button, transcript area, session timer, waveform
  - [x] 🟩 Eval Dashboard — metric cards, comparison table, session history
  - [x] 🟩 Reference Panel — collapsible area for pasting knowledge base / reference transcripts

- [x] 🟩 **Step 4: OpenAI Realtime API Integration**
  - [x] 🟩 Next.js API route for ephemeral session token (`/api/openai/session`)
  - [x] 🟩 `OpenAIRealtimeProvider` implementing `VoiceProvider` interface
  - [x] 🟩 Handle: session creation, audio streaming, transcript events, interruptions
  - [x] 🟩 Params: voice selection (6 options), temperature, turn_detection (server_vad/none), modalities

- [x] 🟩 **Step 5: Google Gemini Live API Integration**
  - [x] 🟩 `GeminiLiveProvider` implementing `VoiceProvider` interface
  - [x] 🟩 WebSocket connection via Gemini Live API endpoint
  - [x] 🟩 Params: voice selection, temperature, thinking_budget
  - [x] 🟩 Handle audio format differences (Gemini uses 16kHz PCM)

- [x] 🟩 **Step 6: Browser Mic + Audio Capture**
  - [x] 🟩 `MicCapture` class — Web Audio API getUserMedia + PCM16 encoding
  - [x] 🟩 `AudioPlayer` class — queued PCM16 playback through speakers
  - [x] 🟩 Real-time transcript display (user turns + agent turns, auto-scroll)
  - [x] 🟩 Canvas waveform visualization from AnalyserNode
  - [x] 🟩 Session timer with live cost estimate (duration × provider rate)

- [x] 🟩 **Step 7: Eval Pipeline + Persistence**
  - [x] 🟩 SQLite schema via better-sqlite3 (WAL mode, sessions table)
  - [x] 🟩 TTFA measurement — provider-level timing (first audio sent → first audio received)
  - [x] 🟩 Turn-taking score — count dead air gaps >500ms between speakers
  - [x] 🟩 WER calculation — Levenshtein word-level distance vs reference
  - [x] 🟩 Cost per session — duration × provider rate(s)
  - [x] 🟩 Manual naturalness rating + tool call success rate (schema ready)
  - [x] 🟩 API routes: `GET/POST /api/sessions`

- [x] 🟩 **Step 8: Comparison View + Export**
  - [x] 🟩 Select 2+ sessions → side-by-side metric comparison table
  - [x] 🟩 Filter by: category (S2S vs cascaded vs all)
  - [x] 🟩 CSV export via `GET /api/sessions/export`

- [x] 🟩 **Step 9: Cascaded Pipeline — Deepgram STT + LLM + TTS**
  - [x] 🟩 `DeepgramSTTProvider` — WebSocket streaming transcription (Nova-3)
  - [x] 🟩 `ProxiedLLMProvider` — server-proxied chat completions (GPT-5, Claude Sonnet, Gemini Flash, custom)
  - [x] 🟩 `DeepgramTTSProvider` — Aura-2 REST TTS
  - [x] 🟩 `ElevenLabsTTSProvider` — WebSocket streaming TTS (Multilingual v2)
  - [x] 🟩 `CascadedPipelineOrchestrator` — STT → sentence-chunked LLM → TTS → speaker
  - [x] 🟩 Component selector UI in fight card (independent STT/LLM/TTS dropdowns)

- [x] 🟩 **Step 10: Hume AI EVI 3 Integration**
  - [x] 🟩 `HumeEVI3Provider` implementing `VoiceProvider` interface
  - [x] 🟩 Params: voice, temperature, emotion_threshold, BYO-LLM toggle
  - [x] 🟩 Emotion detection tracking (prosody scores per utterance)
  - [x] 🟩 Emotional alignment scoring (`getEmotionalAlignment()`)

- [x] 🟩 **Step 11: Twilio Telephony**
  - [x] 🟩 Outbound call via Twilio REST API (`POST /api/twilio/call`)
  - [x] 🟩 Media Streams TwiML webhook (`POST /api/twilio/media-stream`)
  - [x] 🟩 Architecture documented for full WebSocket bridge (requires custom server)
