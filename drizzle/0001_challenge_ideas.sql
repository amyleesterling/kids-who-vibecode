CREATE TABLE IF NOT EXISTS challenge_ideas (
  id TEXT PRIMARY KEY,
  idea_title TEXT NOT NULL,
  idea_prompt TEXT NOT NULL,
  starter_spark TEXT,
  creator_nickname TEXT NOT NULL,
  creator_group TEXT NOT NULL,
  grownup_email TEXT NOT NULL,
  consent INTEGER NOT NULL CHECK (consent = 1),
  status TEXT NOT NULL CHECK (status IN ('pending', 'selected', 'archived')),
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS challenge_ideas_status_created_idx
  ON challenge_ideas (status, created_at);
