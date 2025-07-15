-- Create advertisements table for ad campaigns
CREATE TABLE public.advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  target_url TEXT,
  ad_type TEXT NOT NULL CHECK (ad_type IN ('sponsored_post', 'banner', 'local_business')),
  placement_type TEXT NOT NULL CHECK (placement_type IN ('community_feed', 'marketplace', 'business_directory', 'sidebar')),
  target_location TEXT, -- for local targeting
  target_community_id UUID REFERENCES public.communities(id),
  budget_total DECIMAL(10,2),
  budget_daily DECIMAL(10,2),
  cost_per_click DECIMAL(10,2) DEFAULT 0.50,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'paused', 'completed', 'rejected')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  spend_total DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create ad impressions table for tracking views
CREATE TABLE public.ad_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES public.advertisements(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES public.profiles(id),
  placement_page TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create ad clicks table for tracking interactions
CREATE TABLE public.ad_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID REFERENCES public.advertisements(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES public.profiles(id),
  placement_page TEXT NOT NULL,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_clicks ENABLE ROW LEVEL SECURITY;

-- Policies for advertisements
CREATE POLICY "Advertisers can manage their ads" ON public.advertisements
  FOR ALL USING (advertiser_id = auth.uid());

CREATE POLICY "Everyone can view active ads" ON public.advertisements
  FOR SELECT USING (status = 'active' AND start_date <= now() AND (end_date IS NULL OR end_date >= now()));

-- Policies for ad impressions
CREATE POLICY "Users can create impressions" ON public.ad_impressions
  FOR INSERT WITH CHECK (viewer_id = auth.uid() OR viewer_id IS NULL);

CREATE POLICY "Advertisers can view their ad impressions" ON public.ad_impressions
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.advertisements 
    WHERE advertisements.id = ad_impressions.ad_id 
    AND advertisements.advertiser_id = auth.uid()
  ));

-- Policies for ad clicks
CREATE POLICY "Users can create clicks" ON public.ad_clicks
  FOR INSERT WITH CHECK (viewer_id = auth.uid() OR viewer_id IS NULL);

CREATE POLICY "Advertisers can view their ad clicks" ON public.ad_clicks
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.advertisements 
    WHERE advertisements.id = ad_clicks.ad_id 
    AND advertisements.advertiser_id = auth.uid()
  ));

-- Create function to update ad metrics
CREATE OR REPLACE FUNCTION public.update_ad_impression(ad_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.advertisements 
  SET impressions = impressions + 1
  WHERE id = ad_uuid;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_ad_click(ad_uuid UUID, click_cost DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE public.advertisements 
  SET clicks = clicks + 1,
      spend_total = spend_total + click_cost
  WHERE id = ad_uuid;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
CREATE TRIGGER update_advertisements_updated_at
  BEFORE UPDATE ON public.advertisements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();