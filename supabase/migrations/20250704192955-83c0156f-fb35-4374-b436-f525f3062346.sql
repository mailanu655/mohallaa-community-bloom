-- 1. Create missing ENUM types
CREATE TYPE public.mentorship_status AS ENUM ('pending', 'approved', 'declined', 'completed');

-- 2. Fix mentorships table status column (handle type conversion properly)
ALTER TABLE public.mentorships ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.mentorships ALTER COLUMN status TYPE mentorship_status USING status::mentorship_status;
ALTER TABLE public.mentorships ALTER COLUMN status SET NOT NULL;
ALTER TABLE public.mentorships ALTER COLUMN status SET DEFAULT 'pending';

-- 3. Drop existing foreign key constraints and recreate with proper ON DELETE behavior
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_community_id_fkey;
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_community_id_fkey;
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_organizer_id_fkey;
ALTER TABLE public.businesses DROP CONSTRAINT IF EXISTS businesses_owner_id_fkey;
ALTER TABLE public.businesses DROP CONSTRAINT IF EXISTS businesses_community_id_fkey;
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_community_id_fkey;
ALTER TABLE public.comments DROP CONSTRAINT IF EXISTS comments_author_id_fkey;
ALTER TABLE public.resources DROP CONSTRAINT IF EXISTS resources_author_id_fkey;
ALTER TABLE public.resources DROP CONSTRAINT IF EXISTS resources_community_id_fkey;
ALTER TABLE public.marketplace DROP CONSTRAINT IF EXISTS marketplace_seller_id_fkey;
ALTER TABLE public.marketplace DROP CONSTRAINT IF EXISTS marketplace_community_id_fkey;
ALTER TABLE public.mentorships DROP CONSTRAINT IF EXISTS mentorships_mentor_id_fkey;
ALTER TABLE public.mentorships DROP CONSTRAINT IF EXISTS mentorships_mentee_id_fkey;
ALTER TABLE public.event_attendees DROP CONSTRAINT IF EXISTS event_attendees_attendee_id_fkey;

-- 4. Add proper foreign key constraints with ON DELETE behavior
ALTER TABLE public.profiles ADD CONSTRAINT profiles_community_id_fkey 
    FOREIGN KEY (community_id) REFERENCES public.communities(id) ON DELETE SET NULL;

ALTER TABLE public.events ADD CONSTRAINT events_community_id_fkey 
    FOREIGN KEY (community_id) REFERENCES public.communities(id) ON DELETE SET NULL;
ALTER TABLE public.events ADD CONSTRAINT events_organizer_id_fkey 
    FOREIGN KEY (organizer_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.businesses ADD CONSTRAINT businesses_owner_id_fkey 
    FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.businesses ADD CONSTRAINT businesses_community_id_fkey 
    FOREIGN KEY (community_id) REFERENCES public.communities(id) ON DELETE SET NULL;

ALTER TABLE public.posts ADD CONSTRAINT posts_author_id_fkey 
    FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.posts ADD CONSTRAINT posts_community_id_fkey 
    FOREIGN KEY (community_id) REFERENCES public.communities(id) ON DELETE CASCADE;

ALTER TABLE public.comments ADD CONSTRAINT comments_author_id_fkey 
    FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.resources ADD CONSTRAINT resources_author_id_fkey 
    FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.resources ADD CONSTRAINT resources_community_id_fkey 
    FOREIGN KEY (community_id) REFERENCES public.communities(id) ON DELETE CASCADE;

ALTER TABLE public.marketplace ADD CONSTRAINT marketplace_seller_id_fkey 
    FOREIGN KEY (seller_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.marketplace ADD CONSTRAINT marketplace_community_id_fkey 
    FOREIGN KEY (community_id) REFERENCES public.communities(id) ON DELETE SET NULL;

ALTER TABLE public.mentorships ADD CONSTRAINT mentorships_mentor_id_fkey 
    FOREIGN KEY (mentor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.mentorships ADD CONSTRAINT mentorships_mentee_id_fkey 
    FOREIGN KEY (mentee_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.event_attendees ADD CONSTRAINT event_attendees_attendee_id_fkey 
    FOREIGN KEY (attendee_id) REFERENCES public.profiles(id) ON DELETE CASCADE;