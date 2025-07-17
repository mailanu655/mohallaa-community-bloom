-- Add original_post_id field to posts table for repost functionality
ALTER TABLE public.posts ADD COLUMN original_post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE;

-- Add index for better performance when querying reposts
CREATE INDEX idx_posts_original_post_id ON public.posts(original_post_id);

-- Add constraint to prevent self-referencing reposts
ALTER TABLE public.posts ADD CONSTRAINT check_no_self_repost CHECK (id != original_post_id);