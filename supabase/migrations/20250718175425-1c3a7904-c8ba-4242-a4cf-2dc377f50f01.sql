
-- Add source and post_id fields to events table
ALTER TABLE public.events 
ADD COLUMN source text DEFAULT 'dedicated',
ADD COLUMN post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE;

-- Add source and post_id fields to marketplace table  
ALTER TABLE public.marketplace
ADD COLUMN source text DEFAULT 'dedicated',
ADD COLUMN post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_events_source ON public.events(source);
CREATE INDEX idx_events_post_id ON public.events(post_id);
CREATE INDEX idx_marketplace_source ON public.marketplace(source);
CREATE INDEX idx_marketplace_post_id ON public.marketplace(post_id);

-- Add constraints to ensure source field has valid values
ALTER TABLE public.events 
ADD CONSTRAINT events_source_check CHECK (source IN ('dedicated', 'post'));

ALTER TABLE public.marketplace 
ADD CONSTRAINT marketplace_source_check CHECK (source IN ('dedicated', 'post'));
