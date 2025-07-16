-- Enable real-time for safety_alerts table
ALTER TABLE public.safety_alerts REPLICA IDENTITY FULL;

-- Add safety_alerts to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.safety_alerts;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS safety_alerts_community_id_idx ON public.safety_alerts(community_id);
CREATE INDEX IF NOT EXISTS safety_alerts_author_id_idx ON public.safety_alerts(author_id);
CREATE INDEX IF NOT EXISTS safety_alerts_created_at_idx ON public.safety_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS safety_alerts_severity_idx ON public.safety_alerts(severity);
CREATE INDEX IF NOT EXISTS safety_alerts_is_resolved_idx ON public.safety_alerts(is_resolved);
CREATE INDEX IF NOT EXISTS safety_alerts_expires_at_idx ON public.safety_alerts(expires_at);

-- Create a composite index for location-based queries
CREATE INDEX IF NOT EXISTS safety_alerts_location_idx ON public.safety_alerts(latitude, longitude, radius_affected_miles);