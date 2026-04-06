// ============================================================
// GET /api/sessions/export
// Returns all sessions as CSV for download.
// ============================================================

import { getAllSessions } from "@/lib/db/database";

export async function GET() {
  try {
    const rows = getAllSessions();

    const headers = [
      "session_id",
      "timestamp",
      "category",
      "fighter_ids",
      "prompt_hash",
      "duration_ms",
      "ttfa_ms",
      "interruption_count",
      "dead_air_gaps",
      "wer",
      "emotional_alignment",
      "tool_call_success_rate",
      "cost_usd",
      "naturalness_rating",
      "notes",
    ];

    const csvRows = rows.map((row) => {
      const metrics = JSON.parse(row.metrics_json);
      return [
        row.id,
        row.timestamp,
        row.category,
        row.fighter_ids,
        row.prompt_hash,
        row.duration_ms,
        metrics.ttfaMs ?? "",
        metrics.interruptionCount ?? "",
        metrics.deadAirGaps ?? "",
        metrics.wer ?? "",
        metrics.emotionalAlignment ?? "",
        metrics.toolCallSuccessRate ?? "",
        metrics.costUsd ?? "",
        metrics.naturalnessRating ?? "",
        `"${(row.notes || "").replace(/"/g, '""')}"`,
      ].join(",");
    });

    const csv = [headers.join(","), ...csvRows].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="arena-sessions-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
