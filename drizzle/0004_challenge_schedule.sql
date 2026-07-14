ALTER TABLE challenges ADD COLUMN opens_at TEXT;
ALTER TABLE challenges ADD COLUMN voting_opens_at TEXT;
ALTER TABLE challenges ADD COLUMN voting_closes_at TEXT;

UPDATE challenges
SET opens_at = '2026-07-13T13:00:00.000Z',
    closes_at = '2026-07-20T04:00:00.000Z',
    voting_opens_at = '2026-07-20T13:00:00.000Z',
    voting_closes_at = '2026-07-27T13:00:00.000Z',
    week_label = 'Challenge 01 · Jul 13–19'
WHERE id = 'tiny-worlds';

CREATE INDEX IF NOT EXISTS challenges_schedule_idx
  ON challenges (opens_at, closes_at, voting_opens_at, voting_closes_at);
