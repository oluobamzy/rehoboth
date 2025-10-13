-- ================================
-- HOMEPAGE CONTENT INITIALIZATION
-- Add initial content for homepage sections
-- ================================

-- Insert homepage content sections
INSERT INTO page_content (page_key, section_key, content) VALUES
('home', 'sunday_services_description', '<p class="mb-5 text-gray-600">Join us every Sunday at 3:00 PM - 6:00 PM for worship, prayer, and fellowship.</p>'),
('home', 'latest_sermons_description', '<p class="mb-5 text-gray-600">Listen to our recent messages and grow in your understanding of God''s Word.</p>'),
('home', 'giving_back_description', '<p class="mb-5 text-gray-600">Discover opportunities to serve, connect, and make a difference in our community.</p>'),
('home', 'welcome_message', '<p class="text-lg md:text-xl mb-8 text-gray-700 leading-relaxed">A community of believers committed to loving God and serving people. No matter who you are, where you come from, or your background, you belong here. God''s love is for everyone—and we warmly invite you to be part of our church family.</p>'),
('home', 'pastor_introduction', '<p class="text-gray-600 mb-4">Pastor Patrick and his wife lead Rehoboth Christian Church with passion and dedication. They are committed to sharing God''s love and transforming lives through the power of the gospel.</p><p class="text-gray-600 mb-6">We invite you to connect with us, join our services, and become part of our growing community of faith.</p>'),
('home', 'events_section_description', '<p class="text-gray-600 max-w-3xl mx-auto">Join us for these special events and activities at Rehoboth Christian Church. All are welcome!</p>')
ON CONFLICT (page_key, section_key) DO NOTHING;

-- Verify the homepage content was inserted
SELECT 'Homepage content added' as status, count(*) as sections_added 
FROM page_content 
WHERE page_key = 'home';