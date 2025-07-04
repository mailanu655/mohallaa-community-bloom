-- Add media support to posts table
ALTER TABLE public.posts ADD COLUMN media_urls TEXT[];
ALTER TABLE public.posts ADD COLUMN media_type TEXT;
ALTER TABLE public.posts ADD COLUMN rich_content JSONB;

-- Add more post categories
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'event';
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'job';
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'housing';
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'marketplace';
ALTER TYPE post_type ADD VALUE IF NOT EXISTS 'recommendation';

-- Add post categories table for better organization
CREATE TABLE public.post_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default categories
INSERT INTO public.post_categories (name, description, icon, color) VALUES
('General', 'General community discussions', 'MessageSquare', '#6B7280'),
('Events', 'Community events and gatherings', 'Calendar', '#F59E0B'),
('Housing', 'Housing, rentals, and roommates', 'Home', '#10B981'),
('Jobs', 'Job postings and career opportunities', 'Briefcase', '#3B82F6'),
('Marketplace', 'Buy, sell, and trade items', 'ShoppingBag', '#8B5CF6'),
('Food', 'Restaurant recommendations and food discussions', 'Utensils', '#EF4444'),
('Transportation', 'Rides, carpools, and transit', 'Car', '#06B6D4'),
('Services', 'Service recommendations and requests', 'Wrench', '#84CC16'),
('Culture', 'Cultural events and traditions', 'Star', '#F97316'),
('Help', 'Questions and help requests', 'HelpCircle', '#EC4899');

-- Enable RLS for post categories
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;

-- Create policy for reading categories (public)
CREATE POLICY "Everyone can view post categories" 
ON public.post_categories 
FOR SELECT 
USING (true);

-- Add trigger for post categories timestamp
CREATE TRIGGER update_post_categories_updated_at
BEFORE UPDATE ON public.post_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();