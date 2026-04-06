import { describe, it, expect } from "vitest";
import {
  S2S_FIGHTERS,
  STT_PROVIDERS,
  LLM_PROVIDERS,
  TTS_PROVIDERS,
  PIPELINE_PRESETS,
  VOICE_OPTIONS,
} from "./fighter-registry";

describe("fighter registry integrity", () => {
  it("all S2S fighters have unique IDs", () => {
    const ids = S2S_FIGHTERS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all providers have required fields", () => {
    const allProviders = [
      ...S2S_FIGHTERS,
      ...STT_PROVIDERS,
      ...LLM_PROVIDERS,
      ...TTS_PROVIDERS,
    ];
    for (const p of allProviders) {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.category).toMatch(/^(s2s|cascaded)$/);
      expect(Array.isArray(p.strengths)).toBe(true);
      expect(p.strengths.length).toBeGreaterThan(0);
    }
  });

  it("VOICE_OPTIONS keys match S2S fighter IDs", () => {
    const s2sIds = S2S_FIGHTERS.map((f) => f.id);
    for (const id of s2sIds) {
      expect(VOICE_OPTIONS[id]).toBeDefined();
      expect(VOICE_OPTIONS[id].length).toBeGreaterThan(0);
    }
  });

  it("pipeline presets reference valid provider IDs", () => {
    const sttIds = new Set(STT_PROVIDERS.map((p) => p.id));
    const llmIds = new Set(LLM_PROVIDERS.map((p) => p.id));
    const ttsIds = new Set(TTS_PROVIDERS.map((p) => p.id));

    for (const preset of PIPELINE_PRESETS) {
      expect(sttIds.has(preset.stt)).toBe(true);
      expect(llmIds.has(preset.llm)).toBe(true);
      expect(ttsIds.has(preset.tts)).toBe(true);
    }
  });

  it("S2S fighters have non-null cost and TTFA", () => {
    for (const f of S2S_FIGHTERS) {
      expect(f.costPerMin).not.toBeNull();
      expect(f.ttfaMs).not.toBeNull();
    }
  });
});
