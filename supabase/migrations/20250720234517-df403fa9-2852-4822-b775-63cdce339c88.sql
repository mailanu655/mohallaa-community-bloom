-- Add neighborhood and zipcode columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN current_neighborhood TEXT,
ADD COLUMN current_zipcode TEXT;