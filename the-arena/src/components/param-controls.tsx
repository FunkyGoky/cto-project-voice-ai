"use client";

// ============================================================
// Parameter Controls — Center-right panel
// Dynamic form that changes based on the selected fighter.
// Common params (temperature, voice, language) always shown.
// Provider-specific params shown conditionally.
// ============================================================

import { useArena } from "@/lib/arena-context";
import { VOICE_OPTIONS } from "@/lib/providers";

function SliderParam({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  unit?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between">
        <label className="text-[10px] text-text-muted uppercase tracking-wider">
          {label}
        </label>
        <span className="text-[10px] text-text-secondary">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-border rounded-full appearance-none cursor-pointer accent-accent"
      />
    </div>
  );
}

function SelectParam({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { id: string; name: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] text-text-muted uppercase tracking-wider">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-bg-tertiary border border-border rounded-md px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function ToggleParam({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-[10px] text-text-muted uppercase tracking-wider">
        {label}
      </label>
      <button
        onClick={() => onChange(!value)}
        className={`w-8 h-4 rounded-full transition-colors relative ${
          value ? "bg-accent" : "bg-border"
        }`}
      >
        <span
          className={`absolute top-0.5 w-3 h-3 rounded-full bg-text-primary transition-transform ${
            value ? "left-4" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="pt-2 pb-1">
      <span className="text-[9px] text-text-muted uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

export function ParamControls() {
  const { state, dispatch } = useArena();

  // Determine which voice options to show
  const voiceKey =
    state.activeCategory === "s2s" ? state.selectedS2S : "cascaded";
  const voices = VOICE_OPTIONS[voiceKey] || [];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-3 py-2 border-b border-border">
        <h2 className="text-xs font-medium text-text-primary">Parameters</h2>
      </div>

      <div className="p-3 space-y-3">
        {/* Common Params */}
        <SectionDivider label="Common" />

        {/* Temperature — not supported by OpenAI Realtime GA */}
        {!(state.activeCategory === "s2s" && state.selectedS2S === "openai-realtime") && (
          <SliderParam
            label="Temperature"
            value={state.temperature}
            min={0}
            max={2}
            step={0.1}
            onChange={(v) => dispatch({ type: "SET_TEMPERATURE", payload: v })}
          />
        )}

        {voices.length > 0 && (
          <SelectParam
            label="Voice"
            value={state.voice}
            options={voices}
            onChange={(v) => dispatch({ type: "SET_VOICE", payload: v })}
          />
        )}

        <SelectParam
          label="Language"
          value={state.language}
          options={[
            { id: "en", name: "English" },
            { id: "es", name: "Spanish" },
            { id: "fr", name: "French" },
            { id: "de", name: "German" },
            { id: "ja", name: "Japanese" },
            { id: "zh", name: "Chinese" },
            { id: "ko", name: "Korean" },
            { id: "pt", name: "Portuguese" },
          ]}
          onChange={(v) => dispatch({ type: "SET_LANGUAGE", payload: v })}
        />

        {/* OpenAI Realtime-specific */}
        {state.activeCategory === "s2s" &&
          state.selectedS2S === "openai-realtime" && (
            <>
              <SectionDivider label="OpenAI Realtime" />
              <SelectParam
                label="Turn Detection"
                value={state.turnDetection}
                options={[
                  { id: "semantic_vad", name: "Semantic VAD (recommended)" },
                  { id: "server_vad", name: "Server VAD" },
                  { id: "none", name: "None (manual)" },
                ]}
                onChange={(v) =>
                  dispatch({
                    type: "SET_TURN_DETECTION",
                    payload: v as "server_vad" | "none",
                  })
                }
              />
            </>
          )}

        {/* Gemini Live-specific */}
        {state.activeCategory === "s2s" &&
          state.selectedS2S === "gemini-live" && (
            <>
              <SectionDivider label="Gemini Live" />
              <SliderParam
                label="Thinking Budget"
                value={state.thinkingBudget}
                min={0}
                max={8192}
                step={256}
                onChange={(v) =>
                  dispatch({ type: "SET_THINKING_BUDGET", payload: v })
                }
                unit=" tokens"
              />
            </>
          )}

        {/* Hume EVI 3-specific */}
        {state.activeCategory === "s2s" &&
          state.selectedS2S === "hume-evi3" && (
            <>
              <SectionDivider label="Hume EVI 3" />
              <SliderParam
                label="Emotion Threshold"
                value={state.emotionThreshold}
                min={0}
                max={1}
                step={0.05}
                onChange={(v) =>
                  dispatch({ type: "SET_EMOTION_THRESHOLD", payload: v })
                }
              />
              <ToggleParam
                label="BYO-LLM"
                value={state.byoLlm}
                onChange={(v) =>
                  dispatch({ type: "SET_BYO_LLM", payload: v })
                }
              />
            </>
          )}
      </div>
    </div>
  );
}
