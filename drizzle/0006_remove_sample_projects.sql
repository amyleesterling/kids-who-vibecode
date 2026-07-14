DELETE FROM votes
WHERE project_id IN ('mossy-moon', 'bubble-town', 'snack-forest', 'monster-disco');

DELETE FROM projects
WHERE id IN ('mossy-moon', 'bubble-town', 'snack-forest', 'monster-disco');
