-- Add safety alert post type and enhance location features
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'safety_alert';

-- Add neighborhood-specific fields to communities
ALTER TABLE public.communities 
ADD COLUMN IF NOT EXISTS neighborhood_name TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS radius_miles INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS is_indian_diaspora_focused BOOLEAN DEFAULT true;

-- Add location and diaspora fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS current_address TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS years_in_area INTEGER,
ADD COLUMN IF NOT EXISTS origin_state_india TEXT,
ADD COLUMN IF NOT EXISTS preferred_languages TEXT[] DEFAULT ARRAY['English', 'Hindi'];

-- Create neighborhood safety alerts table
CREATE TABLE IF NOT EXISTS public.safety_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  alert_type TEXT NOT NULL DEFAULT 'general', -- general, emergency, weather, crime, traffic
  severity TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  location_details TEXT,
  coordinates POINT,
  radius_affected_miles INTEGER DEFAULT 2,
  community_id UUID REFERENCES public.communities(id),
  author_id UUID NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on safety alerts
ALTER TABLE public.safety_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for safety alerts
CREATE POLICY "Anyone can view safety alerts" ON public.safety_alerts
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create safety alerts" ON public.safety_alerts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors and community moderators can update safety alerts" ON public.safety_alerts
  FOR UPDATE USING (
    auth.uid() = author_id OR 
    (community_id IS NOT NULL AND can_moderate_community(auth.uid(), community_id))
  );

-- Create local recommendations table
CREATE TABLE IF NOT EXISTS public.local_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- restaurant, grocery, services, healthcare, education, cultural
  business_name TEXT,
  address TEXT,
  phone TEXT,
  website TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  price_range TEXT, -- $, $$, $$$, $$$$
  indian_friendly BOOLEAN DEFAULT false,
  vegetarian_options BOOLEAN DEFAULT false,
  halal_options BOOLEAN DEFAULT false,
  community_id UUID REFERENCES public.communities(id),
  author_id UUID NOT NULL,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on recommendations
ALTER TABLE public.local_recommendations ENABLE ROW LEVEL SECURITY;

-- Create policies for recommendations
CREATE POLICY "Anyone can view recommendations" ON public.local_recommendations
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create recommendations" ON public.local_recommendations
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their recommendations" ON public.local_recommendations
  FOR UPDATE USING (auth.uid() = author_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_safety_alerts_community_location ON public.safety_alerts(community_id, coordinates);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_severity_created ON public.safety_alerts(severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_category_community ON public.local_recommendations(category, community_id);
CREATE INDEX IF NOT EXISTS idx_communities_zip_code ON public.communities(zip_code);
CREATE INDEX IF NOT EXISTS idx_profiles_zip_code ON public.profiles(zip_code);

-- Create function to get nearby communities by zip code
CREATE OR REPLACE FUNCTION public.get_nearby_communities(user_zip TEXT, radius_miles INTEGER DEFAULT 10)
RETURNS TABLE(
  id UUID,
  name TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  member_count INTEGER,
  distance_estimate TEXT
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    c.id,
    c.name,
    c.city,
    c.state,
    c.zip_code,
    c.member_count,
    CASE 
      WHEN c.zip_code = user_zip THEN 'Same area'
      ELSE 'Nearby'
    END as distance_estimate
  FROM public.communities c
  WHERE c.is_indian_diaspora_focused = true
    AND (c.zip_code = user_zip OR c.city IN (
      SELECT DISTINCT city FROM public.communities WHERE zip_code = user_zip
    ))
  ORDER BY 
    CASE WHEN c.zip_code = user_zip THEN 0 ELSE 1 END,
    c.member_count DESC;
$$;

-- Update existing posts table to include location relevance
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS is_location_specific BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS target_zip_codes TEXT[],
ADD COLUMN IF NOT EXISTS urgency_level TEXT DEFAULT 'normal'; -- normal, urgent, emergency