-- Create enum types
CREATE TYPE public.community_type AS ENUM ('city', 'neighborhood', 'region');
CREATE TYPE public.event_type AS ENUM ('cultural', 'professional', 'social', 'religious', 'educational');
CREATE TYPE public.business_category AS ENUM ('restaurant', 'grocery', 'services', 'healthcare', 'education', 'retail', 'technology', 'finance', 'real_estate', 'other');
CREATE TYPE public.post_type AS ENUM ('discussion', 'question', 'announcement', 'resource');
CREATE TYPE public.marketplace_category AS ENUM ('goods', 'services', 'housing', 'jobs');
CREATE TYPE public.listing_status AS ENUM ('active', 'sold', 'expired');

-- Communities table (location-based)
CREATE TABLE public.communities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type community_type NOT NULL DEFAULT 'city',
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    description TEXT,
    member_count INTEGER DEFAULT 0,
    location_coordinates POINT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User profiles table
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    bio TEXT,
    profession TEXT,
    experience_years INTEGER,
    skills TEXT[],
    interests TEXT[],
    hometown_india TEXT,
    languages TEXT[],
    community_id UUID REFERENCES public.communities(id),
    linkedin_url TEXT,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Events table
CREATE TABLE public.events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_type event_type NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    location TEXT,
    address TEXT,
    community_id UUID REFERENCES public.communities(id),
    organizer_id UUID REFERENCES public.profiles(id),
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    is_free BOOLEAN DEFAULT true,
    ticket_price DECIMAL(10,2),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Businesses directory table
CREATE TABLE public.businesses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category business_category NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    website TEXT,
    owner_id UUID REFERENCES public.profiles(id),
    community_id UUID REFERENCES public.communities(id),
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    business_hours JSONB,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Posts/discussions table
CREATE TABLE public.posts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    post_type post_type NOT NULL DEFAULT 'discussion',
    author_id UUID REFERENCES public.profiles(id),
    community_id UUID REFERENCES public.communities(id),
    tags TEXT[],
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Comments table
CREATE TABLE public.comments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id),
    parent_comment_id UUID REFERENCES public.comments(id),
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Resources table (for new immigrants)
CREATE TABLE public.resources (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    category TEXT NOT NULL,
    tags TEXT[],
    author_id UUID REFERENCES public.profiles(id),
    community_id UUID REFERENCES public.communities(id),
    helpful_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    external_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Marketplace table
CREATE TABLE public.marketplace (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category marketplace_category NOT NULL,
    price DECIMAL(10,2),
    is_negotiable BOOLEAN DEFAULT true,
    seller_id UUID REFERENCES public.profiles(id),
    community_id UUID REFERENCES public.communities(id),
    status listing_status DEFAULT 'active',
    images TEXT[],
    location TEXT,
    contact_info JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mentorships table
CREATE TABLE public.mentorships (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    mentor_id UUID REFERENCES public.profiles(id),
    mentee_id UUID REFERENCES public.profiles(id),
    status TEXT DEFAULT 'pending',
    focus_areas TEXT[],
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(mentor_id, mentee_id)
);

-- Event attendees table
CREATE TABLE public.event_attendees (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    attendee_id UUID REFERENCES public.profiles(id),
    status TEXT DEFAULT 'attending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(event_id, attendee_id)
);

-- Enable Row Level Security (with public access for now)
ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

-- Create public access policies (to be updated when auth is implemented)
CREATE POLICY "Public access for communities" ON public.communities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for events" ON public.events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for businesses" ON public.businesses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for posts" ON public.posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for comments" ON public.comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for resources" ON public.resources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for marketplace" ON public.marketplace FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for mentorships" ON public.mentorships FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access for event_attendees" ON public.event_attendees FOR ALL USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_communities_state_city ON public.communities(state, city);
CREATE INDEX idx_profiles_community ON public.profiles(community_id);
CREATE INDEX idx_events_community_date ON public.events(community_id, start_date);
CREATE INDEX idx_businesses_category_community ON public.businesses(category, community_id);
CREATE INDEX idx_posts_community_created ON public.posts(community_id, created_at DESC);
CREATE INDEX idx_comments_post ON public.comments(post_id);
CREATE INDEX idx_marketplace_category_status ON public.marketplace(category, status);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_communities_updated_at BEFORE UPDATE ON public.communities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_resources_updated_at BEFORE UPDATE ON public.resources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_marketplace_updated_at BEFORE UPDATE ON public.marketplace FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mentorships_updated_at BEFORE UPDATE ON public.mentorships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample communities data
INSERT INTO public.communities (name, type, state, city, description) VALUES
('San Francisco Bay Area Indians', 'region', 'California', 'San Francisco', 'Connect with fellow Indians in the Bay Area tech hub'),
('Houston Desi Community', 'city', 'Texas', 'Houston', 'Largest Indian community in Texas'),
('Jersey City Little India', 'neighborhood', 'New Jersey', 'Jersey City', 'Vibrant Indian neighborhood community'),
('Edison Indian Community', 'city', 'New Jersey', 'Edison', 'Family-friendly Indian community'),
('Fremont Indians', 'city', 'California', 'Fremont', 'Growing Indian community in Silicon Valley'),
('Atlanta Indian Professionals', 'city', 'Georgia', 'Atlanta', 'Professional networking for Indians in Atlanta');