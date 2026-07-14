UPDATE challenges SET
  title = 'Make someone smile',
  eyebrow = 'Code can be a tiny gift.',
  prompt = 'Create a playful digital surprise designed to make somebody''s day a little brighter.',
  brief = 'It could tell jokes, celebrate a person, make cheerful art, or deliver a kindness mission. Build it for someone specific or for everyone.',
  starter_ideas = '["A compliment confetti cannon","A joke-telling potato","A kindness quest"]',
  tools = '["Scratch","Canva Code","HTML + CSS","Anything you love"]'
WHERE id = 'invent-a-creature';

DELETE FROM challenge_drafts;

INSERT INTO challenge_drafts (
  id, title, eyebrow, prompt, brief, starter_ideas, tools, status, created_at, updated_at
) VALUES
  ('new-holiday', 'Invent a new holiday', 'Save this one for December.', 'Create a brand-new holiday and an interactive way for everyone to celebrate it.', 'Show us what the holiday celebrates, when it happens, and one delightfully specific tradition. Visitors should get to join the fun.', '["International Pajama Parade","Talk Like a Sandwich Day","The Festival of Tiny Victories"]', '["Scratch","Canva Code","HTML + JS","Anything you love"]', 'idea', datetime('now'), datetime('now')),
  ('alien-planet', 'Build a page for an alien planet', 'Visitors from Earth are welcome.', 'Create an interactive page that introduces us to a planet nobody on Earth has visited.', 'Show us the landscape, weather, creatures, food, or rules of life there. Give visitors at least one thing to explore or change.', '["A planet made of pillows","Two suns and noodle rain","A travel guide for nervous astronauts"]', '["Scratch","Canva Code","HTML + CSS","Anything you love"]', 'idea', datetime('now'), datetime('now')),
  ('invent-a-creature', 'Invent a creature', 'Odd talents encouraged.', 'Invent a creature with a home, a personality, and one very surprising talent.', 'Introduce us through a game, interactive profile, animation, or tiny world. Let visitors do something that reveals who the creature is.', '["A shy cloud dragon","A sock-eating moon mouse","A jellyfish who tells jokes"]', '["Scratch","p5.js","Replit","Anything you love"]', 'idea', datetime('now'), datetime('now')),
  ('tiny-theme-park', 'Build the world''s smallest theme park', 'Big thrills. Very little land.', 'Design a miniature theme park with at least three attractions visitors can try.', 'Give the park a theme, a map or menu, and interactions that make each ride or attraction feel different.', '["A park for ants","Breakfast-food roller coasters","One-room outer-space park"]', '["Scratch","HTML + CSS","Canva Code","Anything you love"]', 'idea', datetime('now'), datetime('now')),
  ('rescue-a-snack', 'Rescue a snack', 'A tiny snack. An enormous quest.', 'Build an adventure where a snack is lost, trapped, or in urgent need of a hero.', 'Create a problem, a journey, and a satisfying rescue. Give visitors at least one choice or challenge that changes what happens.', '["Save the last space taco","A cupcake stuck in a volcano","The great runaway noodle"]', '["Scratch","Twine","HTML + JS","Anything you love"]', 'idea', datetime('now'), datetime('now')),
  ('create-a-snack', 'Create a new snack', 'The kitchen has no rules today.', 'Invent a snack that has never existed and build an interactive way to make, name, or taste-test it.', 'Choose surprising ingredients, show what happens when they combine, and give your snack a personality, package, power, or very dramatic review.', '["Build-your-own moon crackers","A mood-changing smoothie","The world''s crunchiest cloud"]', '["Scratch","Canva Code","HTML + JS","Anything you love"]', 'idea', datetime('now'), datetime('now'));

CREATE TABLE IF NOT EXISTS reviewer_invites (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  last_used_at TEXT
);

CREATE TABLE IF NOT EXISTS reviewer_reviews (
  submission_id TEXT NOT NULL REFERENCES submissions(id),
  invite_id TEXT NOT NULL REFERENCES reviewer_invites(id),
  verdict TEXT NOT NULL CHECK (verdict IN ('ready', 'concern')),
  note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (submission_id, invite_id)
);

CREATE INDEX IF NOT EXISTS reviewer_invites_active_idx
ON reviewer_invites (revoked_at, expires_at);

CREATE INDEX IF NOT EXISTS reviewer_reviews_submission_idx
ON reviewer_reviews (submission_id, updated_at);
