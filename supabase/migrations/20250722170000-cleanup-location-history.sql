
-- Drop the unused location_history table and related functions
-- This table was created for the legacy GPS-based location system

DROP FUNCTION IF EXISTS cleanup_old_location_history();
DROP TABLE IF EXISTS public.location_history;
