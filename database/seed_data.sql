-- ============================================================================
-- TechMate Seed Data for Testing
-- Run AFTER schema, functions, and RLS policies
-- ============================================================================

-- NOTE: You need to create test users via Supabase Auth first.
-- The UUIDs below are placeholders. Replace them with real auth.users IDs.
-- 
-- Step 1: Create users via Supabase Auth (dashboard or API)
-- Step 2: Get their UUIDs from auth.users
-- Step 3: Replace the UUIDs below
-- Step 4: Run this script

-- ============================================================================
-- SAMPLE PROFILES (these should match auth.users)
-- Profiles are auto-created by the handle_new_user trigger,
-- but we update them here with richer data
-- ============================================================================

-- To update profiles after user creation:
-- UPDATE profiles SET
--   full_name = 'Brian Kyalo',
--   role = 'admin',
--   is_admin = true,
--   user_type = 'admin',
--   phone = '+254700000000',
--   bio = 'TechMate founder and lead developer',
--   company = 'TechMate',
--   job_title = 'CEO & Founder',
--   location = 'Nairobi, Kenya',
--   timezone = 'Africa/Nairobi',
--   email_verified = true
-- WHERE email = 'your-admin-email@example.com';

-- ============================================================================
-- SERVICE CATEGORIES
-- ============================================================================
INSERT INTO service_categories (name, description, icon, color, sort_order) VALUES
  ('Web Development', 'Custom web applications and websites', 'Globe', 'emerald', 1),
  ('Mobile Apps', 'iOS and Android mobile applications', 'Smartphone', 'blue', 2),
  ('Desktop Software', 'Windows, macOS, and Linux applications', 'Monitor', 'purple', 3),
  ('MVPs & Prototypes', 'Rapid prototyping and minimum viable products', 'Zap', 'amber', 4),
  ('Custom APIs & Backend', 'RESTful APIs and backend services', 'Database', 'cyan', 5),
  ('Cloud Services', 'Cloud infrastructure and DevOps', 'Cloud', 'indigo', 6),
  ('UI/UX Design', 'User interface and experience design', 'Palette', 'pink', 7),
  ('Consulting', 'Technical consulting and advisory', 'Brain', 'orange', 8)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- SAMPLE DATA TEMPLATE
-- Uncomment and customize after creating auth users
-- ============================================================================

/*
-- Replace these with real user UUIDs from auth.users
DO $$
DECLARE
  admin_id UUID := 'YOUR-ADMIN-UUID';
  user1_id UUID := 'YOUR-USER1-UUID';
  user2_id UUID := 'YOUR-USER2-UUID';
  project1_id UUID;
  project2_id UUID;
  order1_id UUID;
  order2_id UUID;
  order3_id UUID;
BEGIN

-- Sample Projects
INSERT INTO projects (id, user_id, name, client, type, description, budget, spent, deadline, status, priority, progress, health_score, technologies)
VALUES
  (uuid_generate_v4(), user1_id, 'E-Commerce Platform', 'Acme Corp', 'website', 'Full-featured e-commerce platform with payment integration', 15000, 8500, now() + INTERVAL '60 days', 'active', 'high', 65, 82, ARRAY['React', 'Node.js', 'PostgreSQL', 'Stripe']),
  (uuid_generate_v4(), user1_id, 'Mobile Banking App', 'FinanceHub', 'app', 'Cross-platform mobile banking application', 25000, 22000, now() + INTERVAL '14 days', 'review', 'critical', 89, 74, ARRAY['React Native', 'Firebase', 'Plaid']),
  (uuid_generate_v4(), user2_id, 'Portfolio Website', 'Jane Smith', 'website', 'Personal portfolio with blog', 3000, 2800, now() + INTERVAL '7 days', 'active', 'medium', 90, 95, ARRAY['React', 'Tailwind CSS'])
RETURNING id INTO project1_id;

-- Sample Orders
INSERT INTO orders (id, user_id, project_id, title, description, category, type, status, progress, priority, budget, spent, health_score, due_date, next_milestone)
VALUES
  (uuid_generate_v4(), user1_id, NULL, 'Website Redesign', 'Complete redesign of corporate website', 'web', 'website', 'in_progress', 45, 'high', 8000, 3600, 88, now() + INTERVAL '30 days', 'Design Approval'),
  (uuid_generate_v4(), user1_id, NULL, 'Mobile App MVP', 'MVP for food delivery app', 'mobile', 'app', 'in_progress', 30, 'medium', 12000, 3600, 92, now() + INTERVAL '45 days', 'Backend Integration'),
  (uuid_generate_v4(), user2_id, NULL, 'API Development', 'RESTful API for inventory management', 'api', 'backend', 'pending', 0, 'low', 5000, 0, 100, now() + INTERVAL '60 days', 'Initial Setup')
RETURNING id INTO order1_id;

-- Sample Invoices
INSERT INTO invoices (user_id, order_id, amount, tax_amount, currency, status, due_date)
VALUES
  (user1_id, order1_id, 4000, 640, 'USD', 'paid', now() - INTERVAL '15 days'),
  (user1_id, order1_id, 4000, 640, 'USD', 'sent', now() + INTERVAL '15 days'),
  (user2_id, NULL, 2500, 400, 'USD', 'overdue', now() - INTERVAL '5 days');

-- Sample Notifications
INSERT INTO notifications (user_id, title, message, type, category) VALUES
  (user1_id, 'Project Update', 'Your Website Redesign project has reached 45% completion', 'info', 'project'),
  (user1_id, 'Invoice Due', 'Invoice INV-000002 is due in 15 days', 'warning', 'billing'),
  (user1_id, 'Welcome to TechMate!', 'Your account has been successfully created', 'success', 'account'),
  (user2_id, 'New Message', 'You have a new message from the development team', 'info', 'message'),
  (user2_id, 'Payment Overdue', 'Invoice INV-000003 is overdue. Please make payment.', 'error', 'billing');

-- Sample Messages
INSERT INTO messages (sender_id, recipient_id, subject, content) VALUES
  (admin_id, user1_id, 'Welcome to TechMate', 'Hi! Welcome to TechMate. Your project is underway. Feel free to reach out anytime.'),
  (user1_id, admin_id, 'Re: Welcome to TechMate', 'Thanks! Looking forward to the progress updates.'),
  (admin_id, user2_id, 'API Project Kickoff', 'Hi! Let''s schedule a kickoff meeting for your API project this week.');

-- Sample Support Tickets
INSERT INTO support_tickets (user_id, subject, description, category, priority, status) VALUES
  (user1_id, 'Cannot upload files', 'I am unable to upload files larger than 5MB', 'technical', 'medium', 'open'),
  (user2_id, 'Billing question', 'Can I change my payment method?', 'billing', 'low', 'open');

END $$;
*/
