-- Create user roles enum and table
CREATE TYPE public.community_role AS ENUM ('owner', 'admin', 'moderator', 'member');

-- Add role column to community_members table
ALTER TABLE public.community_members ADD COLUMN role community_role DEFAULT 'member';

-- Create security definer function to check community roles
CREATE OR REPLACE FUNCTION public.get_user_community_role(user_id uuid, community_id uuid)
RETURNS community_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.community_members 
  WHERE community_members.user_id = $1 AND community_members.community_id = $2;
$$;

-- Create function to check if user can moderate community
CREATE OR REPLACE FUNCTION public.can_moderate_community(user_id uuid, community_id uuid)
RETURNS boolean
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.community_members 
    WHERE community_members.user_id = $1 
    AND community_members.community_id = $2 
    AND role IN ('owner', 'admin', 'moderator')
  );
$$;

-- Update community_members RLS policies
DROP POLICY IF EXISTS "Users can join communities" ON public.community_members;
DROP POLICY IF EXISTS "Users can leave communities" ON public.community_members;

CREATE POLICY "Users can join communities" 
ON public.community_members 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND role = 'member');

CREATE POLICY "Users can leave communities" 
ON public.community_members 
FOR DELETE 
USING (auth.uid() = user_id OR public.can_moderate_community(auth.uid(), community_id));

CREATE POLICY "Community moderators can manage members"
ON public.community_members
FOR UPDATE
USING (public.can_moderate_community(auth.uid(), community_id));

-- Update posts RLS to allow moderators to pin posts
CREATE POLICY "Community moderators can manage posts"
ON public.posts
FOR UPDATE
USING (
  auth.uid() = author_id OR 
  (community_id IS NOT NULL AND public.can_moderate_community(auth.uid(), community_id))
);

-- Add trigger to update community member count
CREATE OR REPLACE FUNCTION public.update_community_member_count()
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER community_member_count_trigger
AFTER INSERT OR DELETE ON public.community_members
FOR EACH ROW EXECUTE FUNCTION public.update_community_member_count();