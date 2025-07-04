-- 5. Add NOT NULL constraints and update ENUM fields
ALTER TABLE public.posts ALTER COLUMN post_type SET NOT NULL;
ALTER TABLE public.marketplace ALTER COLUMN status SET NOT NULL;
ALTER TABLE public.events ALTER COLUMN event_type SET NOT NULL;
ALTER TABLE public.businesses ALTER COLUMN category SET NOT NULL;

-- 6. Add email validation constraint
ALTER TABLE public.profiles ADD CONSTRAINT valid_email_format 
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- 7. Create separate tags tables for better normalization
CREATE TABLE public.post_tags (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(post_id, tag)
);

CREATE TABLE public.resource_tags (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
    tag TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(resource_id, tag)
);

-- 8. Create partial indexes for boolean flags
CREATE INDEX idx_featured_businesses ON public.businesses(id, rating DESC) WHERE is_featured = true;
CREATE INDEX idx_featured_resources ON public.resources(id, helpful_count DESC) WHERE is_featured = true;
CREATE INDEX idx_verified_profiles ON public.profiles(id, created_at DESC) WHERE is_verified = true;
CREATE INDEX idx_pinned_posts ON public.posts(id, created_at DESC) WHERE is_pinned = true;
CREATE INDEX idx_active_marketplace ON public.marketplace(id, created_at DESC) WHERE status = 'active';

-- 9. Add full-text search capabilities
ALTER TABLE public.posts ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', title || ' ' || content)
) STORED;

ALTER TABLE public.businesses ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', name || ' ' || COALESCE(description, ''))
) STORED;

ALTER TABLE public.resources ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(content, ''))
) STORED;

CREATE INDEX idx_posts_search ON public.posts USING GIN (search_vector);
CREATE INDEX idx_businesses_search ON public.businesses USING GIN (search_vector);
CREATE INDEX idx_resources_search ON public.resources USING GIN (search_vector);

-- 10. Add unique constraints and additional improvements
ALTER TABLE public.events ADD CONSTRAINT unique_event_organizer_title UNIQUE (organizer_id, title, start_date);
ALTER TABLE public.businesses ADD CONSTRAINT unique_business_name_address UNIQUE (name, address);

-- 11. Add NOT NULL constraints for critical foreign keys
ALTER TABLE public.posts ALTER COLUMN author_id SET NOT NULL;
ALTER TABLE public.comments ALTER COLUMN author_id SET NOT NULL;
ALTER TABLE public.resources ALTER COLUMN author_id SET NOT NULL;
ALTER TABLE public.marketplace ALTER COLUMN seller_id SET NOT NULL;
ALTER TABLE public.mentorships ALTER COLUMN mentor_id SET NOT NULL;
ALTER TABLE public.mentorships ALTER COLUMN mentee_id SET NOT NULL;
ALTER TABLE public.event_attendees ALTER COLUMN attendee_id SET NOT NULL;

-- 12. Create indexes for tag tables
CREATE INDEX idx_post_tags_post_id ON public.post_tags(post_id);
CREATE INDEX idx_post_tags_tag ON public.post_tags(tag);
CREATE INDEX idx_resource_tags_resource_id ON public.resource_tags(resource_id);
CREATE INDEX idx_resource_tags_tag ON public.resource_tags(tag);

-- 13. Add additional performance indexes
CREATE INDEX idx_events_start_date ON public.events(start_date DESC);
CREATE INDEX idx_posts_upvotes ON public.posts(upvotes DESC);
CREATE INDEX idx_businesses_rating ON public.businesses(rating DESC, review_count DESC);
CREATE INDEX idx_marketplace_price ON public.marketplace(price ASC) WHERE status = 'active';