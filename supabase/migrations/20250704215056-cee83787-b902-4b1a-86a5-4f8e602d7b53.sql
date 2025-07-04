-- Add enhanced profile fields for better user profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_completion_score INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_media_links JSONB DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS availability_status TEXT DEFAULT 'available';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS contact_preferences JSONB DEFAULT '{"email": true, "message": true, "linkedin": false}';

-- Create user connections table for networking
CREATE TABLE IF NOT EXISTS public.user_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

-- Create profile views table for analytics
CREATE TABLE IF NOT EXISTS public.profile_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index for profile views (one view per user per day)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profile_views_daily 
ON public.profile_views (profile_id, viewer_id, date_trunc('day', viewed_at));

-- Enable RLS on new tables
ALTER TABLE public.user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_connections
CREATE POLICY "Users can view their own connections"
ON public.user_connections
FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

CREATE POLICY "Users can create connection requests"
ON public.user_connections
FOR INSERT
WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can update their connection responses"
ON public.user_connections
FOR UPDATE
USING (auth.uid() = addressee_id OR auth.uid() = requester_id);

-- RLS policies for profile_views
CREATE POLICY "Users can view their profile analytics"
ON public.profile_views
FOR SELECT
USING (auth.uid() = profile_id);

CREATE POLICY "Users can log profile views"
ON public.profile_views
FOR INSERT
WITH CHECK (auth.uid() = viewer_id);

-- Add triggers for updated_at
CREATE TRIGGER update_user_connections_updated_at
BEFORE UPDATE ON public.user_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate profile completion score
CREATE OR REPLACE FUNCTION public.calculate_profile_completion(profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  profile_data RECORD;
BEGIN
  SELECT * INTO profile_data FROM public.profiles WHERE id = profile_id;
  
  IF profile_data IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Base information (20 points)
  IF profile_data.first_name IS NOT NULL AND profile_data.last_name IS NOT NULL THEN
    score := score + 10;
  END IF;
  IF profile_data.email IS NOT NULL THEN
    score := score + 10;
  END IF;
  
  -- Profile details (30 points)
  IF profile_data.bio IS NOT NULL AND LENGTH(profile_data.bio) > 50 THEN
    score := score + 15;
  END IF;
  IF profile_data.avatar_url IS NOT NULL THEN
    score := score + 15;
  END IF;
  
  -- Professional info (25 points)
  IF profile_data.profession IS NOT NULL THEN
    score := score + 10;
  END IF;
  IF profile_data.experience_years IS NOT NULL THEN
    score := score + 10;
  END IF;
  IF profile_data.linkedin_url IS NOT NULL THEN
    score := score + 5;
  END IF;
  
  -- Skills and interests (15 points)
  IF profile_data.skills IS NOT NULL AND array_length(profile_data.skills, 1) >= 3 THEN
    score := score + 8;
  END IF;
  IF profile_data.interests IS NOT NULL AND array_length(profile_data.interests, 1) >= 3 THEN
    score := score + 7;
  END IF;
  
  -- Location and community (10 points)
  IF profile_data.hometown_india IS NOT NULL THEN
    score := score + 5;
  END IF;
  IF profile_data.community_id IS NOT NULL THEN
    score := score + 5;
  END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update profile completion score
CREATE OR REPLACE FUNCTION public.update_profile_completion_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completion_score := public.calculate_profile_completion(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profile_completion_trigger
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_profile_completion_score();