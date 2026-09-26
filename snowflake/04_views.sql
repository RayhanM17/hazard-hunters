USE DATABASE DASHROUTE_DB;
USE SCHEMA MVP_SCHEMA;

CREATE OR REPLACE VIEW LEADERBOARD_VIEW AS
SELECT
    USER_ID,
    USERNAME,
    POINTS,
    CASE
        WHEN POINTS < 500  THEN 'Scout'
        WHEN POINTS < 1500 THEN 'Pathfinder'
        WHEN POINTS < 3000 THEN 'Trailblazer'
        WHEN POINTS < 5000 THEN 'Road Warrior'
        ELSE 'Apex Driver'
    END AS MEDAL_TIER,
    CASE
        WHEN POINTS < 500  THEN 500
        WHEN POINTS < 1500 THEN 1500
        WHEN POINTS < 3000 THEN 3000
        WHEN POINTS < 5000 THEN 5000
        ELSE POINTS
    END AS NEXT_TIER_THRESHOLD,
    CASE
        WHEN POINTS < 5000 THEN
            ((POINTS - IFF(POINTS < 500, 0,
                       IFF(POINTS < 1500, 500,
                       IFF(POINTS < 3000, 1500, 3000))))::FLOAT /
             (IFF(POINTS < 500, 500,
              IFF(POINTS < 1500, 1500,
              IFF(POINTS < 3000, 3000, 5000))) -
              IFF(POINTS < 500, 0,
              IFF(POINTS < 1500, 500,
              IFF(POINTS < 3000, 1500, 3000))))::FLOAT) * 100
        ELSE 100
    END AS PROGRESS_PERCENTAGE
FROM USERS
ORDER BY POINTS DESC;
-- Always add ORDER BY POINTS DESC in queries — Snowflake doesn't guarantee view ORDER BY.
