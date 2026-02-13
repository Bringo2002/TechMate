-- ============================================================================
-- TechMate Database Functions & Triggers
-- Run AFTER production_schema.sql
-- ============================================================================

-- ============================================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'profiles', 'businesses', 'projects', 'orders', 'deliverables',
      'invoices', 'requests', 'responses', 'messages', 'user_settings',
      'support_tickets', 'admin_metrics'
    ])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER update_%s_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW
       EXECUTE FUNCTION update_updated_at_column()',
      tbl, tbl
    );
  END LOOP;
END;
$$;

-- ============================================================================
-- AUTO-INCREMENT RESPONSE COUNT ON REQUESTS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_request_response_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE requests SET responses_count = responses_count + 1
    WHERE id = NEW.request_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE requests SET responses_count = GREATEST(responses_count - 1, 0)
    WHERE id = OLD.request_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_response_count
  AFTER INSERT OR DELETE ON responses
  FOR EACH ROW
  EXECUTE FUNCTION update_request_response_count();

-- ============================================================================
-- AUTO-GENERATE INVOICE NUMBERS
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 'INV-(\d+)') AS INTEGER)), 0) + 1
  INTO next_num
  FROM invoices;

  NEW.invoice_number = 'INV-' || LPAD(next_num::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
  EXECUTE FUNCTION generate_invoice_number();

-- ============================================================================
-- ACTIVITY LOGGING FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_entity_type TEXT,
  p_entity_id UUID,
  p_action TEXT,
  p_changes JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO activity_logs (user_id, entity_type, entity_id, action, changes)
  VALUES (p_user_id, p_entity_type, p_entity_id, p_action, p_changes)
  RETURNING id INTO log_id;
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-profile creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- AUTO-CREATE USER SETTINGS ON PROFILE CREATION
-- ============================================================================
CREATE OR REPLACE FUNCTION handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_profile();

-- ============================================================================
-- GET USER STATS (for user dashboard)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_projects', (SELECT COUNT(*) FROM projects WHERE user_id = p_user_id AND deleted_at IS NULL),
    'active_projects', (SELECT COUNT(*) FROM projects WHERE user_id = p_user_id AND status = 'active' AND deleted_at IS NULL),
    'total_orders', (SELECT COUNT(*) FROM orders WHERE user_id = p_user_id AND deleted_at IS NULL),
    'active_orders', (SELECT COUNT(*) FROM orders WHERE user_id = p_user_id AND status = 'in_progress' AND deleted_at IS NULL),
    'completed_orders', (SELECT COUNT(*) FROM orders WHERE user_id = p_user_id AND status = 'completed' AND deleted_at IS NULL),
    'total_spent', (SELECT COALESCE(SUM(spent), 0) FROM orders WHERE user_id = p_user_id AND deleted_at IS NULL),
    'total_budget', (SELECT COALESCE(SUM(budget), 0) FROM orders WHERE user_id = p_user_id AND deleted_at IS NULL),
    'pending_invoices', (SELECT COUNT(*) FROM invoices WHERE user_id = p_user_id AND status IN ('sent', 'overdue') AND deleted_at IS NULL),
    'total_invoiced', (SELECT COALESCE(SUM(total_amount), 0) FROM invoices WHERE user_id = p_user_id AND deleted_at IS NULL),
    'unread_notifications', (SELECT COUNT(*) FROM notifications WHERE user_id = p_user_id AND is_read = false),
    'unread_messages', (SELECT COUNT(*) FROM messages WHERE recipient_id = p_user_id AND is_read = false AND deleted_at IS NULL),
    'open_tickets', (SELECT COUNT(*) FROM support_tickets WHERE user_id = p_user_id AND status IN ('open', 'in_progress') AND deleted_at IS NULL)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- GET ADMIN METRICS (for admin dashboard)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_admin_metrics()
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_users', (SELECT COUNT(*) FROM profiles WHERE deleted_at IS NULL),
    'active_users', (SELECT COUNT(*) FROM profiles WHERE last_login_at > now() - INTERVAL '30 days' AND deleted_at IS NULL),
    'new_users_this_month', (SELECT COUNT(*) FROM profiles WHERE created_at > date_trunc('month', now()) AND deleted_at IS NULL),
    'total_projects', (SELECT COUNT(*) FROM projects WHERE deleted_at IS NULL),
    'active_projects', (SELECT COUNT(*) FROM projects WHERE status = 'active' AND deleted_at IS NULL),
    'total_orders', (SELECT COUNT(*) FROM orders WHERE deleted_at IS NULL),
    'active_orders', (SELECT COUNT(*) FROM orders WHERE status = 'in_progress' AND deleted_at IS NULL),
    'completed_orders', (SELECT COUNT(*) FROM orders WHERE status = 'completed' AND deleted_at IS NULL),
    'total_revenue', (SELECT COALESCE(SUM(total_amount), 0) FROM invoices WHERE status = 'paid' AND deleted_at IS NULL),
    'pending_revenue', (SELECT COALESCE(SUM(total_amount), 0) FROM invoices WHERE status IN ('sent', 'overdue') AND deleted_at IS NULL),
    'total_requests', (SELECT COUNT(*) FROM requests WHERE deleted_at IS NULL),
    'open_requests', (SELECT COUNT(*) FROM requests WHERE status = 'open' AND deleted_at IS NULL),
    'total_messages', (SELECT COUNT(*) FROM messages WHERE deleted_at IS NULL),
    'open_tickets', (SELECT COUNT(*) FROM support_tickets WHERE status IN ('open', 'in_progress') AND deleted_at IS NULL),
    'avg_project_health', (SELECT COALESCE(AVG(health_score), 0) FROM projects WHERE status = 'active' AND deleted_at IS NULL),
    'avg_order_progress', (SELECT COALESCE(AVG(progress), 0) FROM orders WHERE status = 'in_progress' AND deleted_at IS NULL)
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- GET USER GROWTH (monthly for charts)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_user_growth(p_months INTEGER DEFAULT 12)
RETURNS TABLE (month TEXT, count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(date_trunc('month', created_at), 'Mon YYYY') AS month,
    COUNT(*) AS count
  FROM profiles
  WHERE created_at >= now() - (p_months || ' months')::INTERVAL
    AND deleted_at IS NULL
  GROUP BY date_trunc('month', created_at)
  ORDER BY date_trunc('month', created_at) ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- GET REVENUE BY MONTH (for charts)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_revenue_by_month(p_months INTEGER DEFAULT 12)
RETURNS TABLE (month TEXT, revenue NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(date_trunc('month', paid_date), 'Mon YYYY') AS month,
    COALESCE(SUM(total_amount), 0) AS revenue
  FROM invoices
  WHERE paid_date >= now() - (p_months || ' months')::INTERVAL
    AND status = 'paid'
    AND deleted_at IS NULL
  GROUP BY date_trunc('month', paid_date)
  ORDER BY date_trunc('month', paid_date) ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- SOFT DELETE HELPER
-- ============================================================================
CREATE OR REPLACE FUNCTION soft_delete(p_table TEXT, p_id UUID)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('UPDATE %I SET deleted_at = now() WHERE id = $1', p_table)
  USING p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
