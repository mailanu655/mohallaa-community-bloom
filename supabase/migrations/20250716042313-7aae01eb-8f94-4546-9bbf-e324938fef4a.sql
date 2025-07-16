-- Fix the foreign key constraint issue for post_votes
-- The user_id should reference auth.users, not profiles table

-- First, drop the existing foreign key constraint
ALTER TABLE public.post_votes DROP CONSTRAINT IF EXISTS post_votes_user_id_fkey;

-- Add the correct foreign key constraint pointing to auth.users
ALTER TABLE public.post_votes ADD CONSTRAINT post_votes_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Do the same for comment_votes table if it has the same issue
ALTER TABLE public.comment_votes DROP CONSTRAINT IF EXISTS comment_votes_user_id_fkey;
ALTER TABLE public.comment_votes ADD CONSTRAINT comment_votes_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;