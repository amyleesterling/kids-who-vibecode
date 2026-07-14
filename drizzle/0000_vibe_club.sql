CREATE TABLE IF NOT EXISTS challenges (
  id TEXT PRIMARY KEY,
  week_label TEXT NOT NULL,
  title TEXT NOT NULL,
  eyebrow TEXT NOT NULL,
  prompt TEXT NOT NULL,
  brief TEXT NOT NULL,
  closes_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'upcoming', 'closed')),
  starter_ideas TEXT NOT NULL,
  tools TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL REFERENCES challenges(id),
  title TEXT NOT NULL,
  builder TEXT NOT NULL,
  age_band TEXT NOT NULL,
  description TEXT NOT NULL,
  repo_url TEXT,
  demo_url TEXT,
  base_votes INTEGER NOT NULL DEFAULT 0,
  scene TEXT NOT NULL,
  accent TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('approved', 'hidden'))
);

CREATE TABLE IF NOT EXISTS votes (
  challenge_id TEXT NOT NULL REFERENCES challenges(id),
  voter_id TEXT NOT NULL,
  project_id TEXT NOT NULL REFERENCES projects(id),
  updated_at TEXT NOT NULL,
  PRIMARY KEY (challenge_id, voter_id)
);

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL REFERENCES challenges(id),
  child_nickname TEXT NOT NULL,
  age_band TEXT NOT NULL,
  project_title TEXT NOT NULL,
  description TEXT NOT NULL,
  repo_url TEXT NOT NULL,
  demo_url TEXT,
  parent_name TEXT NOT NULL,
  parent_email TEXT NOT NULL,
  consent INTEGER NOT NULL CHECK (consent = 1),
  public_sharing INTEGER NOT NULL CHECK (public_sharing = 1),
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS projects_challenge_status_idx ON projects (challenge_id, status);
CREATE INDEX IF NOT EXISTS votes_project_idx ON votes (project_id);
CREATE INDEX IF NOT EXISTS submissions_status_created_idx ON submissions (status, created_at);
