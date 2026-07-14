import type { ClubDatabase } from '../worker/index'
import { scheduledChallenges } from './challenges'
import { challengeDraftSeeds } from './challengeDrafts'

export const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS challenges (
    id TEXT PRIMARY KEY,
    week_label TEXT NOT NULL,
    title TEXT NOT NULL,
    eyebrow TEXT NOT NULL,
    prompt TEXT NOT NULL,
    brief TEXT NOT NULL,
    opens_at TEXT NOT NULL,
    closes_at TEXT NOT NULL,
    voting_opens_at TEXT NOT NULL,
    voting_closes_at TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'upcoming', 'closed')),
    starter_ideas TEXT NOT NULL,
    tools TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS projects (
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
    image_key TEXT,
    status TEXT NOT NULL CHECK (status IN ('approved', 'hidden'))
  )`,
  `CREATE TABLE IF NOT EXISTS votes (
    challenge_id TEXT NOT NULL REFERENCES challenges(id),
    voter_id TEXT NOT NULL,
    project_id TEXT NOT NULL REFERENCES projects(id),
    fingerprint_hash TEXT,
    created_at TEXT,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (challenge_id, voter_id)
  )`,
  `CREATE TABLE IF NOT EXISTS vote_alerts (
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
  )`,
  `CREATE TABLE IF NOT EXISTS reviewer_invites (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    revoked_at TEXT,
    last_used_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS reviewer_reviews (
    submission_id TEXT NOT NULL REFERENCES submissions(id),
    invite_id TEXT NOT NULL REFERENCES reviewer_invites(id),
    verdict TEXT NOT NULL CHECK (verdict IN ('ready', 'concern')),
    note TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (submission_id, invite_id)
  )`,
  `CREATE TABLE IF NOT EXISTS submissions (
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
    child_led INTEGER NOT NULL CHECK (child_led = 1),
    terms_accepted INTEGER NOT NULL CHECK (terms_accepted = 1),
    terms_version TEXT NOT NULL,
    image_key TEXT,
    image_name TEXT,
    image_content_type TEXT,
    image_size INTEGER,
    status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS challenge_ideas (
    id TEXT PRIMARY KEY,
    idea_title TEXT NOT NULL,
    idea_prompt TEXT NOT NULL,
    starter_spark TEXT,
    creator_nickname TEXT NOT NULL,
    creator_group TEXT NOT NULL,
    grownup_email TEXT NOT NULL,
    consent INTEGER NOT NULL CHECK (consent = 1),
    terms_accepted INTEGER NOT NULL CHECK (terms_accepted = 1),
    terms_version TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'selected', 'archived')),
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS challenge_drafts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    eyebrow TEXT NOT NULL,
    prompt TEXT NOT NULL,
    brief TEXT NOT NULL,
    starter_ideas TEXT NOT NULL,
    tools TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('idea', 'scheduled', 'archived')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS subscribers (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    adult_consent INTEGER NOT NULL CHECK (adult_consent = 1),
    status TEXT NOT NULL CHECK (status IN ('active', 'unsubscribed')),
    unsubscribe_token TEXT NOT NULL UNIQUE,
    source TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS newsletter_deliveries (
    challenge_id TEXT NOT NULL REFERENCES challenges(id),
    email TEXT NOT NULL,
    provider_id TEXT,
    sent_at TEXT NOT NULL,
    PRIMARY KEY (challenge_id, email)
  )`,
  `CREATE TABLE IF NOT EXISTS moderation_events (
    id TEXT PRIMARY KEY,
    item_type TEXT NOT NULL,
    item_id TEXT NOT NULL,
    action TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS safety_scans (
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
  )`,
  `CREATE TABLE IF NOT EXISTS admin_login_attempts (
    ip_hash TEXT PRIMARY KEY,
    attempts INTEGER NOT NULL,
    window_started TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS projects_challenge_status_idx ON projects (challenge_id, status)`,
  `CREATE INDEX IF NOT EXISTS votes_project_idx ON votes (project_id)`,
  `CREATE INDEX IF NOT EXISTS votes_fingerprint_idx ON votes (challenge_id, fingerprint_hash)`,
  `CREATE INDEX IF NOT EXISTS votes_updated_idx ON votes (challenge_id, project_id, updated_at)`,
  `CREATE INDEX IF NOT EXISTS vote_alerts_status_seen_idx ON vote_alerts (status, last_seen_at)`,
  `CREATE INDEX IF NOT EXISTS reviewer_invites_active_idx ON reviewer_invites (revoked_at, expires_at)`,
  `CREATE INDEX IF NOT EXISTS reviewer_reviews_submission_idx ON reviewer_reviews (submission_id, updated_at)`,
  `CREATE INDEX IF NOT EXISTS submissions_status_created_idx ON submissions (status, created_at)`,
  `CREATE INDEX IF NOT EXISTS challenge_ideas_status_created_idx ON challenge_ideas (status, created_at)`,
  `CREATE INDEX IF NOT EXISTS challenge_drafts_status_updated_idx ON challenge_drafts (status, updated_at)`,
  `CREATE INDEX IF NOT EXISTS subscribers_status_created_idx ON subscribers (status, created_at)`,
  `CREATE INDEX IF NOT EXISTS moderation_events_item_idx ON moderation_events (item_type, item_id, created_at)`,
  `CREATE INDEX IF NOT EXISTS safety_scans_status_updated_idx ON safety_scans (status, updated_at)`,
  `CREATE INDEX IF NOT EXISTS challenges_schedule_idx ON challenges (opens_at, closes_at, voting_opens_at, voting_closes_at)`,
]

export async function ensureDatabase(db: ClubDatabase) {
  await db.batch(schemaStatements.map((statement) => db.prepare(statement)))
}

export async function seedDatabase(db: ClubDatabase) {
  const challenges = scheduledChallenges.map((challenge) => db.prepare(`
    INSERT OR IGNORE INTO challenges (
      id, week_label, title, eyebrow, prompt, brief, opens_at, closes_at,
      voting_opens_at, voting_closes_at, status, starter_ideas, tools
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'upcoming', ?, ?)
  `).bind(
    challenge.id, challenge.weekLabel, challenge.title, challenge.eyebrow, challenge.prompt, challenge.brief,
    challenge.opensAt, challenge.closesAt, challenge.votingOpensAt, challenge.votingClosesAt,
    JSON.stringify(challenge.starterIdeas), JSON.stringify(challenge.tools),
  ))

  await db.batch(challenges)
  const now = new Date().toISOString()
  await db.batch(challengeDraftSeeds.map((draft) => db.prepare(`
    INSERT OR IGNORE INTO challenge_drafts (
      id, title, eyebrow, prompt, brief, starter_ideas, tools, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    draft.id, draft.title, draft.eyebrow, draft.prompt, draft.brief,
    JSON.stringify(draft.starterIdeas), JSON.stringify(draft.tools), draft.status, now, now,
  )))
  await db.prepare(`
    UPDATE challenges SET status = CASE
      WHEN id = (
        SELECT id FROM challenges
        WHERE opens_at <= ? AND voting_closes_at > ?
        ORDER BY opens_at DESC LIMIT 1
      ) THEN 'active'
      WHEN opens_at > ? THEN 'upcoming'
      ELSE 'closed'
    END
  `).bind(now, now, now).run()
}
