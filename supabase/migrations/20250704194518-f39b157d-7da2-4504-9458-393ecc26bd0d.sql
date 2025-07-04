-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES 
('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
('business-images', 'business-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
('event-images', 'event-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
('marketplace-images', 'marketplace-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
('documents', 'documents', false, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

-- Create storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload their own avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Anyone can update avatars" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can delete avatars" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'avatars');

-- Create storage policies for business images
CREATE POLICY "Business images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'business-images');

CREATE POLICY "Anyone can upload business images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'business-images');

CREATE POLICY "Anyone can update business images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'business-images');

CREATE POLICY "Anyone can delete business images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'business-images');

-- Create storage policies for event images
CREATE POLICY "Event images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'event-images');

CREATE POLICY "Anyone can upload event images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'event-images');

CREATE POLICY "Anyone can update event images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'event-images');

CREATE POLICY "Anyone can delete event images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'event-images');

-- Create storage policies for marketplace images
CREATE POLICY "Marketplace images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'marketplace-images');

CREATE POLICY "Anyone can upload marketplace images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'marketplace-images');

CREATE POLICY "Anyone can update marketplace images" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'marketplace-images');

CREATE POLICY "Anyone can delete marketplace images" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'marketplace-images');

-- Create storage policies for documents (private bucket)
CREATE POLICY "Users can view their own documents" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'documents');

CREATE POLICY "Anyone can upload documents" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Anyone can update documents" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'documents');

CREATE POLICY "Anyone can delete documents" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'documents');

-- Enable real-time for tables
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER TABLE public.events REPLICA IDENTITY FULL;
ALTER TABLE public.event_attendees REPLICA IDENTITY FULL;
ALTER TABLE public.marketplace REPLICA IDENTITY FULL;
ALTER TABLE public.businesses REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_attendees;
ALTER PUBLICATION supabase_realtime ADD TABLE public.marketplace;
ALTER PUBLICATION supabase_realtime ADD TABLE public.businesses;