"use client";

// ============================================================
// Eval Dashboard — Right panel
// Displays metrics from past sessions. Comparison view for 2+
// selected sessions. Filter by fighter, category, date range.
// CSV export button.
// ============================================================

import { useState } from "react";
import { useArena } from "@/lib/arena-context";
import type { Session, EvalMetrics, FighterCategory } from "@/types";

// ------------------------------------------------------------
// Sub-components
// ------------------------------------------------------------

function MetricCard({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number | null;
  unit?: string;
}) {
  return (
    <div className="bg-bg-tertiary rounded-md p-2">
      <span className="text-[9px] text-text-muted uppercase tracking-wider block mb-1">
        {label}
      </span>
      <span className="text-sm font-medium text-text-primary">
        {value ?? "—"}
        {unit && value != null && (
          <span className="text-[10px] text-text-secondary ml-0.5">
            {unit}
          </span>
        )}
      </span>
    </div>
  );
}

function MetricsGrid({ metrics }: { metrics: EvalMetrics }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <MetricCard label="TTFA" value={metrics.ttfaMs} unit="ms" />
      <MetricCard label="Cost" value={`$${metrics.costUsd.toFixed(4)}`} />
      <MetricCard label="Interruptions" value={metrics.interruptionCount} />
      <MetricCard label="Dead Air" value={metrics.deadAirGaps} unit="gaps" />
      <MetricCard
        label="WER"
        value={metrics.wer != null ? `${(metrics.wer * 100).toFixed(1)}%` : null}
      />
      <MetricCard label="Naturalness" value={metrics.naturalnessRating} unit="/5" />
      <MetricCard
        label="Tool Success"
        value={
          metrics.toolCallSuccessRate != null
            ? `${(metrics.toolCallSuccessRate * 100).toFixed(0)}%`
            : null
        }
      />
      <MetricCard
        label="Emotion"
        value={
          metrics.emotionalAlignment != null
            ? `${(metrics.emotionalAlignment * 100).toFixed(0)}%`
            : null
        }
      />
    </div>
  );
}

/** Side-by-side comparison table for 2+ sessions */
function ComparisonTable({ sessions }: { sessions: Session[] }) {
  const metricKeys: { key: keyof EvalMetrics; label: string; fmt: (v: unknown) => string }[] = [
    { key: "ttfaMs", label: "TTFA (ms)", fmt: (v) => (v != null ? String(v) : "—") },
    { key: "costUsd", label: "Cost ($)", fmt: (v) => (v != null ? `$${(v as number).toFixed(4)}` : "—") },
    { key: "interruptionCount", label: "Interruptions", fmt: (v) => String(v ?? "—") },
    { key: "deadAirGaps", label: "Dead Air Gaps", fmt: (v) => String(v ?? "—") },
    { key: "wer", label: "WER", fmt: (v) => (v != null ? `${((v as number) * 100).toFixed(1)}%` : "—") },
    { key: "naturalnessRating", label: "Naturalness", fmt: (v) => (v != null ? `${v}/5` : "—") },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[10px]">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-1.5 px-2 text-text-muted font-normal">
              Metric
            </th>
            {sessions.map((s) => (
              <th
                key={s.id}
                className="text-right py-1.5 px-2 text-text-secondary font-medium"
              >
                <span className="block truncate max-w-[80px]">
                  {s.fighterIds}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metricKeys.map(({ key, label, fmt }) => (
            <tr key={key} className="border-b border-border/50">
              <td className="py-1.5 px-2 text-text-muted">{label}</td>
              {sessions.map((s) => (
                <td
                  key={s.id}
                  className="text-right py-1.5 px-2 text-text-primary"
                >
                  {fmt(s.metrics[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SessionRow({
  session,
  selected,
  onToggle,
}: {
  session: Session;
  selected: boolean;
  onToggle: () => void;
}) {
  const date = new Date(session.timestamp);
  const categoryColor =
    session.category === "s2s" ? "text-s2s-badge" : "text-cascaded-badge";

  return (
    <button
      onClick={onToggle}
      className={`w-full text-left px-2 py-1.5 rounded-sm text-xs transition-colors ${
        selected
          ? "bg-accent/20 text-text-primary"
          : "text-text-secondary hover:bg-bg-hover"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`text-[9px] ${categoryColor}`}>
            {session.category === "s2s" ? "S2S" : "CAS"}
          </span>
          <span className="truncate">{session.fighterIds}</span>
        </div>
        <span className="text-[9px] text-text-muted shrink-0 ml-2">
          {date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      </div>
    </button>
  );
}

// ------------------------------------------------------------
// Main Component
// ------------------------------------------------------------

export function EvalDashboard() {
  const { state, dispatch } = useArena();
  const [filterCategory, setFilterCategory] = useState<FighterCategory | "all">("all");

  // Filter sessions
  const filteredSessions =
    filterCategory === "all"
      ? state.sessions
      : state.sessions.filter((s) => s.category === filterCategory);

  const selectedSessions = filteredSessions.filter((s) =>
    state.selectedSessionIds.includes(s.id)
  );

  const latest = selectedSessions[0] || filteredSessions[0];
  const isComparing = selectedSessions.length >= 2;

  function handleExport() {
    window.open("/api/sessions/export", "_blank");
  }

  return (
    <aside className="w-72 shrink-0 border-l border-border bg-bg-secondary flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border flex items-center justify-between">
        <h2 className="text-xs font-medium text-text-primary">Evaluation</h2>
        <div className="flex items-center gap-2">
          {isComparing && (
            <span className="text-[10px] text-accent">
              {selectedSessions.length} compared
            </span>
          )}
          <button
            onClick={handleExport}
            className="text-[9px] px-1.5 py-0.5 rounded-sm border border-border text-text-muted hover:text-text-secondary hover:bg-bg-hover transition-colors"
            title="Export all sessions as CSV"
          >
            CSV
          </button>
        </div>
      </div>

      {/* Metrics or Comparison */}
      <div className="p-3">
        {isComparing ? (
          <ComparisonTable sessions={selectedSessions} />
        ) : latest ? (
          <MetricsGrid metrics={latest.metrics} />
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-xs text-text-muted">
              No sessions yet. Run a test to see metrics.
            </p>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="px-3 pb-2 flex items-center gap-1">
        {(["all", "s2s", "cascaded"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`text-[9px] px-1.5 py-0.5 rounded-sm transition-colors ${
              filterCategory === cat
                ? "bg-bg-tertiary text-text-primary"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {cat === "all" ? "All" : cat === "s2s" ? "S2S" : "Cascaded"}
          </button>
        ))}
      </div>

      {/* Session History */}
      <div className="border-t border-border flex-1 overflow-y-auto">
        <div className="px-3 py-2 flex items-center justify-between">
          <span className="text-[10px] text-text-muted uppercase tracking-wider">
            History ({filteredSessions.length})
          </span>
          {state.selectedSessionIds.length > 0 && (
            <button
              onClick={() => dispatch({ type: "CLEAR_SESSION_SELECTION" })}
              className="text-[9px] text-text-muted hover:text-text-secondary"
            >
              Clear
            </button>
          )}
        </div>
        <div className="px-2 pb-3 space-y-0.5">
          {filteredSessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              selected={state.selectedSessionIds.includes(session.id)}
              onToggle={() =>
                dispatch({
                  type: "TOGGLE_SESSION_SELECTION",
                  payload: session.id,
                })
              }
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
