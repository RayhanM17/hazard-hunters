USE DATABASE DASHROUTE_DB;
USE SCHEMA MVP_SCHEMA;

CREATE OR REPLACE PROCEDURE PROCESS_PENDING_SUBMISSIONS()
RETURNS VARCHAR
LANGUAGE SQL
AS
$$
BEGIN
    -- Snapshot exactly which rows are PENDING right now, so classification
    -- and points only ever apply to this batch (not every PROCESSED row ever).
    CREATE OR REPLACE TEMPORARY TABLE _PENDING_BATCH AS
    SELECT SUBMISSION_ID, USER_ID FROM SUBMISSIONS WHERE STATUS = 'PENDING';

    -- Classify each submission in the batch using Snowflake Cortex AI_COMPLETE
    UPDATE SUBMISSIONS
    SET
        HAZARD_TYPE = UPPER(TRIM(
            AI_COMPLETE(
                'gemini-3.1-pro',
                PROMPT(
                    'Analyze this image {0}. Reply with EXACTLY ONE WORD representing the hazard. Choose from: POTHOLE, FADED_LINE, CONSTRUCTION, or NONE.',
                    TO_FILE('@DASHROUTE_DB.MVP_SCHEMA.dashcam_media', FILE_NAME)
                )
            )
        )),
        STATUS = 'PROCESSED'
    WHERE SUBMISSION_ID IN (SELECT SUBMISSION_ID FROM _PENDING_BATCH);

    -- Award 100 points per submission newly processed in this batch only
    MERGE INTO USERS u
    USING (
        SELECT USER_ID, COUNT(*) * 100 AS EARNED_POINTS
        FROM _PENDING_BATCH
        GROUP BY USER_ID
    ) s
    ON u.USER_ID = s.USER_ID
    WHEN MATCHED THEN
        UPDATE SET u.POINTS = u.POINTS + s.EARNED_POINTS;

    DROP TABLE IF EXISTS _PENDING_BATCH;

    RETURN 'Complete';
END;
$$;

-- Test run:
-- CALL PROCESS_PENDING_SUBMISSIONS();
-- SELECT FILE_NAME, HAZARD_TYPE, STATUS FROM SUBMISSIONS;
