ALTER TABLE votes ADD COLUMN fingerprint_hash TEXT;
ALTER TABLE votes ADD COLUMN created_at TEXT;

UPDATE votes SET created_at = updated_at WHERE created_at IS NULL;

CREATE INDEX IF NOT EXISTS votes_fingerprint_idx
ON votes (challenge_id, fingerprint_hash);

CREATE INDEX IF NOT EXISTS votes_updated_idx
ON votes (challenge_id, project_id, updated_at);

CREATE TABLE IF NOT EXISTS vote_alerts (
  id TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL REFERENCES challenges(id),
  project_id TEXT REFERENCES projects(id),
  signal TEXT NOT NULL CHECK (signal IN ('shared_fingerprint', 'rapid_project_spike')),
  signal_key TEXT NOT NULL,
  observed_count INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'dismissed')),
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  UNIQUE (challenge_id, signal, signal_key)
);

CREATE INDEX IF NOT EXISTS vote_alerts_status_seen_idx
ON vote_alerts (status, last_seen_at);
