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

-- Add RLS policies for safety alerts
CREATE POLICY "Anyone can view active safety alerts" ON public.safety_alerts
  FOR SELECT USING (
    (is_resolved = false OR is_resolved IS NULL) AND 
    (expires_at IS NULL OR expires_at > now())
  );

CREATE POLICY "Authenticated users can create safety alerts" ON public.safety_alerts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors and community moderators can update safety alerts" ON public.safety_alerts
  FOR UPDATE USING (
    auth.uid() = author_id OR 
    (community_id IS NOT NULL AND can_moderate_community(auth.uid(), community_id))
  );