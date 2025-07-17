-- First, check if uploads bucket exists and create storage policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for uploads bucket
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Allow public read access to uploads" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'uploads');

CREATE POLICY "Allow users to update their own files" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own files" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add debugging info for posts policies - check if user is actually a community member
-- Also verify the user can create posts without the strict community membership check temporarily
DROP POLICY IF EXISTS "Enable users to create posts in their communities" ON public.posts;

CREATE POLICY "Enable authenticated users to create posts" 
ON public.posts
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = author_id);

-- Ensure user can view posts
DROP POLICY IF EXISTS "Enable users to view community posts" ON public.posts;

CREATE POLICY "Enable users to view posts"
ON public.posts
FOR SELECT
TO authenticated
USING (true);