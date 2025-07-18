-- Fix critical security issues identified by linter

-- Enable RLS on tables that have it disabled
ALTER TABLE public.local_recommendations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for local_recommendations
CREATE POLICY "Anyone can view local recommendations" 
ON public.local_recommendations
FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can create recommendations" 
ON public.local_recommendations
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own recommendations" 
ON public.local_recommendations
FOR UPDATE 
TO authenticated
USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own recommendations" 
ON public.local_recommendations
FOR DELETE 
TO authenticated
USING (auth.uid() = author_id);

-- Fix function search paths for security
CREATE OR REPLACE FUNCTION public.update_community_post_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.communities 
    SET post_count = COALESCE(post_count, 0) + 1 
    WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.communities 
    SET post_count = GREATEST(COALESCE(post_count, 1) - 1, 0) 
    WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_community_event_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.communities 
    SET event_count = COALESCE(event_count, 0) + 1 
    WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.communities 
    SET event_count = GREATEST(COALESCE(event_count, 1) - 1, 0) 
    WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_business_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_post_engagement_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_business_favorites_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_profile_completion_score()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $function$
BEGIN
  NEW.profile_completion_score := public.calculate_profile_completion(NEW.id);
  RETURN NEW;
END;
$function$;

-- Create calculate_profile_completion function if it doesn't exist
CREATE OR REPLACE FUNCTION public.calculate_profile_completion(profile_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER SET search_path = ''
AS $function$
  SELECT 
    CASE 
      WHEN p.first_name IS NOT NULL AND p.last_name IS NOT NULL THEN 
        (
          CASE WHEN p.avatar_url IS NOT NULL THEN 20 ELSE 0 END +
          CASE WHEN p.bio IS NOT NULL THEN 20 ELSE 0 END +
          CASE WHEN p.profession IS NOT NULL THEN 20 ELSE 0 END +
          CASE WHEN p.current_city IS NOT NULL AND p.current_state IS NOT NULL THEN 20 ELSE 0 END +
          CASE WHEN array_length(p.interests, 1) > 0 THEN 20 ELSE 0 END
        ) + 40 -- Base score for having first and last name
      ELSE 0
    END
  FROM public.profiles p
  WHERE p.id = profile_id;
$function$;