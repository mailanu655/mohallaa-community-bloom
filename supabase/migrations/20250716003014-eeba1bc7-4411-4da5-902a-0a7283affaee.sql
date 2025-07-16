-- Additional enhancements to the Nextdoor business schema

-- Add business categories and service areas
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS service_radius_miles INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS license_number TEXT;

-- Create business_favorites table (Nextdoor's "Faves" feature)
CREATE TABLE public.business_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, user_id)
);

-- Create business_messages table for customer inquiries
CREATE TABLE public.business_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business_photos table for galleries
CREATE TABLE public.business_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business_events table for local events
CREATE TABLE public.business_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT true,
  price NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhance business_posts with engagement types
ALTER TABLE public.business_posts 
ADD COLUMN IF NOT EXISTS allows_comments BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS post_status TEXT DEFAULT 'published',
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP WITH TIME ZONE;

-- Create post_engagements table for likes, comments, shares
CREATE TABLE public.post_engagements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.business_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  engagement_type TEXT NOT NULL, -- 'like', 'comment', 'share', 'helpful'
  comment_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id, engagement_type)
);

-- Add recommendation tracking to reviews
ALTER TABLE public.business_reviews 
ADD COLUMN IF NOT EXISTS recommendation_type TEXT DEFAULT 'general', -- 'general', 'service', 'product'
ADD COLUMN IF NOT EXISTS would_recommend_again BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS service_used TEXT;

-- Enable RLS on new tables
ALTER TABLE public.business_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_engagements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_favorites
CREATE POLICY "Anyone can view business favorites count" 
  ON public.business_favorites FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage their own favorites" 
  ON public.business_favorites FOR ALL 
  USING (auth.uid() = user_id);

-- RLS Policies for business_messages
CREATE POLICY "Business owners can view their messages" 
  ON public.business_messages FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE businesses.id = business_messages.business_id 
    AND businesses.owner_id = auth.uid()
  ));

CREATE POLICY "Users can send messages to businesses" 
  ON public.business_messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view their own sent messages" 
  ON public.business_messages FOR SELECT 
  USING (auth.uid() = sender_id);

-- RLS Policies for business_photos
CREATE POLICY "Business photos are viewable by everyone" 
  ON public.business_photos FOR SELECT 
  USING (true);

CREATE POLICY "Business owners can manage their photos" 
  ON public.business_photos FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE businesses.id = business_photos.business_id 
    AND businesses.owner_id = auth.uid()
  ));

-- RLS Policies for business_events
CREATE POLICY "Business events are viewable by everyone" 
  ON public.business_events FOR SELECT 
  USING (event_date > now() - INTERVAL '1 day');

CREATE POLICY "Business owners can manage their events" 
  ON public.business_events FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE businesses.id = business_events.business_id 
    AND businesses.owner_id = auth.uid()
  ));

-- RLS Policies for post_engagements
CREATE POLICY "Post engagements are viewable by everyone" 
  ON public.post_engagements FOR SELECT 
  USING (true);

CREATE POLICY "Users can manage their own engagements" 
  ON public.post_engagements FOR ALL 
  USING (auth.uid() = user_id);

-- Create function to update engagement counts
CREATE OR REPLACE FUNCTION public.update_post_engagement_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.business_posts 
    SET engagement_count = engagement_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.business_posts 
    SET engagement_count = GREATEST(engagement_count - 1, 0)
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for post engagement counting
CREATE TRIGGER update_post_engagement_count_trigger
  AFTER INSERT OR DELETE ON public.post_engagements
  FOR EACH ROW EXECUTE FUNCTION public.update_post_engagement_count();

-- Create function to update business favorites count
CREATE OR REPLACE FUNCTION public.update_business_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.businesses 
    SET enhanced_features = COALESCE(enhanced_features, '{}'::jsonb) || 
      jsonb_build_object('favorites_count', 
        COALESCE((enhanced_features->>'favorites_count')::integer, 0) + 1)
    WHERE id = NEW.business_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.businesses 
    SET enhanced_features = COALESCE(enhanced_features, '{}'::jsonb) || 
      jsonb_build_object('favorites_count', 
        GREATEST(COALESCE((enhanced_features->>'favorites_count')::integer, 1) - 1, 0))
    WHERE id = OLD.business_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for business favorites counting
CREATE TRIGGER update_business_favorites_count_trigger
  AFTER INSERT OR DELETE ON public.business_favorites
  FOR EACH ROW EXECUTE FUNCTION public.update_business_favorites_count();

-- Additional indexes for performance
CREATE INDEX idx_business_favorites_business_id ON public.business_favorites(business_id);
CREATE INDEX idx_business_messages_business_id ON public.business_messages(business_id);
CREATE INDEX idx_business_messages_unread ON public.business_messages(business_id, is_read);
CREATE INDEX idx_business_photos_business_id ON public.business_photos(business_id, display_order);
CREATE INDEX idx_business_events_date ON public.business_events(event_date);
CREATE INDEX idx_post_engagements_post_id ON public.post_engagements(post_id);
CREATE INDEX idx_businesses_categories ON public.businesses USING GIN(categories);

-- Create view for business statistics dashboard
CREATE VIEW public.business_dashboard_stats AS
SELECT 
  b.id,
  b.name,
  b.rating,
  b.review_count,
  COALESCE((b.enhanced_features->>'favorites_count')::integer, 0) as favorites_count,
  COUNT(DISTINCT bp.id) as total_posts,
  COUNT(DISTINCT bm.id) as unread_messages,
  COUNT(DISTINCT bd.id) as active_deals
FROM public.businesses b
LEFT JOIN public.business_posts bp ON b.id = bp.business_id
LEFT JOIN public.business_messages bm ON b.id = bm.business_id AND bm.is_read = false
LEFT JOIN public.business_deals bd ON b.id = bd.business_id AND bd.is_active = true
GROUP BY b.id, b.name, b.rating, b.review_count, b.enhanced_features;