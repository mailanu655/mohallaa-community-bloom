-- Add subscription fields to businesses table
ALTER TABLE public.businesses 
ADD COLUMN subscription_tier TEXT DEFAULT 'basic',
ADD COLUMN subscription_status TEXT DEFAULT 'active',
ADD COLUMN subscription_end_date TIMESTAMPTZ,
ADD COLUMN subscription_price NUMERIC DEFAULT 0,
ADD COLUMN enhanced_features JSONB DEFAULT '{}';

-- Create business_subscriptions table for tracking subscription history
CREATE TABLE public.business_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'basic',
  status TEXT NOT NULL DEFAULT 'active',
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  price NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on business_subscriptions
ALTER TABLE public.business_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies for business_subscriptions
CREATE POLICY "Business owners can view their subscriptions" 
ON public.business_subscriptions
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.businesses 
  WHERE businesses.id = business_subscriptions.business_id 
  AND businesses.owner_id = auth.uid()
));

CREATE POLICY "Business owners can manage their subscriptions" 
ON public.business_subscriptions
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.businesses 
  WHERE businesses.id = business_subscriptions.business_id 
  AND businesses.owner_id = auth.uid()
));

-- Create analytics tables for premium insights
CREATE TABLE public.business_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  profile_views INTEGER DEFAULT 0,
  service_bookings INTEGER DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  customer_inquiries INTEGER DEFAULT 0,
  rating_average NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.community_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  new_members INTEGER DEFAULT 0,
  active_members INTEGER DEFAULT 0,
  posts_created INTEGER DEFAULT 0,
  events_created INTEGER DEFAULT 0,
  engagement_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on analytics tables
ALTER TABLE public.business_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for business_analytics
CREATE POLICY "Business owners can view their analytics" 
ON public.business_analytics
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.businesses 
  WHERE businesses.id = business_analytics.business_id 
  AND businesses.owner_id = auth.uid()
  AND businesses.subscription_tier IN ('premium', 'enterprise')
));

-- Create policies for community_analytics
CREATE POLICY "Community moderators can view analytics" 
ON public.community_analytics
FOR SELECT
USING (can_moderate_community(auth.uid(), community_id));

-- Create indexes for better performance
CREATE INDEX idx_business_subscriptions_business_id ON public.business_subscriptions(business_id);
CREATE INDEX idx_business_analytics_business_id_date ON public.business_analytics(business_id, date);
CREATE INDEX idx_community_analytics_community_id_date ON public.community_analytics(community_id, date);

-- Create function to check if business has premium features
CREATE OR REPLACE FUNCTION public.business_has_premium_features(business_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_uuid 
    AND subscription_tier IN ('premium', 'enterprise')
    AND subscription_status = 'active'
    AND (subscription_end_date IS NULL OR subscription_end_date > now())
  );
$$;