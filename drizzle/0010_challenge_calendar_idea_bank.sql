CREATE TABLE IF NOT EXISTS challenge_drafts (
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
);

CREATE INDEX IF NOT EXISTS challenge_drafts_status_updated_idx
ON challenge_drafts (status, updated_at);

DELETE FROM challenges WHERE id = 'make-it-musical';

UPDATE challenges SET
  week_label = 'Challenge 02 · Jul 20–26',
  opens_at = '2026-07-20T13:00:00.000Z',
  closes_at = '2026-07-27T04:00:00.000Z',
  voting_opens_at = '2026-07-27T13:00:00.000Z',
  voting_closes_at = '2026-08-03T13:00:00.000Z',
  status = 'upcoming'
WHERE id = 'secret-door';

UPDATE challenges SET
  week_label = 'Challenge 06 · Aug 17–23',
  opens_at = '2026-08-17T13:00:00.000Z',
  closes_at = '2026-08-24T04:00:00.000Z',
  voting_opens_at = '2026-08-24T13:00:00.000Z',
  voting_closes_at = '2026-08-31T13:00:00.000Z',
  status = 'upcoming'
WHERE id = 'make-someone-smile';

INSERT INTO challenges (
  id, week_label, title, eyebrow, prompt, brief, opens_at, closes_at,
  voting_opens_at, voting_closes_at, status, starter_ideas, tools
) VALUES (
  'chain-reaction', 'Challenge 07 · Aug 24–30', 'Make a chain reaction',
  'One tiny tap. Total delightful chaos.',
  'Build a world where one small action sets off a surprising chain of events.',
  'Let visitors start the action, then watch at least three connected things happen. The chain can be clever, silly, useful, or completely impossible.',
  '2026-08-24T13:00:00.000Z', '2026-08-31T04:00:00.000Z',
  '2026-08-31T13:00:00.000Z', '2026-09-07T13:00:00.000Z', 'upcoming',
  '["Dominoes that make breakfast","A robot wake-up sequence","A machine that manufactures rainbows"]',
  '["Scratch","HTML + JS","p5.js","Anything you love"]'
) ON CONFLICT(id) DO UPDATE SET
  week_label = excluded.week_label, title = excluded.title, eyebrow = excluded.eyebrow,
  prompt = excluded.prompt, brief = excluded.brief, opens_at = excluded.opens_at,
  closes_at = excluded.closes_at, voting_opens_at = excluded.voting_opens_at,
  voting_closes_at = excluded.voting_closes_at, starter_ideas = excluded.starter_ideas,
  tools = excluded.tools, status = excluded.status;

INSERT OR IGNORE INTO challenge_drafts (
  id, title, eyebrow, prompt, brief, starter_ideas, tools, status, created_at, updated_at
) VALUES
  ('chain-reaction', 'Make a chain reaction', 'One tiny tap. Total delightful chaos.', 'Build a world where one small action sets off a surprising chain of events.', 'Let visitors start the action, then watch at least three connected things happen. The chain can be clever, silly, useful, or completely impossible.', '["Dominoes that make breakfast","A robot wake-up sequence","A machine that manufactures rainbows"]', '["Scratch","HTML + JS","p5.js","Anything you love"]', 'scheduled', datetime('now'), datetime('now')),
  ('tiny-museum', 'Build a tiny museum', 'Every exhibit has a secret.', 'Create a museum with at least three strange exhibits visitors can explore.', 'Give each object something to reveal when it is tapped, clicked, or questioned. Your museum can celebrate real discoveries or things that could never exist.', '["The museum of lost socks","Famous snacks through history","Artifacts from the year 3000"]', '["Scratch","Canva Code","HTML + CSS","Anything you love"]', 'idea', datetime('now'), datetime('now')),
  ('creature-translator', 'Invent a creature translator', 'Beep. Squawk. Translation, please.', 'Build a translator that helps humans understand an imaginary creature.', 'Let visitors choose a sound, symbol, mood, or phrase and discover what the creature really means. Add a few translations nobody expects.', '["Dragon sneeze dictionary","What houseplants say at night","Robot feelings decoder"]', '["Scratch","HTML + JS","Replit","Anything you love"]', 'idea', datetime('now'), datetime('now')),
  ('mixed-up-map', 'Create a mixed-up map', 'Wrong turns strongly encouraged.', 'Draw an impossible map and make its strangest places explorable.', 'Create at least three locations and a way to travel between them. Hide a shortcut, surprise, or very unhelpful landmark somewhere on the journey.', '["A map inside a giant shoe","Cloud islands connected by noodles","A neighborhood for monsters"]', '["Scratch","Twine","HTML + CSS","Anything you love"]', 'idea', datetime('now'), datetime('now')),
  ('new-holiday', 'Invent a new holiday', 'You make the rules and traditions.', 'Create a brand-new holiday and an interactive way for everyone to celebrate it.', 'Show us what the holiday celebrates, what people do, and one delightfully specific tradition. Visitors should get to join the fun.', '["International Pajama Parade","Talk Like a Sandwich Day","The Festival of Tiny Victories"]', '["Scratch","Canva Code","HTML + JS","Anything you love"]', 'idea', datetime('now'), datetime('now')),
  ('dream-machine', 'Build a dream machine', 'Pick the ingredients. Enter the dream.', 'Make a machine that combines unusual ingredients into a one-of-a-kind dream.', 'Let visitors choose two or more dream ingredients, then reveal the place, character, story, or surprise their choices create.', '["Moonlight + pancakes","Dinosaurs + ballet","Underwater library + jetpacks"]', '["Scratch","HTML + JS","p5.js","Anything you love"]', 'idea', datetime('now'), datetime('now')),
  ('living-shadow', 'Make a shadow come alive', 'It has plans of its own.', 'Create a shadow that moves, changes, or surprises us when we interact with it.', 'Give the shadow a personality and at least two reactions. It might copy its owner, disobey completely, or lead us somewhere unexpected.', '["A shadow that wants a pet","The world''s worst copycat","A shadow detective"]', '["Scratch","p5.js","HTML + CSS","Anything you love"]', 'idea', datetime('now'), datetime('now')),
  ('rescue-the-snack', 'Rescue a ridiculous snack', 'A tiny snack. An enormous quest.', 'Build an adventure where a snack is lost, trapped, or in urgent need of a hero.', 'Create a problem, a journey, and a satisfying rescue. Give visitors at least one choice or challenge that changes what happens.', '["Save the last space taco","A cupcake stuck in a volcano","The great runaway noodle"]', '["Scratch","Twine","HTML + JS","Anything you love"]', 'idea', datetime('now'), datetime('now')),
  ('wrong-button', 'Make the wrong button', 'It never does what the label says.', 'Build a button that causes a different surprising result every time someone presses it.', 'Use labels, colors, animation, sound, or story to play with expectations. Include at least three outcomes and keep every surprise friendly.', '["Do not press the potato button","A button that changes gravity","The extremely dramatic light switch"]', '["Scratch","HTML + JS","Replit","Anything you love"]', 'idea', datetime('now'), datetime('now')),
  ('tiny-theme-park', 'Build the world''s smallest theme park', 'Big thrills. Very little land.', 'Design a miniature theme park with at least three attractions visitors can try.', 'Give the park a theme, a map or menu, and interactions that make each ride or attraction feel different.', '["A park for ants","Breakfast food roller coasters","One-room outer-space park"]', '["Scratch","HTML + CSS","Canva Code","Anything you love"]', 'idea', datetime('now'), datetime('now'));
