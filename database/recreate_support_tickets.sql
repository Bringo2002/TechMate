-- ============================================================================
-- TechMate Targeted Recreate: Support Tickets Table
-- Run this if indexes.sql fails on 'status' column
-- This will DROP and RECREATE the table to fix any hidden issues
-- ============================================================================

-- Drop the table (and dependent objects like indexes/policies)
DROP TABLE IF EXISTS support_tickets CASCADE;

-- Recreate it fresh with ALL columns
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'billing', 'technical', 'account', 'feature_request')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting', 'resolved', 'closed')),
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Immediately create the indexes that were failing
CREATE INDEX idx_support_tickets_user ON support_tickets(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_support_tickets_status ON support_tickets(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_support_tickets_assigned ON support_tickets(assigned_to) WHERE deleted_at IS NULL;

-- Enable RLS immediately
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Confirm success
SELECT 'Support tickets table recreated successfully!' as status;
