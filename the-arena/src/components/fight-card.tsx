"use client";

// ============================================================
// Fight Card — Left sidebar
// Two sections: S2S fighters and Cascaded pipeline with
// pipeline presets + independent STT/LLM/TTS component selectors.
// ============================================================

import { useState } from "react";
import { useArena } from "@/lib/arena-context";
import {
  S2S_FIGHTERS,
  STT_PROVIDERS,
  LLM_PROVIDERS,
  TTS_PROVIDERS,
  PIPELINE_PRESETS,
} from "@/lib/providers";
import type { FighterMeta, FighterCategory, S2SFighterId } from "@/types";

function Badge({ category }: { category: FighterCategory }) {
  const color =
    category === "s2s"
      ? "bg-s2s-badge/20 text-s2s-badge"
      : "bg-cascaded-badge/20 text-cascaded-badge";
  const label = category === "s2s" ? "S2S" : "Cascaded";
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${color}`}>
      {label}
    </span>
  );
}

function FighterCard({
  fighter,
  selected,
  onClick,
}: {
  fighter: FighterMeta;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-md border transition-colors ${
        selected
          ? "border-accent bg-bg-tertiary"
          : "border-border bg-bg-secondary hover:border-border-active hover:bg-bg-hover"
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-text-primary">
          {fighter.name}
        </span>
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            fighter.configured ? "bg-success" : "bg-text-muted"
          }`}
        />
      </div>
      <div className="flex gap-3 text-[10px] text-text-secondary mb-1.5">
        {fighter.ttfaMs != null && <span>TTFA: {fighter.ttfaMs}ms</span>}
        {fighter.costPerMin != null && (
          <span>${fighter.costPerMin.toFixed(4)}/min</span>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {fighter.strengths.slice(0, 2).map((s) => (
          <span
            key={s}
            className="text-[9px] px-1 py-0.5 rounded-sm bg-bg-primary text-text-muted"
          >
            {s}
          </span>
        ))}
      </div>
    </button>
  );
}

function CascadedDropdown({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: FighterMeta[];
  value: string;
  onChange: (id: string) => void;
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
            {o.costPerMin != null ? ` ($${o.costPerMin.toFixed(4)}/min)` : ""}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FightCard() {
  const { state, dispatch } = useArena();
  const [activePreset, setActivePreset] = useState("custom");

  /** Apply a pipeline preset — sets STT, LLM, TTS in one click */
  function applyPreset(presetId: string) {
    setActivePreset(presetId);
    const preset = PIPELINE_PRESETS.find((p) => p.id === presetId);
    if (!preset || presetId === "custom") return;
    dispatch({ type: "SET_STT", payload: preset.stt });
    dispatch({ type: "SET_LLM", payload: preset.llm });
    dispatch({ type: "SET_TTS", payload: preset.tts });
  }

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-bg-secondary flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-sm font-semibold text-text-primary">The Arena</h1>
        <p className="text-[10px] text-text-muted mt-0.5">
          Voice AI Testing Lab
        </p>
      </div>

      {/* Category Toggle */}
      <div className="p-3 border-b border-border">
        <div className="flex bg-bg-primary rounded-md p-0.5">
          {(["s2s", "cascaded"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => dispatch({ type: "SET_CATEGORY", payload: cat })}
              className={`flex-1 py-1.5 text-[10px] font-medium rounded-sm transition-colors ${
                state.activeCategory === cat
                  ? "bg-bg-tertiary text-text-primary"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {cat === "s2s" ? "S2S" : "Cascaded"}
            </button>
          ))}
        </div>
      </div>

      {/* S2S Section */}
      {state.activeCategory === "s2s" && (
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Badge category="s2s" />
            <span className="text-[10px] text-text-muted">
              End-to-End Models
            </span>
          </div>
          {S2S_FIGHTERS.map((f) => (
            <FighterCard
              key={f.id}
              fighter={f}
              selected={state.selectedS2S === f.id}
              onClick={() =>
                dispatch({
                  type: "SET_S2S",
                  payload: f.id as S2SFighterId,
                })
              }
            />
          ))}
        </div>
      )}

      {/* Cascaded Section */}
      {state.activeCategory === "cascaded" && (
        <div className="p-3 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Badge category="cascaded" />
            <span className="text-[10px] text-text-muted">
              STT + LLM + TTS
            </span>
          </div>

          {/* Pipeline Presets */}
          <div className="space-y-1">
            <label className="text-[10px] text-text-muted uppercase tracking-wider">
              Preset
            </label>
            <div className="grid grid-cols-2 gap-1">
              {PIPELINE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  title={preset.description}
                  className={`px-2 py-1.5 rounded-sm text-[10px] transition-colors border ${
                    activePreset === preset.id
                      ? "border-accent bg-accent/10 text-text-primary"
                      : "border-border text-text-muted hover:text-text-secondary hover:bg-bg-hover"
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Component Selectors */}
          <div className="pt-1 border-t border-border/50 space-y-3">
            <CascadedDropdown
              label="STT Provider"
              options={STT_PROVIDERS}
              value={state.selectedSTT}
              onChange={(id) => {
                dispatch({ type: "SET_STT", payload: id as typeof state.selectedSTT });
                setActivePreset("custom");
              }}
            />
            <CascadedDropdown
              label="LLM Provider"
              options={LLM_PROVIDERS}
              value={state.selectedLLM}
              onChange={(id) => {
                dispatch({ type: "SET_LLM", payload: id as typeof state.selectedLLM });
                setActivePreset("custom");
              }}
            />
            {state.selectedLLM === "custom" && (
              <div className="space-y-1">
                <label className="text-[10px] text-text-muted uppercase tracking-wider">
                  Custom Endpoint
                </label>
                <input
                  type="url"
                  placeholder="https://api.example.com/v1"
                  value={state.customLlmEndpoint}
                  onChange={(e) =>
                    dispatch({
                      type: "SET_CUSTOM_LLM_ENDPOINT",
                      payload: e.target.value,
                    })
                  }
                  className="w-full bg-bg-tertiary border border-border rounded-md px-2 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
                />
              </div>
            )}
            <CascadedDropdown
              label="TTS Provider"
              options={TTS_PROVIDERS}
              value={state.selectedTTS}
              onChange={(id) => {
                dispatch({ type: "SET_TTS", payload: id as typeof state.selectedTTS });
                setActivePreset("custom");
              }}
            />
          </div>
        </div>
      )}
    </aside>
  );
}
