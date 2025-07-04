-- Create community_members table for tracking memberships
CREATE TABLE public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, community_id)
);

-- Enable RLS on community_members
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- Create policies for community_members
CREATE POLICY "Community members are viewable by everyone"
ON public.community_members 
FOR SELECT 
USING (true);

CREATE POLICY "Users can join communities"
ON public.community_members 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities"
ON public.community_members 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create post_votes table for voting system
CREATE TABLE public.post_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Enable RLS on post_votes
ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;

-- Create policies for post_votes
CREATE POLICY "Users can view all votes"
ON public.post_votes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can vote on posts"
ON public.post_votes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
ON public.post_votes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
ON public.post_votes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create comment_votes table for voting on comments
CREATE TABLE public.comment_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, comment_id)
);

-- Enable RLS on comment_votes
ALTER TABLE public.comment_votes ENABLE ROW LEVEL SECURITY;

-- Create policies for comment_votes
CREATE POLICY "Users can view all comment votes"
ON public.comment_votes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can vote on comments"
ON public.comment_votes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comment votes"
ON public.comment_votes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comment votes"
ON public.comment_votes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Update posts table RLS policies to require authentication
DROP POLICY IF EXISTS "Public access for posts" ON public.posts;

CREATE POLICY "Anyone can view posts"
ON public.posts 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create posts"
ON public.posts 
FOR INSERT 
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts"
ON public.posts 
FOR UPDATE 
USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts"
ON public.posts 
FOR DELETE 
USING (auth.uid() = author_id);

-- Update comments table RLS policies to require authentication
DROP POLICY IF EXISTS "Public access for comments" ON public.comments;

CREATE POLICY "Anyone can view comments"
ON public.comments 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create comments"
ON public.comments 
FOR INSERT 
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own comments"
ON public.comments 
FOR UPDATE 
USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments"
ON public.comments 
FOR DELETE 
USING (auth.uid() = author_id);