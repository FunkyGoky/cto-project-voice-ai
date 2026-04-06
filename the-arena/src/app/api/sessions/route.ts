// ============================================================
// GET/POST /api/sessions
// GET  — Returns all sessions from SQLite
// POST — Saves a new session to SQLite
// ============================================================

import { NextResponse } from "next/server";
import { insertSession, getAllSessions, type SessionRow } from "@/lib/db/database";

export async function GET() {
  try {
    const rows = getAllSessions();
    // Parse JSON columns for the client
    const sessions = rows.map((row) => ({
      id: row.id,
      timestamp: row.timestamp,
      category: row.category,
      fighterIds: row.fighter_ids,
      promptHash: row.prompt_hash,
      prompt: row.prompt,
      params: JSON.parse(row.params_json),
      transcript: JSON.parse(row.transcript_json),
      metrics: JSON.parse(row.metrics_json),
      referenceText: row.reference_text,
      notes: row.notes,
      durationMs: row.duration_ms,
    }));
    return NextResponse.json(sessions);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const row: SessionRow = {
      id: body.id,
      timestamp: body.timestamp,
      category: body.category,
      fighter_ids: body.fighterIds,
      prompt_hash: body.promptHash,
      prompt: body.prompt,
      params_json: JSON.stringify(body.params),
      transcript_json: JSON.stringify(body.transcript),
      metrics_json: JSON.stringify(body.metrics),
      reference_text: body.referenceText || null,
      notes: body.notes || "",
      duration_ms: body.durationMs,
    };

    insertSession(row);
    return NextResponse.json({ success: true, id: row.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
