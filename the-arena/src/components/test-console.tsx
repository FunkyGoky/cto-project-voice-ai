"use client";

// ============================================================
// Test Console — Center-bottom panel
// Browser mic input, real-time transcript display, session timer
// with live cost estimate, audio waveform visualization.
// Wired to useSession hook for provider lifecycle.
// ============================================================

import { useRef, useEffect, useCallback } from "react";
import { useArena } from "@/lib/arena-context";
import { useSession } from "@/lib/use-session";
import { S2S_FIGHTERS, STT_PROVIDERS, TTS_PROVIDERS } from "@/lib/providers";

/** Get cost per minute for the currently selected fighter(s) */
function getActiveCostPerMin(state: ReturnType<typeof useArena>["state"]): number {
  if (state.activeCategory === "s2s") {
    const fighter = S2S_FIGHTERS.find((f) => f.id === state.selectedS2S);
    return fighter?.costPerMin ?? 0;
  }
  const stt = STT_PROVIDERS.find((p) => p.id === state.selectedSTT);
  const tts = TTS_PROVIDERS.find((p) => p.id === state.selectedTTS);
  return (stt?.costPerMin ?? 0) + (tts?.costPerMin ?? 0);
}

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/** Canvas-based waveform visualization from AnalyserNode */
function Waveform({ analyser }: { analyser: AnalyserNode | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(data);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    const sliceWidth = canvas.width / data.length;
    let x = 0;

    for (let i = 0; i < data.length; i++) {
      const v = data[i] / 128.0;
      const y = (v * canvas.height) / 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
      x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();

    rafRef.current = requestAnimationFrame(draw);
  }, [analyser]);

  useEffect(() => {
    if (analyser) {
      draw();
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [analyser, draw]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={32}
      className="w-full h-8 rounded-md bg-bg-tertiary"
    />
  );
}

export function TestConsole() {
  const { state, dispatch } = useArena();
  const { startSession, endSession, analyserRef } = useSession();
  const costPerMin = getActiveCostPerMin(state);
  const liveCost = (state.elapsedMs / 60000) * costPerMin;
  const isActive = state.sessionState === "active";
  const isIdle = state.sessionState === "idle";
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.transcript]);

  return (
    <div className="flex flex-col h-full">
      {/* Header with timer + cost */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-medium text-text-primary">
            Test Console
          </h2>
          <div className="flex items-center gap-2 text-[10px]">
            <div className="flex gap-1">
              {(["browser-mic", "twilio-phone"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() =>
                    dispatch({ type: "SET_INPUT_MODE", payload: mode })
                  }
                  className={`px-1.5 py-0.5 rounded-sm transition-colors ${
                    state.inputMode === mode
                      ? "bg-bg-tertiary text-text-primary"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {mode === "browser-mic" ? "Mic" : "Phone"}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-text-secondary">
          <span>{formatDuration(state.elapsedMs)}</span>
          <span>${liveCost.toFixed(4)}</span>
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isActive ? "bg-success animate-pulse" : "bg-text-muted"
            }`}
          />
        </div>
      </div>

      {/* Transcript area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {state.transcript.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-text-muted">
              {isIdle
                ? "Start a session to begin testing"
                : state.sessionState === "connecting"
                ? "Connecting..."
                : "Session ending..."}
            </p>
          </div>
        ) : (
          <>
            {state.transcript.map((entry, i) => (
              <div
                key={i}
                className={`flex gap-2 text-xs ${
                  entry.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-3 py-1.5 rounded-md ${
                    entry.role === "user"
                      ? "bg-accent/20 text-text-primary"
                      : "bg-bg-tertiary text-text-primary"
                  }`}
                >
                  <span className="text-[9px] text-text-muted block mb-0.5">
                    {entry.role === "user" ? "You" : "Agent"}
                    {entry.isInterruption && " (interrupted)"}
                  </span>
                  {entry.text}
                </div>
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </>
        )}
      </div>

      {/* Waveform + controls */}
      <div className="border-t border-border p-3">
        <div className="mb-3">
          {isActive ? (
            <Waveform analyser={analyserRef.current} />
          ) : (
            <div className="h-8 bg-bg-tertiary rounded-md flex items-center justify-center">
              <span className="text-[9px] text-text-muted">No audio</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center">
          {isIdle ? (
            <button
              onClick={startSession}
              className="px-4 py-2 rounded-md bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors"
            >
              Start Session
            </button>
          ) : (
            <button
              onClick={endSession}
              disabled={state.sessionState === "ending"}
              className="px-4 py-2 rounded-md bg-danger/20 text-danger text-xs font-medium hover:bg-danger/30 transition-colors disabled:opacity-50"
            >
              {state.sessionState === "ending" ? "Ending..." : "End Session"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
