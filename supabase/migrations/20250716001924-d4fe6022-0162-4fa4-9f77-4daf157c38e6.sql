-- Create business_posts table for business updates and announcements
CREATE TABLE public.business_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'update',
  target_communities UUID[] DEFAULT '{}',
  is_promoted BOOLEAN DEFAULT false,
  promotion_budget NUMERIC DEFAULT 0,
  promotion_end_date TIMESTAMP WITH TIME ZONE,
  engagement_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business_reviews table for customer reviews and recommendations
CREATE TABLE public.business_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  is_recommended BOOLEAN DEFAULT true,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, reviewer_id)
);

-- Create business_deals table for local deals and promotions
CREATE TABLE public.business_deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  deal_type TEXT NOT NULL DEFAULT 'discount',
  discount_percentage INTEGER,
  discount_amount NUMERIC,
  terms_conditions TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  target_communities UUID[] DEFAULT '{}',
  max_redemptions INTEGER,
  current_redemptions INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business_verifications table for verification status
CREATE TABLE public.business_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL DEFAULT 'document',
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_documents TEXT[],
  verification_notes TEXT,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.business_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_verifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_posts
CREATE POLICY "Business posts are viewable by everyone" 
  ON public.business_posts FOR SELECT 
  USING (true);

CREATE POLICY "Business owners can manage their posts" 
  ON public.business_posts FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE businesses.id = business_posts.business_id 
    AND businesses.owner_id = auth.uid()
  ));

-- RLS Policies for business_reviews
CREATE POLICY "Business reviews are viewable by everyone" 
  ON public.business_reviews FOR SELECT 
  USING (true);

CREATE POLICY "Users can create reviews for businesses" 
  ON public.business_reviews FOR INSERT 
  WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Users can update their own reviews" 
  ON public.business_reviews FOR UPDATE 
  USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can delete their own reviews" 
  ON public.business_reviews FOR DELETE 
  USING (auth.uid() = reviewer_id);

-- RLS Policies for business_deals
CREATE POLICY "Business deals are viewable by everyone" 
  ON public.business_deals FOR SELECT 
  USING (is_active = true AND (end_date IS NULL OR end_date > now()));

CREATE POLICY "Business owners can manage their deals" 
  ON public.business_deals FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE businesses.id = business_deals.business_id 
    AND businesses.owner_id = auth.uid()
  ));

-- RLS Policies for business_verifications
CREATE POLICY "Business owners can view their verifications" 
  ON public.business_verifications FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE businesses.id = business_verifications.business_id 
    AND businesses.owner_id = auth.uid()
  ));

CREATE POLICY "Business owners can create verification requests" 
  ON public.business_verifications FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE businesses.id = business_verifications.business_id 
    AND businesses.owner_id = auth.uid()
  ));

-- Add is_verified column to businesses table
ALTER TABLE public.businesses ADD COLUMN is_verified BOOLEAN DEFAULT false;

-- Create function to update business rating when reviews are added/updated
CREATE OR REPLACE FUNCTION public.update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.businesses 
    SET 
      rating = (
        SELECT AVG(rating)::NUMERIC(3,2) 
        FROM public.business_reviews 
        WHERE business_id = NEW.business_id
      ),
      review_count = (
        SELECT COUNT(*) 
        FROM public.business_reviews 
        WHERE business_id = NEW.business_id
      )
    WHERE id = NEW.business_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.businesses 
    SET 
      rating = (
        SELECT AVG(rating)::NUMERIC(3,2) 
        FROM public.business_reviews 
        WHERE business_id = OLD.business_id
      ),
      review_count = (
        SELECT COUNT(*) 
        FROM public.business_reviews 
        WHERE business_id = OLD.business_id
      )
    WHERE id = OLD.business_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating business ratings
CREATE TRIGGER update_business_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.business_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_business_rating();

-- Create indexes for better performance
CREATE INDEX idx_business_posts_business_id ON public.business_posts(business_id);
CREATE INDEX idx_business_posts_created_at ON public.business_posts(created_at DESC);
CREATE INDEX idx_business_reviews_business_id ON public.business_reviews(business_id);
CREATE INDEX idx_business_reviews_rating ON public.business_reviews(rating);
CREATE INDEX idx_business_deals_business_id ON public.business_deals(business_id);
CREATE INDEX idx_business_deals_active ON public.business_deals(is_active, end_date);

-- Add updated_at triggers
CREATE TRIGGER update_business_posts_updated_at
  BEFORE UPDATE ON public.business_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_reviews_updated_at
  BEFORE UPDATE ON public.business_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_deals_updated_at
  BEFORE UPDATE ON public.business_deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_verifications_updated_at
  BEFORE UPDATE ON public.business_verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();