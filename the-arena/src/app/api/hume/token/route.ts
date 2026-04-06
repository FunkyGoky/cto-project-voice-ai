// ============================================================
// POST /api/hume/token
// Fetches an access token from Hume using API key + secret.
// Hume EVI uses OAuth-style access tokens for WebSocket auth.
// ============================================================

import { NextResponse } from "next/server";

export async function POST() {
  const apiKey = process.env.HUME_API_KEY;
  const secretKey = process.env.HUME_SECRET_KEY;

  if (!apiKey || !secretKey) {
    return NextResponse.json(
      { error: "HUME_API_KEY or HUME_SECRET_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    // Hume uses basic auth to get an access token
    const credentials = btoa(`${apiKey}:${secretKey}`);
    const res = await fetch("https://api.hume.ai/oauth2-cc/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json(
        { error: `Hume token request failed: ${err}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ accessToken: data.access_token });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
