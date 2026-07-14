ALTER TABLE submissions ADD COLUMN terms_accepted INTEGER NOT NULL DEFAULT 0;

ALTER TABLE submissions ADD COLUMN terms_version TEXT;

ALTER TABLE challenge_ideas ADD COLUMN terms_accepted INTEGER NOT NULL DEFAULT 0;

ALTER TABLE challenge_ideas ADD COLUMN terms_version TEXT;
