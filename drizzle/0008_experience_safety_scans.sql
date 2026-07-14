CREATE TABLE IF NOT EXISTS safety_scans (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL UNIQUE REFERENCES submissions(id),
  target_url TEXT NOT NULL,
  target_kind TEXT NOT NULL CHECK (target_kind IN ('playable', 'repository')),
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'passed', 'review', 'failed', 'manual')),
  verdict TEXT,
  summary TEXT,
  categories TEXT NOT NULL DEFAULT '[]',
  actions TEXT NOT NULL DEFAULT '[]',
  technical_flags TEXT NOT NULL DEFAULT '[]',
  screenshots_reviewed INTEGER NOT NULL DEFAULT 0,
  model TEXT,
  error TEXT,
  attempt INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  started_at TEXT,
  completed_at TEXT,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS safety_scans_status_updated_idx
ON safety_scans (status, updated_at);

INSERT OR IGNORE INTO safety_scans (
  id, submission_id, target_url, target_kind, status, categories, actions,
  technical_flags, screenshots_reviewed, attempt, created_at, updated_at
)
SELECT
  lower(hex(randomblob(16))),
  id,
  CASE WHEN demo_url IS NOT NULL AND demo_url != '' THEN demo_url ELSE repo_url END,
  CASE WHEN demo_url IS NOT NULL AND demo_url != '' THEN 'playable' ELSE 'repository' END,
  CASE WHEN demo_url IS NOT NULL AND demo_url != '' THEN 'queued' ELSE 'manual' END,
  '[]', '[]', '[]', 0, 0, created_at, created_at
FROM submissions;
