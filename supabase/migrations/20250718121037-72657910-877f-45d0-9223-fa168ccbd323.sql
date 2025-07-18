
-- Phase 1: Enable RLS on Reference Tables

-- Enable RLS on post_tags table
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for post_tags - users can manage tags for posts they can access
CREATE POLICY "Users can manage tags for accessible posts" ON public.post_tags
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.posts 
    WHERE posts.id = post_tags.post_id 
    AND (
      posts.author_id = auth.uid() 
      OR posts.community_id IS NULL 
      OR EXISTS (
        SELECT 1 FROM public.community_members 
        WHERE community_members.community_id = posts.community_id 
        AND community_members.user_id = auth.uid()
      )
    )
  )
);

-- Enable RLS on resource_tags table
ALTER TABLE public.resource_tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for resource_tags - users can manage tags for resources they can access
CREATE POLICY "Users can manage tags for accessible resources" ON public.resource_tags
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.resources 
    WHERE resources.id = resource_tags.resource_id 
    AND (
      resources.author_id = auth.uid() 
      OR resources.community_id IS NULL 
      OR EXISTS (
        SELECT 1 FROM public.community_members 
        WHERE community_members.community_id = resources.community_id 
        AND community_members.user_id = auth.uid()
      )
    )
  )
);

-- Enable RLS on spatial_ref_sys table (PostGIS reference data)
ALTER TABLE public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for spatial_ref_sys - read-only access for everyone
CREATE POLICY "Everyone can read spatial reference systems" ON public.spatial_ref_sys
FOR SELECT USING (true);

-- Phase 2: Function Search Path Security Hardening

-- Update notify_user_interaction function
CREATE OR REPLACE FUNCTION public.notify_user_interaction()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create notification for post author when someone likes their post
  IF TG_OP = 'INSERT' AND NEW.vote_type = 'upvote' THEN
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      related_type,
      related_id
    )
    SELECT 
      posts.author_id,
      'like',
      'New Like',
      profiles.first_name || ' ' || profiles.last_name || ' liked your post',
      'post',
      NEW.post_id
    FROM public.posts
    JOIN public.profiles ON profiles.id = NEW.user_id
    WHERE posts.id = NEW.post_id
    AND posts.author_id != NEW.user_id; -- Don't notify self
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Update notify_comment_interaction function
CREATE OR REPLACE FUNCTION public.notify_comment_interaction()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Notify post author about new comment
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      related_type,
      related_id
    )
    SELECT 
      posts.author_id,
      'comment',
      'New Comment',
      profiles.first_name || ' ' || profiles.last_name || ' commented on your post',
      'post',
      NEW.post_id
    FROM public.posts
    JOIN public.profiles ON profiles.id = NEW.author_id
    WHERE posts.id = NEW.post_id
    AND posts.author_id != NEW.author_id; -- Don't notify self
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update notify_bookmark_interaction function
CREATE OR REPLACE FUNCTION public.notify_bookmark_interaction()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Notify post author about new bookmark
    INSERT INTO public.notifications (
      user_id,
      type,
      title,
      message,
      related_type,
      related_id
    )
    SELECT 
      posts.author_id,
      'bookmark',
      'Post Bookmarked',
      profiles.first_name || ' ' || profiles.last_name || ' bookmarked your post',
      'post',
      NEW.post_id
    FROM public.posts
    JOIN public.profiles ON profiles.id = NEW.user_id
    WHERE posts.id = NEW.post_id
    AND posts.author_id != NEW.user_id; -- Don't notify self
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update update_ad_impression function
CREATE OR REPLACE FUNCTION public.update_ad_impression(ad_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.advertisements 
  SET impressions = impressions + 1
  WHERE id = ad_uuid;
END;
$$;

-- Update update_ad_click function
CREATE OR REPLACE FUNCTION public.update_ad_click(ad_uuid uuid, click_cost numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.advertisements 
  SET clicks = clicks + 1,
      spend_total = spend_total + click_cost
  WHERE id = ad_uuid;
END;
$$;

-- Update update_community_member_count function
CREATE OR REPLACE FUNCTION public.update_community_member_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.communities 
    SET member_count = COALESCE(member_count, 0) + 1 
    WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.communities 
    SET member_count = GREATEST(COALESCE(member_count, 1) - 1, 0) 
    WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Update business_has_premium_features function
CREATE OR REPLACE FUNCTION public.business_has_premium_features(business_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_uuid 
    AND subscription_tier IN ('premium', 'enterprise')
    AND subscription_status = 'active'
    AND (subscription_end_date IS NULL OR subscription_end_date > now())
  );
$$;
