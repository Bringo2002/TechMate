-- ============================================================================
-- TechMate Revenue Dashboard Migration
-- Run this SQL in your Supabase SQL editor to add tables/columns needed
-- for the production-ready Revenue Dashboard.
-- ============================================================================

-- ============================================================================
-- 1. REVENUE TARGETS TABLE
-- Allows admins to set revenue targets per time period.
-- The Revenue Dashboard reads the latest active target to show progress.
-- ============================================================================
CREATE TABLE IF NOT EXISTS revenue_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period_type TEXT NOT NULL DEFAULT 'month'
        CHECK (period_type IN ('day', 'week', 'month', 'quarter', 'year')),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    target_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Prevent duplicate targets for same period
    CONSTRAINT revenue_targets_unique_period UNIQUE (period_type, period_start)
);

-- Index for fast lookups by active period
CREATE INDEX IF NOT EXISTS idx_revenue_targets_period
    ON revenue_targets (period_end DESC, period_start ASC);

-- ============================================================================
-- 2. SERVICE CATEGORIES - Ensure color & icon columns exist
-- (If table already exists, safely add missing columns)
-- ============================================================================
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE service_categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- ============================================================================
-- 3. PROJECTS TABLE - Ensure budget/spent columns exist with defaults
-- (These should already exist, but making it safe to re-run)
-- ============================================================================
ALTER TABLE projects ADD COLUMN IF NOT EXISTS budget NUMERIC(12,2) DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS spent NUMERIC(12,2) DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded', 'waived'));

-- ============================================================================
-- 4. ACTIVITY LOGS - Ensure changes column is JSONB (for budget edit audit)
-- ============================================================================
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS changes JSONB DEFAULT '{}'::jsonb;
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Index for finding budget update activities
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity
    ON activity_logs (entity_type, entity_id, created_at DESC);

-- ============================================================================
-- 5. INVOICES - Ensure all columns the service expects
-- ============================================================================
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_number TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(12,2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sent_date TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS paid_date TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_reference TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

-- Populate empty invoice numbers
UPDATE invoices
SET invoice_number = 'INV-' || substr(id::text, 1, 8)
WHERE invoice_number IS NULL;

-- ============================================================================
-- 6. RLS POLICIES for revenue_targets
-- ============================================================================
ALTER TABLE revenue_targets ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
DROP POLICY IF EXISTS "Admins manage revenue targets" ON revenue_targets;
CREATE POLICY "Admins manage revenue targets"
    ON revenue_targets FOR ALL
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- All authenticated users can read targets (needed for dashboard display)
DROP POLICY IF EXISTS "Authenticated users can view targets" ON revenue_targets;
CREATE POLICY "Authenticated users can view targets"
    ON revenue_targets FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- ============================================================================
-- 7. PERFORMANCE INDEXES for Revenue Dashboard queries
-- ============================================================================

-- Invoice lookups by status and date
CREATE INDEX IF NOT EXISTS idx_invoices_status_created
    ON invoices (status, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_paid_date
    ON invoices (paid_date DESC)
    WHERE status = 'paid' AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_user_status
    ON invoices (user_id, status)
    WHERE deleted_at IS NULL;

-- Project lookups for revenue aggregation
CREATE INDEX IF NOT EXISTS idx_projects_status_budget
    ON projects (status, budget)
    WHERE deleted_at IS NULL AND status != 'cancelled';

CREATE INDEX IF NOT EXISTS idx_projects_payment_status
    ON projects (payment_status, updated_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_projects_type_created
    ON projects (type, created_at DESC)
    WHERE deleted_at IS NULL;

-- ============================================================================
-- 8. SEED DEFAULT REVENUE TARGETS (Optional - for demo/new installs)
-- Comment out if you want to set targets manually via the UI.
-- ============================================================================
INSERT INTO revenue_targets (period_type, period_start, period_end, target_amount, notes)
VALUES
    ('month', date_trunc('month', now()), date_trunc('month', now()) + INTERVAL '1 month' - INTERVAL '1 second', 100000,
     'Monthly revenue target'),
    ('quarter', date_trunc('quarter', now()), date_trunc('quarter', now()) + INTERVAL '3 months' - INTERVAL '1 second', 300000,
     'Quarterly revenue target'),
    ('year', date_trunc('year', now()), date_trunc('year', now()) + INTERVAL '1 year' - INTERVAL '1 second', 1200000,
     'Annual revenue target')
ON CONFLICT (period_type, period_start) DO NOTHING;

-- ============================================================================
-- 9. UPDATED_AT TRIGGER for revenue_targets
-- ============================================================================
CREATE OR REPLACE FUNCTION update_revenue_targets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_revenue_targets_updated ON revenue_targets;
CREATE TRIGGER trg_revenue_targets_updated
    BEFORE UPDATE ON revenue_targets
    FOR EACH ROW
    EXECUTE FUNCTION update_revenue_targets_updated_at();

-- ============================================================================
-- DONE
-- ============================================================================
SELECT 'Revenue Dashboard migration completed successfully!' AS status;
