INSERT INTO challenge_drafts (
  id,
  title,
  eyebrow,
  prompt,
  brief,
  starter_ideas,
  tools,
  status,
  created_at,
  updated_at
) VALUES (
  'mixed-up-map',
  'Create a mixed-up map',
  'Wrong turns strongly encouraged.',
  'Draw an impossible map and make its strangest places explorable.',
  'Create at least three locations and a way to travel between them. Hide a shortcut, surprise, or very unhelpful landmark somewhere on the journey.',
  '["A map inside a giant shoe","Cloud islands connected by noodles","A neighborhood for monsters"]',
  '["Scratch","Twine","HTML + CSS","Anything you love"]',
  'idea',
  datetime('now'),
  datetime('now')
)
ON CONFLICT(id) DO NOTHING;
