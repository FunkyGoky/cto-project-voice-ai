// ============================================================
// Database — SQLite persistence for test sessions
// Uses better-sqlite3 for synchronous, server-side operations.
// Schema: single sessions table with JSON columns for
// transcript, params, and metrics.
// ============================================================

import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "arena.db");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL"); // Better concurrent read performance
    initSchema(db);
  }
  return db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      category TEXT NOT NULL,
      fighter_ids TEXT NOT NULL,
      prompt_hash TEXT NOT NULL,
      prompt TEXT NOT NULL,
      params_json TEXT NOT NULL,
      transcript_json TEXT NOT NULL,
      metrics_json TEXT NOT NULL,
      reference_text TEXT,
      notes TEXT DEFAULT '',
      duration_ms INTEGER NOT NULL
    )
  `);
}

// ------------------------------------------------------------
// CRUD operations
// ------------------------------------------------------------

export interface SessionRow {
  id: string;
  timestamp: string;
  category: string;
  fighter_ids: string;
  prompt_hash: string;
  prompt: string;
  params_json: string;
  transcript_json: string;
  metrics_json: string;
  reference_text: string | null;
  notes: string;
  duration_ms: number;
}

export function insertSession(row: SessionRow) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO sessions (id, timestamp, category, fighter_ids, prompt_hash,
      prompt, params_json, transcript_json, metrics_json, reference_text,
      notes, duration_ms)
    VALUES (@id, @timestamp, @category, @fighter_ids, @prompt_hash,
      @prompt, @params_json, @transcript_json, @metrics_json,
      @reference_text, @notes, @duration_ms)
  `);
  stmt.run(row);
}

export function getAllSessions(): SessionRow[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM sessions ORDER BY timestamp DESC")
    .all() as SessionRow[];
}

export function getSessionById(id: string): SessionRow | undefined {
  const db = getDb();
  return db
    .prepare("SELECT * FROM sessions WHERE id = ?")
    .get(id) as SessionRow | undefined;
}

export function deleteSession(id: string) {
  const db = getDb();
  db.prepare("DELETE FROM sessions WHERE id = ?").run(id);
}
