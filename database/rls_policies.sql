-- ============================================================================
-- TechMate RLS Policies
-- Run AFTER production_schema.sql AND migrations.sql
-- Safe to re-run: uses DROP POLICY IF EXISTS before each CREATE
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Helper: Check if current user is admin
-- ============================================================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND is_admin = true
      AND (deleted_at IS NULL OR NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'deleted_at'
      ))
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- PROFILES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  USING (is_admin());

-- ============================================================================
-- BUSINESSES
-- ============================================================================
DROP POLICY IF EXISTS "Owners can manage own business" ON businesses;
CREATE POLICY "Owners can manage own business"
  ON businesses FOR ALL
  USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Public can view active businesses" ON businesses;
CREATE POLICY "Public can view active businesses"
  ON businesses FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage all businesses" ON businesses;
CREATE POLICY "Admins can manage all businesses"
  ON businesses FOR ALL
  USING (is_admin());

-- ============================================================================
-- PROJECTS
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own projects" ON projects;
CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own projects" ON projects;
CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all projects" ON projects;
CREATE POLICY "Admins can manage all projects"
  ON projects FOR ALL
  USING (is_admin());

-- ============================================================================
-- ORDERS
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own orders" ON orders;
CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own orders" ON orders;
CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all orders" ON orders;
CREATE POLICY "Admins can manage all orders"
  ON orders FOR ALL
  USING (is_admin());

-- ============================================================================
-- DELIVERABLES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own deliverables" ON deliverables;
CREATE POLICY "Users can view own deliverables"
  ON deliverables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.id = deliverables.order_id AND orders.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM projects WHERE projects.id = deliverables.project_id AND projects.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage all deliverables" ON deliverables;
CREATE POLICY "Admins can manage all deliverables"
  ON deliverables FOR ALL
  USING (is_admin());

-- ============================================================================
-- INVOICES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
CREATE POLICY "Users can view own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all invoices" ON invoices;
CREATE POLICY "Admins can manage all invoices"
  ON invoices FOR ALL
  USING (is_admin());

-- ============================================================================
-- REQUESTS
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own requests" ON requests;
CREATE POLICY "Users can view own requests"
  ON requests FOR SELECT
  USING (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Public can view open requests" ON requests;
CREATE POLICY "Public can view open requests"
  ON requests FOR SELECT
  USING (is_public = true AND is_active = true AND status = 'open');

DROP POLICY IF EXISTS "Users can create requests" ON requests;
CREATE POLICY "Users can create requests"
  ON requests FOR INSERT
  WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Users can update own requests" ON requests;
CREATE POLICY "Users can update own requests"
  ON requests FOR UPDATE
  USING (auth.uid() = requester_id);

DROP POLICY IF EXISTS "Admins can manage all requests" ON requests;
CREATE POLICY "Admins can manage all requests"
  ON requests FOR ALL
  USING (is_admin());

-- ============================================================================
-- RESPONSES
-- ============================================================================
DROP POLICY IF EXISTS "Responders can manage own responses" ON responses;
CREATE POLICY "Responders can manage own responses"
  ON responses FOR ALL
  USING (auth.uid() = responder_id);

DROP POLICY IF EXISTS "Request owners can view responses" ON responses;
CREATE POLICY "Request owners can view responses"
  ON responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM requests WHERE requests.id = responses.request_id AND requests.requester_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage all responses" ON responses;
CREATE POLICY "Admins can manage all responses"
  ON responses FOR ALL
  USING (is_admin());

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;
CREATE POLICY "Admins can manage all notifications"
  ON notifications FOR ALL
  USING (is_admin());

-- ============================================================================
-- MESSAGES
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update own sent messages" ON messages;
CREATE POLICY "Users can update own sent messages"
  ON messages FOR UPDATE
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Admins can manage all messages" ON messages;
CREATE POLICY "Admins can manage all messages"
  ON messages FOR ALL
  USING (is_admin());

-- ============================================================================
-- ACTIVITY LOGS
-- ============================================================================
DROP POLICY IF EXISTS "Users can view own activity" ON activity_logs;
CREATE POLICY "Users can view own activity"
  ON activity_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all activity" ON activity_logs;
CREATE POLICY "Admins can view all activity"
  ON activity_logs FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "System can create activity logs" ON activity_logs;
CREATE POLICY "System can create activity logs"
  ON activity_logs FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- ADMIN METRICS
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage metrics" ON admin_metrics;
CREATE POLICY "Admins can manage metrics"
  ON admin_metrics FOR ALL
  USING (is_admin());

-- ============================================================================
-- SERVICE CATEGORIES
-- ============================================================================
DROP POLICY IF EXISTS "Anyone can view active categories" ON service_categories;
CREATE POLICY "Anyone can view active categories"
  ON service_categories FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage categories" ON service_categories;
CREATE POLICY "Admins can manage categories"
  ON service_categories FOR ALL
  USING (is_admin());

-- ============================================================================
-- USER SETTINGS
-- ============================================================================
DROP POLICY IF EXISTS "Users can manage own settings" ON user_settings;
CREATE POLICY "Users can manage own settings"
  ON user_settings FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all settings" ON user_settings;
CREATE POLICY "Admins can view all settings"
  ON user_settings FOR SELECT
  USING (is_admin());

-- ============================================================================
-- SUPPORT TICKETS
-- ============================================================================
DROP POLICY IF EXISTS "Users can manage own tickets" ON support_tickets;
CREATE POLICY "Users can manage own tickets"
  ON support_tickets FOR ALL
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all tickets" ON support_tickets;
CREATE POLICY "Admins can manage all tickets"
  ON support_tickets FOR ALL
  USING (is_admin());
