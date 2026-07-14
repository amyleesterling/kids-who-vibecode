UPDATE challenges SET
  prompt = 'Do something cool using real weather data.',
  brief = 'Use today’s weather or a forecast from a real place as an ingredient in your project. Turn temperature, wind, clouds, or rain into a game, character, story, sound, or work of art.',
  starter_ideas = '["Turn wind speed into a dance party","Dress a character for today’s forecast","Make the temperature control a creature’s mood"]',
  tools = '["Open-Meteo","p5.js","HTML + JS","Anything you love"]'
WHERE id = 'weird-weather';

INSERT INTO challenges (
  id, week_label, title, eyebrow, prompt, brief, opens_at, closes_at,
  voting_opens_at, voting_closes_at, status, starter_ideas, tools
) VALUES (
  'tiny-museum', 'Challenge 06 · Aug 17–23', 'Build a museum',
  'Every exhibit has a secret.',
  'Create a museum with at least three exhibits visitors can explore.',
  'Give each object something to reveal when it is tapped, clicked, or questioned. Your museum can celebrate real discoveries, favorite things, family stories, or things that could never exist.',
  '2026-08-17T13:00:00.000Z', '2026-08-24T04:00:00.000Z',
  '2026-08-24T13:00:00.000Z', '2026-08-31T13:00:00.000Z', 'upcoming',
  '["The museum of lost socks","Famous snacks through history","Artifacts from the year 3000"]',
  '["Scratch","Canva Code","HTML + CSS","Anything you love"]'
) ON CONFLICT(id) DO UPDATE SET
  week_label = excluded.week_label, title = excluded.title, eyebrow = excluded.eyebrow,
  prompt = excluded.prompt, brief = excluded.brief, opens_at = excluded.opens_at,
  closes_at = excluded.closes_at, voting_opens_at = excluded.voting_opens_at,
  voting_closes_at = excluded.voting_closes_at, starter_ideas = excluded.starter_ideas,
  tools = excluded.tools, status = excluded.status;

DELETE FROM challenges WHERE id = 'make-someone-smile';

UPDATE challenge_drafts SET
  title = 'Build a museum',
  eyebrow = 'Every exhibit has a secret.',
  prompt = 'Create a museum with at least three exhibits visitors can explore.',
  brief = 'Give each object something to reveal when it is tapped, clicked, or questioned. Your museum can celebrate real discoveries, favorite things, family stories, or things that could never exist.',
  starter_ideas = '["The museum of lost socks","Famous snacks through history","Artifacts from the year 3000"]',
  tools = '["Scratch","Canva Code","HTML + CSS","Anything you love"]',
  status = 'scheduled',
  updated_at = datetime('now')
WHERE id = 'tiny-museum';

INSERT INTO challenge_drafts (
  id, title, eyebrow, prompt, brief, starter_ideas, tools, status, created_at, updated_at
) VALUES (
  'make-someone-smile', 'Make someone smile', 'Code can be a tiny gift.',
  'Create a playful digital surprise designed to make somebody’s day a little brighter.',
  'It could tell jokes, celebrate a person, make cheerful art, or deliver a kindness mission. Build it for someone specific or for everyone.',
  '["A compliment confetti cannon","A joke-telling potato","A kindness quest"]',
  '["Scratch","Canva Code","HTML + CSS","Anything you love"]',
  'idea', datetime('now'), datetime('now')
) ON CONFLICT(id) DO UPDATE SET
  title = excluded.title, eyebrow = excluded.eyebrow, prompt = excluded.prompt,
  brief = excluded.brief, starter_ideas = excluded.starter_ideas, tools = excluded.tools,
  status = excluded.status, updated_at = excluded.updated_at;

INSERT INTO challenge_drafts (
  id, title, eyebrow, prompt, brief, starter_ideas, tools, status, created_at, updated_at
) VALUES (
  'space-postcard', 'Build a space postcard', 'Real space. Your imagination.',
  'Use a real NASA space image or fact to build an interactive postcard from somewhere beyond Earth.',
  'Choose a planet, moon, nebula, astronaut photo, or mission. Let visitors reveal a fact, hear a message, move through space, or add something imaginary—and credit the real source.',
  '["A postcard from Mars","A tour of a colorful nebula","A moon mission scrapbook"]',
  '["NASA Image Library","HTML + JS","Canva Code","Anything you love"]',
  'idea', datetime('now'), datetime('now')
) ON CONFLICT(id) DO UPDATE SET
  title = excluded.title, eyebrow = excluded.eyebrow, prompt = excluded.prompt,
  brief = excluded.brief, starter_ideas = excluded.starter_ideas, tools = excluded.tools,
  status = excluded.status, updated_at = excluded.updated_at;
