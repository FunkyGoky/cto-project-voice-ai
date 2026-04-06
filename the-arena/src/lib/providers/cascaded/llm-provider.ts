// ============================================================
// LLM Provider — Streams chat completions via server proxy
// Sends requests to /api/llm/chat which routes to the selected
// LLM provider (OpenAI, Anthropic, Gemini, custom).
// ============================================================

import type { LLMProvider } from "../cascaded-provider";

export class ProxiedLLMProvider implements LLMProvider {
  readonly id: string;
  readonly name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  async *streamCompletion(
    systemPrompt: string,
    messages: { role: "user" | "assistant"; content: string }[],
    options: { temperature: number; model: string }
  ): AsyncGenerator<string, void, unknown> {
    const res = await fetch("/api/llm/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: this.id,
        model: options.model,
        messages,
        temperature: options.temperature,
        systemPrompt,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "LLM request failed");
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No response stream");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse SSE events
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6).trim();
        if (data === "[DONE]") return;

        try {
          const parsed = JSON.parse(data);
          // OpenAI format
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) yield delta;

          // Anthropic format
          if (parsed.type === "content_block_delta") {
            const text = parsed.delta?.text;
            if (text) yield text;
          }
        } catch {
          // Skip malformed SSE lines
        }
      }
    }
  }
}
