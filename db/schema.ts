import type { ClubDatabase } from '../worker/index'
import { scheduledChallenges } from './challenges'

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
    updated_at TEXT NOT NULL,
    PRIMARY KEY (challenge_id, voter_id)
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
    status TEXT NOT NULL CHECK (status IN ('pending', 'selected', 'archived')),
    created_at TEXT NOT NULL
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
  `CREATE TABLE IF NOT EXISTS admin_login_attempts (
    ip_hash TEXT PRIMARY KEY,
    attempts INTEGER NOT NULL,
    window_started TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS projects_challenge_status_idx ON projects (challenge_id, status)`,
  `CREATE INDEX IF NOT EXISTS votes_project_idx ON votes (project_id)`,
  `CREATE INDEX IF NOT EXISTS submissions_status_created_idx ON submissions (status, created_at)`,
  `CREATE INDEX IF NOT EXISTS challenge_ideas_status_created_idx ON challenge_ideas (status, created_at)`,
  `CREATE INDEX IF NOT EXISTS subscribers_status_created_idx ON subscribers (status, created_at)`,
  `CREATE INDEX IF NOT EXISTS moderation_events_item_idx ON moderation_events (item_type, item_id, created_at)`,
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

  const projects = [
    ['mossy-moon', 'Mossy Moon', 'PixelPanda', '7–9', 'Grow glowing space plants and wake up the moon bugs.', 'https://github.com/', '', 18, 'space', '#b9f44a'],
    ['bubble-town', 'Bubble Town', 'RainbowRex', '5–6', 'A whole town where every building can float away.', '', '', 14, 'ocean', '#65d9ff'],
    ['snack-forest', 'The Snack Forest', 'CodeKoala', '7–9', 'Help a tiny monster find the legendary golden toast.', 'https://github.com/', '', 11, 'garden', '#ffb3c7'],
    ['monster-disco', 'Monster Disco', 'BugBunny', '5–6', 'Tap the beat and give every monster a silly dance.', '', '', 9, 'monster', '#ffcb45'],
  ].map((project) => db.prepare(`
    INSERT OR IGNORE INTO projects (
      id, challenge_id, title, builder, age_band, description, repo_url, demo_url,
      base_votes, scene, accent, status
    ) VALUES (?, 'tiny-worlds', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')
  `).bind(...project))

  await db.batch([...challenges, ...projects])
  const now = new Date().toISOString()
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
