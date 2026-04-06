"use client";

// ============================================================
// The Arena — Main Page
// 5-panel layout: Fight Card | Prompt + Console | Params + Eval
// ============================================================

import { ArenaProvider } from "@/lib/arena-context";
import { FightCard } from "@/components/fight-card";
import { PromptEditor } from "@/components/prompt-editor";
import { ParamControls } from "@/components/param-controls";
import { TestConsole } from "@/components/test-console";
import { EvalDashboard } from "@/components/eval-dashboard";
import { ReferencePanel } from "@/components/reference-panel";

export default function ArenaPage() {
  return (
    <ArenaProvider>
      <div className="flex h-full bg-bg-primary">
        {/* Left sidebar — Fight Card */}
        <FightCard />

        {/* Center — Prompt Editor (top) + Test Console (bottom) */}
        <main className="flex-1 flex flex-col min-w-0 border-r border-border">
          {/* Top: Prompt + Params side by side */}
          <div className="flex flex-1 min-h-0 border-b border-border">
            {/* Prompt Editor */}
            <div className="flex-1 min-w-0 border-r border-border">
              <PromptEditor />
            </div>
            {/* Parameter Controls */}
            <div className="w-56 shrink-0">
              <ParamControls />
            </div>
          </div>

          {/* Bottom: Test Console */}
          <div className="h-[45%] shrink-0 flex flex-col overflow-hidden">
            <div className="flex-1 min-h-0">
              <TestConsole />
            </div>
            <ReferencePanel />
          </div>
        </main>

        {/* Right sidebar — Eval Dashboard */}
        <EvalDashboard />
      </div>
    </ArenaProvider>
  );
}
