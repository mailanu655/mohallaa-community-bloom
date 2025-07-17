
-- Check current RLS policies on posts table
SELECT * FROM pg_policies WHERE tablename = 'posts';

-- Add necessary RLS policies for posts if missing
CREATE POLICY "Enable users to create posts in their communities" 
ON public.posts
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() = author_id AND (
    -- Allow if community_id is null (general post)
    community_id IS NULL OR
    -- Allow if user is a member of the community
    EXISTS (
      SELECT 1 FROM community_members 
      WHERE community_id = posts.community_id 
      AND user_id = auth.uid()
    )
  )
);

-- Enable users to update their own posts
CREATE POLICY "Enable users to update their own posts"
ON public.posts
FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Enable users to delete their own posts
CREATE POLICY "Enable users to delete their own posts"
ON public.posts
FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

-- Enable users to view posts in public communities or communities they are members of
CREATE POLICY "Enable users to view community posts"
ON public.posts
FOR SELECT
TO authenticated
USING (
  community_id IS NULL OR
  EXISTS (
    SELECT 1 FROM communities c
    WHERE c.id = posts.community_id
    AND (
      c.privacy_type = 'public' OR
      EXISTS (
        SELECT 1 FROM community_members cm
        WHERE cm.community_id = c.id
        AND cm.user_id = auth.uid()
      )
    )
  )
);
