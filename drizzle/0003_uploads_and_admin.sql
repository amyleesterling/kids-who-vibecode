ALTER TABLE submissions ADD COLUMN image_key TEXT;
ALTER TABLE submissions ADD COLUMN image_name TEXT;
ALTER TABLE submissions ADD COLUMN image_content_type TEXT;
ALTER TABLE submissions ADD COLUMN image_size INTEGER;
ALTER TABLE projects ADD COLUMN image_key TEXT;

CREATE TABLE IF NOT EXISTS moderation_events (
  id TEXT PRIMARY KEY,
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  ip_hash TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL,
  window_started TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS moderation_events_item_idx
  ON moderation_events (item_type, item_id, created_at);
