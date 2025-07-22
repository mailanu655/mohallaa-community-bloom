
-- Create neighborhoods table with predefined US neighborhoods
CREATE TABLE public.neighborhoods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  state_code TEXT NOT NULL, -- e.g., 'CA', 'NY'
  metro_area TEXT, -- e.g., 'San Francisco Bay Area'
  latitude NUMERIC, -- for reference only
  longitude NUMERIC, -- for reference only
  population INTEGER,
  is_popular BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for efficient searching
CREATE INDEX idx_neighborhoods_city_state ON public.neighborhoods(city, state);
CREATE INDEX idx_neighborhoods_metro_area ON public.neighborhoods(metro_area);
CREATE INDEX idx_neighborhoods_popular ON public.neighborhoods(is_popular) WHERE is_popular = true;
CREATE INDEX idx_neighborhoods_search ON public.neighborhoods USING gin(to_tsvector('english', name || ' ' || city || ' ' || state));

-- Enable RLS
ALTER TABLE public.neighborhoods ENABLE ROW LEVEL SECURITY;

-- Everyone can view neighborhoods
CREATE POLICY "Everyone can view neighborhoods" ON public.neighborhoods
  FOR SELECT USING (true);

-- Add neighborhood_id to profiles table
ALTER TABLE public.profiles 
ADD COLUMN selected_neighborhood_id UUID REFERENCES public.neighborhoods(id);

-- Add neighborhood_id to posts table for better filtering
ALTER TABLE public.posts 
ADD COLUMN neighborhood_id UUID REFERENCES public.neighborhoods(id);

-- Update communities table to reference neighborhoods
ALTER TABLE public.communities 
ADD COLUMN neighborhood_id UUID REFERENCES public.neighborhoods(id);

-- Seed some popular neighborhoods across major US metros
INSERT INTO public.neighborhoods (name, city, state, state_code, metro_area, is_popular, latitude, longitude, population) VALUES
-- San Francisco Bay Area
('SOMA', 'San Francisco', 'California', 'CA', 'San Francisco Bay Area', true, 37.7749, -122.4194, 50000),
('Mission District', 'San Francisco', 'California', 'CA', 'San Francisco Bay Area', true, 37.7599, -122.4148, 60000),
('Castro', 'San Francisco', 'California', 'CA', 'San Francisco Bay Area', true, 37.7609, -122.4350, 25000),
('Palo Alto', 'Palo Alto', 'California', 'CA', 'San Francisco Bay Area', true, 37.4419, -122.1430, 65000),
('Mountain View', 'Mountain View', 'California', 'CA', 'San Francisco Bay Area', true, 37.3861, -122.0839, 80000),

-- Los Angeles Area
('Beverly Hills', 'Beverly Hills', 'California', 'CA', 'Greater Los Angeles', true, 34.0736, -118.4004, 35000),
('Santa Monica', 'Santa Monica', 'California', 'CA', 'Greater Los Angeles', true, 34.0195, -118.4912, 90000),
('Hollywood', 'Los Angeles', 'California', 'CA', 'Greater Los Angeles', true, 34.0928, -118.3287, 85000),
('Venice', 'Los Angeles', 'California', 'CA', 'Greater Los Angeles', true, 33.9850, -118.4695, 40000),
('Pasadena', 'Pasadena', 'California', 'CA', 'Greater Los Angeles', true, 34.1478, -118.1445, 140000),

-- New York City
('Manhattan', 'New York', 'New York', 'NY', 'New York Metro', true, 40.7831, -73.9712, 1600000),
('Brooklyn Heights', 'Brooklyn', 'New York', 'NY', 'New York Metro', true, 40.6962, -73.9969, 22000),
('Williamsburg', 'Brooklyn', 'New York', 'NY', 'New York Metro', true, 40.7081, -73.9571, 32000),
('Astoria', 'Queens', 'New York', 'NY', 'New York Metro', true, 40.7698, -73.9442, 95000),
('Jersey City', 'Jersey City', 'New Jersey', 'NJ', 'New York Metro', true, 40.7178, -74.0431, 270000),

-- Chicago
('Lincoln Park', 'Chicago', 'Illinois', 'IL', 'Chicagoland', true, 41.9242, -87.6369, 65000),
('Wicker Park', 'Chicago', 'Illinois', 'IL', 'Chicagoland', true, 41.9067, -87.6767, 27000),
('River North', 'Chicago', 'Illinois', 'IL', 'Chicagoland', true, 41.8919, -87.6278, 20000),
('Lakeview', 'Chicago', 'Illinois', 'IL', 'Chicagoland', true, 41.9403, -87.6439, 95000),

-- Seattle
('Capitol Hill', 'Seattle', 'Washington', 'WA', 'Seattle Metro', true, 47.6205, -122.3212, 30000),
('Ballard', 'Seattle', 'Washington', 'WA', 'Seattle Metro', true, 47.6769, -122.3831, 45000),
('Fremont', 'Seattle', 'Washington', 'WA', 'Seattle Metro', true, 47.6502, -122.3505, 30000),
('Bellevue', 'Bellevue', 'Washington', 'WA', 'Seattle Metro', true, 47.6101, -122.2015, 150000),

