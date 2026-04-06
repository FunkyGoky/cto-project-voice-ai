"use client";

// ============================================================
// Prompt Editor — Center-top panel
// Shared system prompt used across all fighters.
// Includes token counter and save/load prompt templates.
// ============================================================

import { useState, useEffect } from "react";
import { useArena } from "@/lib/arena-context";
import type { PromptTemplate } from "@/types";

/** Rough token estimate: ~4 chars per token for English text */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

const TEMPLATES_KEY = "arena-prompt-templates";

function loadTemplates(): PromptTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(TEMPLATES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveTemplates(templates: PromptTemplate[]) {
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

export function PromptEditor() {
  const { state, dispatch } = useArena();
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const tokens = estimateTokens(state.systemPrompt);

  // Load templates from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    if (state.promptTemplates.length === 0) {
      const stored = loadTemplates();
      if (stored.length > 0) {
        dispatch({ type: "SET_PROMPT_TEMPLATES", payload: stored });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSaveTemplate() {
    if (!templateName.trim()) return;
    const template: PromptTemplate = {
      id: crypto.randomUUID(),
      name: templateName.trim(),
      content: state.systemPrompt,
      createdAt: new Date().toISOString(),
    };
    const updated = [...state.promptTemplates, template];
    dispatch({ type: "SET_PROMPT_TEMPLATES", payload: updated });
    saveTemplates(updated);
    setTemplateName("");
  }

  function handleLoadTemplate(template: PromptTemplate) {
    dispatch({ type: "SET_PROMPT", payload: template.content });
    setShowTemplates(false);
  }

  function handleDeleteTemplate(id: string) {
    const updated = state.promptTemplates.filter((t) => t.id !== id);
    dispatch({ type: "SET_PROMPT_TEMPLATES", payload: updated });
    saveTemplates(updated);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-medium text-text-primary">
            System Prompt
          </h2>
          <span className="text-[10px] text-text-muted">
            ~{tokens.toLocaleString()} tokens
          </span>
        </div>
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="text-[10px] px-2 py-1 rounded-sm border border-border text-text-secondary hover:bg-bg-hover transition-colors"
        >
          Templates
        </button>
      </div>

      {/* Templates Dropdown */}
      {showTemplates && (
        <div className="border-b border-border bg-bg-tertiary p-3 space-y-2">
          {/* Save current */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Template name..."
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveTemplate()}
              className="flex-1 bg-bg-primary border border-border rounded-sm px-2 py-1 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent"
            />
            <button
              onClick={handleSaveTemplate}
              className="text-[10px] px-2 py-1 rounded-sm bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
            >
              Save
            </button>
          </div>
          {/* Saved templates list */}
          {state.promptTemplates.length === 0 ? (
            <p className="text-[10px] text-text-muted">No saved templates</p>
          ) : (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {state.promptTemplates.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-1.5 rounded-sm hover:bg-bg-hover"
                >
                  <button
                    onClick={() => handleLoadTemplate(t)}
                    className="text-xs text-text-primary hover:text-accent"
                  >
                    {t.name}
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(t.id)}
                    className="text-[10px] text-text-muted hover:text-danger"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Editor */}
      <textarea
        value={state.systemPrompt}
        onChange={(e) =>
          dispatch({ type: "SET_PROMPT", payload: e.target.value })
        }
        placeholder="Enter your system prompt here..."
        className="flex-1 p-3 bg-bg-primary text-xs leading-relaxed text-text-primary placeholder:text-text-muted resize-none focus:outline-none"
        spellCheck={false}
      />
    </div>
  );
}
