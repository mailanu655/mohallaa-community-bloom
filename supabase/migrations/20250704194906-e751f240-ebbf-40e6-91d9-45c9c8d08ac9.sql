-- Insert sample events with proper UUIDs
INSERT INTO public.events (id, title, description, event_type, start_date, end_date, location, address, is_free, ticket_price, max_attendees, current_attendees, organizer_id, community_id) VALUES
('e0000001-1111-1111-1111-111111111111', 'Diwali Celebration 2024', 'Join us for a grand Diwali celebration with traditional performances, food, and festivities', 'cultural', '2024-11-15 18:00:00+00', '2024-11-15 23:00:00+00', 'Community Center Hall', '100 Community Drive, San Francisco, CA', false, 25.00, 200, 87, '11111111-1111-1111-1111-111111111111', (SELECT id FROM communities WHERE name = 'San Francisco Bay Area Indian Community')),
('e0000002-2222-2222-2222-222222222222', 'Tech Networking Mixer', 'Connect with Indian tech professionals in the Seattle area', 'professional', '2024-08-20 19:00:00+00', '2024-08-20 22:00:00+00', 'Tech Hub Seattle', '500 Tech Avenue, Seattle, WA', true, null, 100, 45, '22222222-2222-2222-2222-222222222222', (SELECT id FROM communities WHERE name = 'Seattle Indian Professionals')),
('e0000003-3333-3333-3333-333333333333', 'Yoga and Wellness Workshop', 'Learn traditional yoga practices and meditation techniques', 'educational', '2024-08-25 10:00:00+00', '2024-08-25 16:00:00+00', 'Wellness Center', '789 Wellness Way, Austin, TX', false, 40.00, 50, 23, '33333333-3333-3333-3333-333333333333', (SELECT id FROM communities WHERE name = 'Austin Indian Association')),
('e0000004-4444-4444-4444-444444444444', 'Investment Seminar', 'Learn about smart investment strategies for the Indian diaspora', 'professional', '2024-09-10 14:00:00+00', '2024-09-10 17:00:00+00', 'Financial District Conference Room', '321 Wall Street, New York, NY', true, null, 75, 34, '44444444-4444-4444-4444-444444444444', (SELECT id FROM communities WHERE name = 'New York Indian Chamber of Commerce')),
('e0000005-5555-5555-5555-555555555555', 'Bollywood Dance Competition', 'Showcase your dancing skills in this exciting competition', 'cultural', '2024-09-15 15:00:00+00', '2024-09-15 20:00:00+00', 'Dance Academy', '654 Dance Street, Chicago, IL', false, 15.00, 150, 72, '55555555-5555-5555-5555-555555555555', (SELECT id FROM communities WHERE name = 'Chicago Desi Network'));

-- Insert event attendees
INSERT INTO public.event_attendees (event_id, attendee_id, status) VALUES
('e0000001-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'attending'),
('e0000001-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'attending'),
('e0000002-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'attending'),
('e0000002-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'maybe'),
('e0000003-3333-3333-3333-333333333333', '55555555-5555-5555-5555-555555555555', 'attending'),
('e0000004-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'attending'),
('e0000005-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'attending'),
('e0000005-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666', 'attending');