-- Austin
('South by Southwest', 'Austin', 'Texas', 'TX', 'Austin Metro', true, 30.2672, -97.7431, 40000),
('East Austin', 'Austin', 'Texas', 'TX', 'Austin Metro', true, 30.2672, -97.7200, 50000),
('West Lake Hills', 'West Lake Hills', 'Texas', 'TX', 'Austin Metro', true, 30.2930, -97.8147, 4000),

-- Boston
('Back Bay', 'Boston', 'Massachusetts', 'MA', 'Greater Boston', true, 42.3467, -71.0972, 30000),
('Cambridge', 'Cambridge', 'Massachusetts', 'MA', 'Greater Boston', true, 42.3736, -71.1097, 120000),
('North End', 'Boston', 'Massachusetts', 'MA', 'Greater Boston', true, 42.3647, -71.0542, 10000),

-- Miami
('South Beach', 'Miami Beach', 'Florida', 'FL', 'Miami Metro', true, 25.7617, -80.1918, 40000),
('Wynwood', 'Miami', 'Florida', 'FL', 'Miami Metro', true, 25.8010, -80.1998, 15000),
('Coral Gables', 'Coral Gables', 'Florida', 'FL', 'Miami Metro', true, 25.7217, -80.2581, 50000),

-- Denver
('LoDo', 'Denver', 'Colorado', 'CO', 'Denver Metro', true, 39.7539, -105.0178, 12000),
('Capitol Hill', 'Denver', 'Colorado', 'CO', 'Denver Metro', true, 39.7370, -104.9807, 20000),
('Boulder', 'Boulder', 'Colorado', 'CO', 'Denver Metro', true, 40.0150, -105.2705, 110000),

-- Portland
('Pearl District', 'Portland', 'Oregon', 'OR', 'Portland Metro', true, 45.5266, -122.6850, 15000),
('Hawthorne', 'Portland', 'Oregon', 'OR', 'Portland Metro', true, 45.5118, -122.6433, 25000),
('Alberta Arts District', 'Portland', 'Oregon', 'OR', 'Portland Metro', true, 45.5584, -122.6542, 20000);

-- Create a function to get popular neighborhoods
CREATE OR REPLACE FUNCTION public.get_popular_neighborhoods(limit_count INTEGER DEFAULT 20)
RETURNS TABLE(
  id UUID,
  name TEXT,
  city TEXT,
  state TEXT,
  state_code TEXT,
  metro_area TEXT,
  population INTEGER
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    n.id,
    n.name,
    n.city,
    n.state,
    n.state_code,
    n.metro_area,
    n.population
  FROM public.neighborhoods n
  WHERE n.is_popular = true
  ORDER BY n.population DESC, n.name
  LIMIT limit_count;
$$;

-- Create a function to search neighborhoods
CREATE OR REPLACE FUNCTION public.search_neighborhoods(search_query TEXT, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  id UUID,
  name TEXT,
  city TEXT,
  state TEXT,
  state_code TEXT,
  metro_area TEXT,
  population INTEGER,
  relevance REAL
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    n.id,
    n.name,
    n.city,
    n.state,
    n.state_code,
    n.metro_area,
    n.population,
    ts_rank(to_tsvector('english', n.name || ' ' || n.city || ' ' || n.state), plainto_tsquery('english', search_query)) as relevance
  FROM public.neighborhoods n
  WHERE to_tsvector('english', n.name || ' ' || n.city || ' ' || n.state) @@ plainto_tsquery('english', search_query)
    OR n.name ILIKE '%' || search_query || '%'
    OR n.city ILIKE '%' || search_query || '%'
    OR n.state ILIKE '%' || search_query || '%'
  ORDER BY relevance DESC, n.is_popular DESC, n.population DESC
  LIMIT limit_count;
$$;

-- Update the get_nearby_posts function to work with neighborhoods
CREATE OR REPLACE FUNCTION public.get_posts_by_neighborhood(
  neighborhood_uuid UUID,
  include_metro BOOLEAN DEFAULT true,
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
  neighborhood_id UUID
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_metro TEXT;
  target_state TEXT;
BEGIN
  -- Get the metro area and state for the selected neighborhood
  SELECT n.metro_area, n.state INTO target_metro, target_state
  FROM public.neighborhoods n WHERE n.id = neighborhood_uuid;

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
    p.neighborhood_id
  FROM public.posts p
  LEFT JOIN public.neighborhoods n ON p.neighborhood_id = n.id
  WHERE 
    -- Direct neighborhood match
    p.neighborhood_id = neighborhood_uuid
    OR 
    -- Same metro area match (if include_metro is true)
    (include_metro = true AND n.metro_area = target_metro AND target_metro IS NOT NULL)
    OR
    -- Fallback to city/state matching for posts without neighborhood_id
    (p.neighborhood_id IS NULL AND p.state = target_state)
  ORDER BY 
    CASE WHEN p.neighborhood_id = neighborhood_uuid THEN 1 ELSE 2 END,
    p.is_pinned DESC,
    p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;
