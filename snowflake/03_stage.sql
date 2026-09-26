USE DATABASE DASHROUTE_DB;
USE SCHEMA MVP_SCHEMA;

CREATE STAGE IF NOT EXISTS dashcam_media
  ENCRYPTION = (TYPE = 'SNOWFLAKE_SSE');

-- Enable directory table so the procedure can reference files
ALTER STAGE dashcam_media SET DIRECTORY = (ENABLE = TRUE);
