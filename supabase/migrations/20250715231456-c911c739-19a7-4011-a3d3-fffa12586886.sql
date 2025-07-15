-- Add rules column to communities table
ALTER TABLE public.communities 
ADD COLUMN rules TEXT;

-- Add community cover image support
ALTER TABLE public.communities 
ADD COLUMN cover_image_url TEXT;

-- Add community statistics columns
ALTER TABLE public.communities 
ADD COLUMN post_count INTEGER DEFAULT 0,
ADD COLUMN event_count INTEGER DEFAULT 0;

-- Create function to update community post count
CREATE OR REPLACE FUNCTION public.update_community_post_count()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create function to update community event count
CREATE OR REPLACE FUNCTION public.update_community_event_count()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update community statistics
CREATE TRIGGER trigger_update_community_post_count
  AFTER INSERT OR DELETE ON public.posts
  FOR EACH ROW
  WHEN (NEW.community_id IS NOT NULL OR OLD.community_id IS NOT NULL)
  EXECUTE FUNCTION public.update_community_post_count();

CREATE TRIGGER trigger_update_community_event_count
  AFTER INSERT OR DELETE ON public.events
  FOR EACH ROW
  WHEN (NEW.community_id IS NOT NULL OR OLD.community_id IS NOT NULL)
  EXECUTE FUNCTION public.update_community_event_count();

-- Initialize existing community statistics
UPDATE public.communities 
SET post_count = (
  SELECT COUNT(*) 
  FROM public.posts 
  WHERE posts.community_id = communities.id
),
event_count = (
  SELECT COUNT(*) 
  FROM public.events 
  WHERE events.community_id = communities.id
);