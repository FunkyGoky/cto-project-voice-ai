// ============================================================
// POST /api/openai/session
// Creates an ephemeral client secret for the Realtime GA API.
// The /client_secrets endpoint only needs an empty body — all
// session config (model, voice, etc.) is sent via the WebSocket
// after connecting. Returns the secret for client-side auth.
// ============================================================

import { NextResponse } from "next/server";

export async function POST() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `OpenAI client secret creation failed: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
