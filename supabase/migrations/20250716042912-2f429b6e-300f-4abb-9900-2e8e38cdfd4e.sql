-- Create post_bookmarks table for user bookmarks functionality
CREATE TABLE public.post_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure a user can only bookmark a post once
  UNIQUE(user_id, post_id)
);

-- Enable Row Level Security
ALTER TABLE public.post_bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policies for user access control
CREATE POLICY "Users can view their own bookmarks" 
ON public.post_bookmarks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks" 
ON public.post_bookmarks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" 
ON public.post_bookmarks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_post_bookmarks_user_id ON public.post_bookmarks(user_id);
CREATE INDEX idx_post_bookmarks_post_id ON public.post_bookmarks(post_id);