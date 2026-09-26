USE DATABASE DASHROUTE_DB;
USE SCHEMA MVP_SCHEMA;

-- Demo users — one per medal tier
INSERT INTO USERS (USERNAME, POINTS) VALUES
  ('scout_sam',      50),    -- Scout
  ('path_pat',      800),    -- Pathfinder
  ('trail_tara',   2100),    -- Trailblazer
  ('warrior_wren', 3500),    -- Road Warrior
  ('apex_amy',     6200);    -- Apex Driver

-- Verify:
-- SELECT * FROM LEADERBOARD_VIEW ORDER BY POINTS DESC;
