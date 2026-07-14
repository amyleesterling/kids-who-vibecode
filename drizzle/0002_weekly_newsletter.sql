CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  adult_consent INTEGER NOT NULL CHECK (adult_consent = 1),
  status TEXT NOT NULL CHECK (status IN ('active', 'unsubscribed')),
  unsubscribe_token TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS newsletter_deliveries (
  challenge_id TEXT NOT NULL REFERENCES challenges(id),
  email TEXT NOT NULL,
  provider_id TEXT,
  sent_at TEXT NOT NULL,
  PRIMARY KEY (challenge_id, email)
);

CREATE INDEX IF NOT EXISTS subscribers_status_created_idx
  ON subscribers (status, created_at);
