"use client";

// ============================================================
// Reference Panel — Collapsible bottom area
// Paste knowledge base content or reference transcripts.
// Feeds into eval for hallucination/accuracy scoring (WER).
// ============================================================

import { useState } from "react";
import { useArena } from "@/lib/arena-context";

export function ReferencePanel() {
  const { state, dispatch } = useArena();
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="border-t border-border">
      {/* Toggle header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-bg-hover transition-colors"
      >
        <span className="text-[10px] text-text-muted uppercase tracking-wider">
          Reference Data
          {state.referenceText && (
            <span className="ml-1.5 text-success">
              ({state.referenceText.length} chars)
            </span>
          )}
        </span>
        <span className="text-[10px] text-text-muted">
          {collapsed ? "+" : "-"}
        </span>
      </button>

      {/* Content */}
      {!collapsed && (
        <div className="p-3">
          <textarea
            value={state.referenceText}
            onChange={(e) =>
              dispatch({ type: "SET_REFERENCE_TEXT", payload: e.target.value })
            }
            placeholder="Paste reference transcript or knowledge base content for accuracy scoring..."
            rows={4}
            className="w-full bg-bg-primary border border-border rounded-md p-2 text-xs text-text-primary placeholder:text-text-muted resize-y focus:outline-none focus:border-accent"
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
}
