-- ============================================================================
-- TechMate Performance Indexes
-- Run AFTER production_schema.sql
-- ============================================================================

-- PROFILES
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON profiles(last_login_at) WHERE deleted_at IS NULL;

-- BUSINESSES
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_businesses_active ON businesses(is_active) WHERE deleted_at IS NULL;

-- PROJECTS
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(priority) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_business ON projects(business_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_user_status ON projects(user_id, status) WHERE deleted_at IS NULL;

-- ORDERS
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_orders_project ON orders(project_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_due_date ON orders(due_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status) WHERE deleted_at IS NULL;

-- DELIVERABLES
CREATE INDEX IF NOT EXISTS idx_deliverables_order ON deliverables(order_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_deliverables_project ON deliverables(project_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_deliverables_status ON deliverables(status) WHERE deleted_at IS NULL;

-- INVOICES
CREATE INDEX IF NOT EXISTS idx_invoices_user ON invoices(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_order ON invoices(order_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_paid_date ON invoices(paid_date);

-- REQUESTS
CREATE INDEX IF NOT EXISTS idx_requests_requester ON requests(requester_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_requests_public ON requests(is_public, status) WHERE is_active = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at);

-- RESPONSES
CREATE INDEX IF NOT EXISTS idx_responses_request ON responses(request_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_responses_responder ON responses(responder_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_responses_status ON responses(status) WHERE deleted_at IS NULL;

-- NOTIFICATIONS
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- MESSAGES
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(recipient_id, is_read) WHERE is_read = false AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- ACTIVITY LOGS
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_logs(created_at);

-- ADMIN METRICS
CREATE INDEX IF NOT EXISTS idx_admin_metrics_date ON admin_metrics(metric_date);

-- USER SETTINGS
CREATE INDEX IF NOT EXISTS idx_user_settings_user ON user_settings(user_id);

-- SUPPORT TICKETS
-- SUPPORT TICKETS
-- Handled by recreate_support_tickets.sql
-- CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id) WHERE deleted_at IS NULL;
-- CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status) WHERE deleted_at IS NULL;
-- CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned ON support_tickets(assigned_to) WHERE deleted_at IS NULL;
