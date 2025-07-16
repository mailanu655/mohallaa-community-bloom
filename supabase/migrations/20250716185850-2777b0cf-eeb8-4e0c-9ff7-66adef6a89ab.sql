-- Enable PostGIS extension for spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add location fields to posts table
ALTER TABLE public.posts 
ADD COLUMN latitude NUMERIC,
ADD COLUMN longitude NUMERIC,
ADD COLUMN city TEXT,
ADD COLUMN state TEXT,
ADD COLUMN location_name TEXT;

-- Create spatial index for efficient location queries
CREATE INDEX idx_posts_location ON public.posts USING GIST (
  ST_Point(longitude, latitude)
) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create regular indexes for city/state fallback queries
CREATE INDEX idx_posts_city_state ON public.posts (city, state) WHERE city IS NOT NULL;

-- Add user location preferences to profiles table
ALTER TABLE public.profiles 
ADD COLUMN current_latitude NUMERIC,
ADD COLUMN current_longitude NUMERIC,
ADD COLUMN current_city TEXT,
ADD COLUMN current_state TEXT,
ADD COLUMN location_sharing_enabled BOOLEAN DEFAULT false,
ADD COLUMN location_radius_miles INTEGER DEFAULT 10;

-- Create function to get nearby posts
CREATE OR REPLACE FUNCTION public.get_nearby_posts(
  user_lat NUMERIC,
  user_lng NUMERIC,
  radius_miles INTEGER DEFAULT 10,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  content TEXT,
  author_id UUID,
  community_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  upvotes INTEGER,
  downvotes INTEGER,
  comment_count INTEGER,
  post_type TEXT,
  tags TEXT[],
  media_urls TEXT[],
  media_type TEXT,
  rich_content JSONB,
  is_pinned BOOLEAN,
  latitude NUMERIC,
  longitude NUMERIC,
  city TEXT,
  state TEXT,
  location_name TEXT,
  distance_miles NUMERIC
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
    p.community_id,
    p.created_at,
    p.updated_at,
    p.upvotes,
    p.downvotes,
    p.comment_count,
    p.post_type::TEXT,
    p.tags,
    p.media_urls,
    p.media_type,
    p.rich_content,
    p.is_pinned,
    p.latitude,
    p.longitude,
    p.city,
    p.state,
    p.location_name,
    ST_Distance(
      ST_GeogFromText('POINT(' || user_lng || ' ' || user_lat || ')'),
      ST_GeogFromText('POINT(' || p.longitude || ' ' || p.latitude || ')')
    ) / 1609.344 AS distance_miles
  FROM public.posts p
  WHERE p.latitude IS NOT NULL 
    AND p.longitude IS NOT NULL
    AND ST_DWithin(
      ST_GeogFromText('POINT(' || user_lng || ' ' || user_lat || ')'),
      ST_GeogFromText('POINT(' || p.longitude || ' ' || p.latitude || ')'),
      radius_miles * 1609.344
    )
  ORDER BY distance_miles ASC, p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- Create function to get posts by city/state fallback
CREATE OR REPLACE FUNCTION public.get_posts_by_location(
  user_city TEXT,
  user_state TEXT,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  content TEXT,
  author_id UUID,
  community_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  upvotes INTEGER,
  downvotes INTEGER,
  comment_count INTEGER,
  post_type TEXT,
  tags TEXT[],
  media_urls TEXT[],
  media_type TEXT,
  rich_content JSONB,
  is_pinned BOOLEAN,
  latitude NUMERIC,
  longitude NUMERIC,
  city TEXT,
  state TEXT,
  location_name TEXT
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
    p.community_id,
    p.created_at,
    p.updated_at,
    p.upvotes,
    p.downvotes,
    p.comment_count,
    p.post_type::TEXT,
    p.tags,
    p.media_urls,
    p.media_type,
    p.rich_content,
    p.is_pinned,
    p.latitude,
    p.longitude,
    p.city,
    p.state,
    p.location_name
  FROM public.posts p
  WHERE (p.city ILIKE user_city OR p.state ILIKE user_state)
  ORDER BY 
    CASE WHEN p.city ILIKE user_city THEN 1 ELSE 2 END,
    p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;