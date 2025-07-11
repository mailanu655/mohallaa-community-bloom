-- Add is_virtual column to events table
ALTER TABLE public.events 
ADD COLUMN is_virtual boolean NOT NULL DEFAULT false;

-- Add comment to describe the column
COMMENT ON COLUMN public.events.is_virtual IS 'Indicates if the event is virtual (true) or in-person (false)';