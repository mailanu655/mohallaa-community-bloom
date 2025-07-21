-- Fix get_nearby_posts function - recreate with proper error handling
DROP FUNCTION IF EXISTS public.get_nearby_posts(double precision, double precision, integer);

CREATE OR REPLACE FUNCTION public.get_nearby_posts(
  user_lat double precision,
  user_lng double precision,
  radius_km integer DEFAULT 10
)
RETURNS TABLE(
  id uuid,
  title text,
  content text,
  author_id uuid,
  created_at timestamp with time zone,
  upvotes integer,
  downvotes integer,
  comment_count integer,
  media_urls text[],
  media_type text,
  tags text[],
  community_id uuid,
  post_type text,
  location_name text,
  city text,
  state text,
  latitude double precision,
  longitude double precision,
  distance_km double precision,
  is_pinned boolean,
  rich_content jsonb,
  original_post_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate input coordinates
  IF user_lat IS NULL OR user_lng IS NULL THEN
    RAISE EXCEPTION 'User coordinates cannot be null';
  END IF;
  
  IF user_lat < -90 OR user_lat > 90 OR user_lng < -180 OR user_lng > 180 THEN
    RAISE EXCEPTION 'Invalid coordinates: lat=%, lng=%', user_lat, user_lng;
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.content,
    p.author_id,
    p.created_at,
    p.upvotes,
    p.downvotes,
    p.comment_count,
    p.media_urls,
    p.media_type,
    p.tags,
    p.community_id,
    p.post_type::text,
    p.location_name,
    p.city,
    p.state,
    p.latitude::double precision,
    p.longitude::double precision,
    ROUND(
      (6371 * acos(
        cos(radians(user_lat)) * 
        cos(radians(p.latitude::double precision)) * 
        cos(radians(p.longitude::double precision) - radians(user_lng)) + 
        sin(radians(user_lat)) * 
        sin(radians(p.latitude::double precision))
      ))::numeric, 2
    )::double precision as distance_km,
    p.is_pinned,
    p.rich_content,
    p.original_post_id
  FROM public.posts p
  WHERE p.latitude IS NOT NULL 
    AND p.longitude IS NOT NULL
    AND p.latitude BETWEEN -90 AND 90
    AND p.longitude BETWEEN -180 AND 180
    AND (6371 * acos(
      cos(radians(user_lat)) * 
      cos(radians(p.latitude::double precision)) * 
      cos(radians(p.longitude::double precision) - radians(user_lng)) + 
      sin(radians(user_lat)) * 
      sin(radians(p.latitude::double precision))
    )) <= radius_km
  ORDER BY distance_km ASC, p.created_at DESC;
END;
$$;

-- Create get_posts_by_location function
CREATE OR REPLACE FUNCTION public.get_posts_by_location(
  search_city text,
  search_state text,
  limit_count integer DEFAULT 20
)
RETURNS TABLE(
  id uuid,
  title text,
  content text,
  author_id uuid,
  created_at timestamp with time zone,
  upvotes integer,
  downvotes integer,
  comment_count integer,
  media_urls text[],
  media_type text,
  tags text[],
  community_id uuid,
  post_type text,
  location_name text,
  city text,
  state text,
  latitude double precision,
  longitude double precision,
  is_pinned boolean,
  rich_content jsonb,
  original_post_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.content,
    p.author_id,
    p.created_at,
    p.upvotes,
    p.downvotes,
    p.comment_count,
    p.media_urls,
    p.media_type,
    p.tags,
    p.community_id,
    p.post_type::text,
    p.location_name,
    p.city,
    p.state,
    p.latitude::double precision,
    p.longitude::double precision,
    p.is_pinned,
    p.rich_content,
    p.original_post_id
  FROM public.posts p
  WHERE (search_city IS NULL OR LOWER(p.city) = LOWER(search_city))
    AND (search_state IS NULL OR LOWER(p.state) = LOWER(search_state))
  ORDER BY p.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Fix safety_alerts table foreign key issue
ALTER TABLE public.safety_alerts DROP CONSTRAINT IF EXISTS safety_alerts_reporter_id_fkey;
-- Remove the constraint since we reference auth.users directly, not profiles