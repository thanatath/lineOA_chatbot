import { neon } from "@neondatabase/serverless";

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL environment variable is not set");
  return neon(url);
}

let schemaInitialized = false;

export async function ensureSchema() {
  if (schemaInitialized) return;

  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS channels (
      user_id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      picture_url TEXT,
      last_message_at BIGINT NOT NULL DEFAULT 0,
      unread_count INTEGER NOT NULL DEFAULT 0
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      channel_user_id TEXT NOT NULL REFERENCES channels(user_id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      sender TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
      "timestamp" BIGINT NOT NULL
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_messages_channel_ts
    ON messages(channel_user_id, "timestamp")
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      auto_response_enabled BOOLEAN NOT NULL DEFAULT true,
      system_prompt TEXT NOT NULL DEFAULT ''
    )
  `;

  await sql`
    INSERT INTO settings (id, auto_response_enabled, system_prompt)
    VALUES (1, true, '')
    ON CONFLICT (id) DO NOTHING
  `;

  schemaInitialized = true;
}
