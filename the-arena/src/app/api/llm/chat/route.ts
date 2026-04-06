// ============================================================
// POST /api/llm/chat
// Proxies chat completions to the selected LLM provider.
// Streams responses using ReadableStream for low latency.
// Supports: OpenAI, Anthropic (via OpenAI compat), Gemini, custom.
// ============================================================

import { NextResponse } from "next/server";

interface ChatRequest {
  provider: string;
  model: string;
  messages: { role: string; content: string }[];
  temperature: number;
  systemPrompt: string;
  customEndpoint?: string;
}

/** Map provider ID to API endpoint and key */
function getEndpointConfig(provider: string, customEndpoint?: string) {
  switch (provider) {
    case "openai-gpt5":
    case "openai-gpt4o":
      return {
        url: "https://api.openai.com/v1/chat/completions",
        key: process.env.OPENAI_API_KEY,
        model: provider === "openai-gpt5" ? "gpt-5" : "gpt-4o",
      };
    case "anthropic-sonnet":
      // Use Anthropic's OpenAI-compatible endpoint
      return {
        url: "https://api.anthropic.com/v1/messages",
        key: process.env.ANTHROPIC_API_KEY,
        model: "claude-sonnet-4-6",
        isAnthropic: true,
      };
    case "gemini-flash":
      return {
        url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent",
        key: process.env.GOOGLE_GEMINI_API_KEY,
        model: "gemini-2.5-flash",
        isGemini: true,
      };
    case "custom":
      return {
        url: customEndpoint || "",
        key: process.env.CUSTOM_LLM_API_KEY || "", // Separate key — never send provider keys to arbitrary endpoints
        model: "default",
      };
    default:
      return null;
  }
}

export async function POST(request: Request) {
  try {
    const body: ChatRequest = await request.json();
    const config = getEndpointConfig(body.provider, body.customEndpoint);

    if (!config || !config.key) {
      return NextResponse.json(
        { error: `Provider ${body.provider} not configured` },
        { status: 500 }
      );
    }

    // Anthropic uses a different API format
    if ("isAnthropic" in config && config.isAnthropic) {
      const res = await fetch(config.url, {
        method: "POST",
        headers: {
          "x-api-key": config.key,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: config.model,
          max_tokens: 1024,
          system: body.systemPrompt,
          messages: body.messages,
          stream: true,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json({ error: err }, { status: res.status });
      }

      // Stream Anthropic SSE through to client
      return new Response(res.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Gemini uses its own format — pass key via header to avoid URL logging leaks
    if ("isGemini" in config && config.isGemini) {
      const res = await fetch(config.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": config.key!,
        },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: body.systemPrompt }] },
            ...body.messages.map((m) => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }],
            })),
          ],
          generationConfig: { temperature: body.temperature },
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        return NextResponse.json({ error: err }, { status: res.status });
      }

      return new Response(res.body, {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
      });
    }

    // OpenAI-compatible (default path)
    const messages = [
      { role: "system", content: body.systemPrompt },
      ...body.messages,
    ];

    const res = await fetch(config.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: body.model || config.model,
        messages,
        temperature: body.temperature,
        stream: true,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    // Stream SSE through to client
    return new Response(res.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
