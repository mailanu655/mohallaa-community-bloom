-- Create location history table for tracking user location changes
CREATE TABLE public.location_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  city TEXT,
  state TEXT,
  accuracy NUMERIC,
  detection_method TEXT NOT NULL DEFAULT 'auto',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_location_history_user_id ON public.location_history(user_id);
CREATE INDEX idx_location_history_created_at ON public.location_history(created_at);

-- Enable RLS
ALTER TABLE public.location_history ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own location history" 
ON public.location_history 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own location history" 
ON public.location_history 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own location history" 
ON public.location_history 
FOR DELETE 
USING (auth.uid() = user_id);

-- Function to clean up old location history (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_location_history()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.location_history 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$;