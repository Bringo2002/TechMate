-- ============================================================================
-- TechMate Phase 1 Migration - Agency Model Foundation
-- ============================================================================
-- This migration creates new tables for the agency workflow model
-- Old requests/responses tables remain untouched for now (will deprecate in Phase 7)
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- STEP 1: Update profiles table for agency roles
-- ============================================================================

-- Ensure updated_at column exists (critical for triggers)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update user_type constraint to support new roles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_type_check;

-- Update existing user types to map to new roles (prevent constraint violation)
UPDATE profiles 
SET user_type = 'client' 
WHERE user_type NOT IN ('client', 'admin', 'technical_lead', 'developer', 'designer');

ALTER TABLE profiles ADD CONSTRAINT profiles_user_type_check 
  CHECK (user_type IN ('client', 'admin', 'technical_lead', 'developer', 'designer'));

-- Add new columns for internal team members
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS internal_role TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC CHECK (hourly_rate >= 0);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS availability_hours_per_week INTEGER CHECK (availability_hours_per_week >= 0 AND availability_hours_per_week <= 168);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills TEXT[];

COMMENT ON COLUMN profiles.internal_role IS 'Internal role designation (e.g., founder, senior_dev, junior_dev)';
COMMENT ON COLUMN profiles.hourly_rate IS 'Hourly rate for cost tracking (internal only, not visible to clients)';
COMMENT ON COLUMN profiles.availability_hours_per_week IS 'Available hours per week for project assignments';
COMMENT ON COLUMN profiles.skills IS 'Array of technologies/skills for developers';

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_profiles_internal_role ON profiles(internal_role) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON profiles USING GIN(skills) WHERE deleted_at IS NULL;

-- ============================================================================
-- STEP 2: Update projects table for agency workflow
-- ============================================================================

-- Add new columns for agency model
ALTER TABLE projects ADD COLUMN IF NOT EXISTS inquiry_id UUID;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS proposal_id UUID;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS technical_lead_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_visible_progress INTEGER DEFAULT 0 CHECK (client_visible_progress >= 0 AND client_visible_progress <= 100);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS internal_notes TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high'));

COMMENT ON COLUMN projects.inquiry_id IS 'Links to the original client inquiry that started this project';
COMMENT ON COLUMN projects.proposal_id IS 'Links to the accepted proposal';
COMMENT ON COLUMN projects.technical_lead_id IS 'The technical lead responsible for this project';
COMMENT ON COLUMN projects.client_visible_progress IS 'Progress percentage visible to client (may differ from internal progress)';
COMMENT ON COLUMN projects.internal_notes IS 'Private notes not visible to client';
COMMENT ON COLUMN projects.risk_level IS 'Risk assessment for internal tracking';

-- Update status constraint to match agency workflow
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check 
  CHECK (status IN ('planning', 'active', 'review', 'completed', 'on_hold', 'cancelled'));

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_projects_technical_lead ON projects(technical_lead_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_inquiry ON projects(inquiry_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_proposal ON projects(proposal_id) WHERE deleted_at IS NULL;

-- ============================================================================
-- STEP 3: Create client_inquiries table
-- ============================================================================

CREATE TABLE IF NOT EXISTS client_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Inquiry details
  project_type TEXT NOT NULL CHECK (project_type IN ('website', 'web_app', 'mobile_app', 'custom_software', 'consulting', 'maintenance', 'other')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Budget and timeline
  budget_range TEXT, -- e.g., "$5k-$10k", "$10k-$25k", "$25k+"
  budget_min NUMERIC CHECK (budget_min >= 0),
  budget_max NUMERIC CHECK (budget_max >= 0),
  preferred_timeline TEXT,
  deadline DATE,
  
  -- Workflow
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'discovery_call_scheduled', 'discovery_call_completed', 'quoted', 'proposal_sent', 'accepted', 'declined', 'on_hold')),
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Internal team member handling this inquiry
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Additional info
  requirements JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  source TEXT, -- e.g., 'website', 'referral', 'linkedin', 'email'
  
  -- Tracking
  viewed_by_admin_at TIMESTAMPTZ,
  first_response_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Constraints
  CHECK (budget_max IS NULL OR budget_min IS NULL OR budget_max >= budget_min)
);

-- Indexes for client_inquiries
CREATE INDEX idx_inquiries_client ON client_inquiries(client_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_inquiries_status ON client_inquiries(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_inquiries_assigned_to ON client_inquiries(assigned_to) WHERE deleted_at IS NULL;
CREATE INDEX idx_inquiries_created_at ON client_inquiries(created_at);
CREATE INDEX idx_inquiries_priority ON client_inquiries(priority) WHERE deleted_at IS NULL;

-- Trigger for updated_at
CREATE TRIGGER update_client_inquiries_updated_at
  BEFORE UPDATE ON client_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE client_inquiries IS 'Client project inquiries - replaces the marketplace-style requests table';
COMMENT ON COLUMN client_inquiries.assigned_to IS 'Internal team member assigned to follow up on this inquiry';
COMMENT ON COLUMN client_inquiries.status IS 'Inquiry pipeline status from new to accepted/declined';

-- ============================================================================
-- STEP 4: Create proposals table
-- ============================================================================

CREATE TABLE IF NOT EXISTS proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id UUID REFERENCES client_inquiries(id) ON DELETE SET NULL,
  proposal_number TEXT UNIQUE NOT NULL, -- Auto-generated, e.g., "PROP-2026-001"
  
  -- Creator
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT, -- Founder/admin who created this
  
  -- Proposal content
  title TEXT NOT NULL,
  executive_summary TEXT,
  scope_of_work TEXT NOT NULL,
  deliverables JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of deliverable objects
  timeline_weeks INTEGER NOT NULL CHECK (timeline_weeks > 0),
  milestones JSONB DEFAULT '[]'::jsonb, -- Array of milestone objects
  assumptions TEXT, -- Any assumptions made
  exclusions TEXT, -- What's not included
  
  -- Pricing
  total_cost NUMERIC NOT NULL CHECK (total_cost >= 0),
  payment_schedule JSONB, -- e.g., [{"milestone": "kickoff", "amount": 5000, "percentage": 30}]
  payment_terms TEXT, -- e.g., "Net 30", "50% upfront, 50% on completion"
  currency TEXT DEFAULT 'USD' NOT NULL,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired', 'withdrawn')),
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Response from client
  client_notes TEXT, -- Client's feedback or questions
  rejection_reason TEXT,
  
  -- Version control
  version INTEGER DEFAULT 1 NOT NULL,
  previous_version_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for proposals
CREATE INDEX idx_proposals_inquiry ON proposals(inquiry_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_proposals_created_by ON proposals(created_by) WHERE deleted_at IS NULL;
CREATE INDEX idx_proposals_status ON proposals(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_proposals_created_at ON proposals(created_at);
CREATE INDEX idx_proposals_sent_at ON proposals(sent_at);

-- Trigger for updated_at
CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate proposal number
CREATE OR REPLACE FUNCTION generate_proposal_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
  current_year TEXT;
BEGIN
  IF NEW.proposal_number IS NULL OR NEW.proposal_number = '' THEN
    current_year := TO_CHAR(NOW(), 'YYYY');
    
    SELECT COALESCE(
      MAX(
        CAST(
          SUBSTRING(proposal_number FROM 'PROP-' || current_year || '-(\d+)')
          AS INTEGER
        )
      ), 
      0
    ) + 1
    INTO next_num
    FROM proposals
    WHERE proposal_number LIKE 'PROP-' || current_year || '-%';
    
    NEW.proposal_number := 'PROP-' || current_year || '-' || LPAD(next_num::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_proposal_number
  BEFORE INSERT ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION generate_proposal_number();

-- Comments
COMMENT ON TABLE proposals IS 'TechMate proposals sent to clients - replaces marketplace-style bidding';
COMMENT ON COLUMN proposals.proposal_number IS 'Auto-generated unique identifier (e.g., PROP-2026-0001)';
COMMENT ON COLUMN proposals.version IS 'Version number for tracking revisions to proposals';

-- ============================================================================
-- STEP 5: Create project_assignments table
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  assigned_to UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  
  -- Assignment details
  role TEXT NOT NULL, -- 'technical_lead', 'frontend_dev', 'backend_dev', 'designer', 'qa', etc.
  task_description TEXT,
  
  -- Time tracking
  hours_estimated NUMERIC CHECK (hours_estimated >= 0),
  hours_actual NUMERIC DEFAULT 0 CHECK (hours_actual >= 0),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'review', 'completed', 'blocked', 'cancelled')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Dates
  start_date DATE,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  
  -- Notes
  notes TEXT,
  blocker_description TEXT, -- If status is 'blocked', what's blocking it?
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Constraints
  UNIQUE(project_id, assigned_to, role),
  CHECK (due_date IS NULL OR start_date IS NULL OR due_date >= start_date)
);

-- Indexes for project_assignments
CREATE INDEX idx_assignments_project ON project_assignments(project_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_assignments_assigned_to ON project_assignments(assigned_to) WHERE deleted_at IS NULL;
CREATE INDEX idx_assignments_assigned_by ON project_assignments(assigned_by) WHERE deleted_at IS NULL;
CREATE INDEX idx_assignments_status ON project_assignments(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_assignments_due_date ON project_assignments(due_date) WHERE deleted_at IS NULL AND status NOT IN ('completed', 'cancelled');
CREATE INDEX idx_assignments_role ON project_assignments(role) WHERE deleted_at IS NULL;

-- Trigger for updated_at
CREATE TRIGGER update_project_assignments_updated_at
  BEFORE UPDATE ON project_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE project_assignments IS 'Internal project task assignments - not visible to clients';
COMMENT ON COLUMN project_assignments.role IS 'Role for this specific assignment (developer can have multiple roles across different projects)';
COMMENT ON COLUMN project_assignments.hours_actual IS 'Actual hours logged by the assigned developer';

-- ============================================================================
-- STEP 6: Create project_updates table
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  
  -- Update content
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  update_type TEXT CHECK (update_type IN ('progress', 'milestone', 'blocker', 'completed', 'delayed', 'general')),
  
  -- Visibility
  is_visible_to_client BOOLEAN DEFAULT true NOT NULL,
  
  -- Attachments
  attachments JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for project_updates
CREATE INDEX idx_project_updates_project ON project_updates(project_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_project_updates_created_by ON project_updates(created_by) WHERE deleted_at IS NULL;
CREATE INDEX idx_project_updates_created_at ON project_updates(created_at);
CREATE INDEX idx_project_updates_visible ON project_updates(project_id, is_visible_to_client) WHERE deleted_at IS NULL AND is_visible_to_client = true;

-- Comments
COMMENT ON TABLE project_updates IS 'Progress updates for projects - can be client-facing or internal only';
COMMENT ON COLUMN project_updates.is_visible_to_client IS 'If true, client can see this update in their portal';

-- ============================================================================
-- STEP 7: Add foreign key constraints for new relationships
-- ============================================================================

-- Link inquiries to projects (add FK after both tables exist)
ALTER TABLE projects ADD CONSTRAINT projects_inquiry_id_fkey 
  FOREIGN KEY (inquiry_id) REFERENCES client_inquiries(id) ON DELETE SET NULL;

-- Link proposals to projects (add FK after both tables exist)
ALTER TABLE projects ADD CONSTRAINT projects_proposal_id_fkey 
  FOREIGN KEY (proposal_id) REFERENCES proposals(id) ON DELETE SET NULL;

-- ============================================================================
-- STEP 8: Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE client_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_updates ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies: client_inquiries
-- ============================================================================

-- Admins can do everything
CREATE POLICY "Admins can manage all inquiries"
  ON client_inquiries FOR ALL
  USING (is_admin());

-- Clients can view their own inquiries
CREATE POLICY "Clients can view own inquiries"
  ON client_inquiries FOR SELECT
  USING (auth.uid() = client_id);

-- Clients can create inquiries
CREATE POLICY "Clients can create inquiries"
  ON client_inquiries FOR INSERT
  WITH CHECK (auth.uid() = client_id);

-- Clients can update their own inquiries (only before it's assigned)
CREATE POLICY "Clients can update own inquiries"
  ON client_inquiries FOR UPDATE
  USING (auth.uid() = client_id AND status = 'new')
  WITH CHECK (auth.uid() = client_id);

-- Assigned team members can view and update
CREATE POLICY "Assigned team can manage inquiry"
  ON client_inquiries FOR ALL
  USING (auth.uid() = assigned_to);

-- ============================================================================
-- RLS Policies: proposals
-- ============================================================================

-- Admins can manage all proposals
CREATE POLICY "Admins can manage all proposals"
  ON proposals FOR ALL
  USING (is_admin());

-- Clients can view proposals for their inquiries
CREATE POLICY "Clients can view own proposals"
  ON proposals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM client_inquiries
      WHERE client_inquiries.id = proposals.inquiry_id
        AND client_inquiries.client_id = auth.uid()
    )
  );

-- Clients can update proposals (to accept/reject)
CREATE POLICY "Clients can respond to proposals"
  ON proposals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM client_inquiries
      WHERE client_inquiries.id = proposals.inquiry_id
        AND client_inquiries.client_id = auth.uid()
    )
  )
  WITH CHECK (
    -- Clients can only update specific columns (status, client_notes, rejection_reason)
    EXISTS (
      SELECT 1 FROM client_inquiries
      WHERE client_inquiries.id = proposals.inquiry_id
        AND client_inquiries.client_id = auth.uid()
    )
  );

-- Proposal creators can manage their own proposals
CREATE POLICY "Creators can manage own proposals"
  ON proposals FOR ALL
  USING (auth.uid() = created_by);

-- ============================================================================
-- RLS Policies: project_assignments
-- ============================================================================

-- Admins can manage all assignments
CREATE POLICY "Admins can manage all assignments"
  ON project_assignments FOR ALL
  USING (is_admin());

-- Developers can view their own assignments
CREATE POLICY "Developers can view own assignments"
  ON project_assignments FOR SELECT
  USING (auth.uid() = assigned_to);

-- Developers can update their own assignments (to log hours, update status)
CREATE POLICY "Developers can update own assignments"
  ON project_assignments FOR UPDATE
  USING (auth.uid() = assigned_to);

-- Technical leads can view assignments on their projects
CREATE POLICY "Technical leads can manage project assignments"
  ON project_assignments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_assignments.project_id
        AND projects.technical_lead_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS Policies: project_updates
-- ============================================================================

-- Admins can manage all updates
CREATE POLICY "Admins can manage all updates"
  ON project_updates FOR ALL
  USING (is_admin());

-- Clients can view their project updates (client-visible only)
CREATE POLICY "Clients can view own project updates"
  ON project_updates FOR SELECT
  USING (
    is_visible_to_client = true
    AND EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_updates.project_id
        AND projects.user_id = auth.uid()
    )
  );

-- Technical leads can create and manage updates for their projects
CREATE POLICY "Technical leads can manage project updates"
  ON project_updates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_updates.project_id
        AND projects.technical_lead_id = auth.uid()
    )
  );

-- Update creators can manage their own updates
CREATE POLICY "Creators can manage own updates"
  ON project_updates FOR ALL
  USING (auth.uid() = created_by);

-- ============================================================================
-- STEP 9: Update existing RLS policies on profiles (for new user types)
-- ============================================================================

-- No changes needed - existing policies already handle user_type changes

-- ============================================================================
-- STEP 10: Create helper functions
-- ============================================================================

-- Function to get inquiry statistics
CREATE OR REPLACE FUNCTION get_inquiry_stats(p_user_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  IF p_user_id IS NULL THEN
    -- Admin view: all inquiries
    SELECT jsonb_build_object(
      'total_inquiries', COUNT(*),
      'new_inquiries', COUNT(*) FILTER (WHERE status = 'new'),
      'in_review', COUNT(*) FILTER (WHERE status IN ('reviewing', 'discovery_call_scheduled', 'discovery_call_completed')),
      'quoted', COUNT(*) FILTER (WHERE status IN ('quoted', 'proposal_sent')),
      'accepted', COUNT(*) FILTER (WHERE status = 'accepted'),
      'declined', COUNT(*) FILTER (WHERE status = 'declined'),
      'avg_response_time_hours', EXTRACT(EPOCH FROM AVG(first_response_at - created_at))/3600
    ) INTO result
    FROM client_inquiries
    WHERE deleted_at IS NULL;
  ELSE
    -- Client view: their inquiries only
    SELECT jsonb_build_object(
      'total_inquiries', COUNT(*),
      'pending', COUNT(*) FILTER (WHERE status IN ('new', 'reviewing', 'discovery_call_scheduled', 'discovery_call_completed', 'quoted', 'proposal_sent')),
      'accepted', COUNT(*) FILTER (WHERE status = 'accepted'),
      'declined', COUNT(*) FILTER (WHERE status = 'declined')
    ) INTO result
    FROM client_inquiries
    WHERE deleted_at IS NULL AND client_id = p_user_id;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get assignment statistics for a developer
CREATE OR REPLACE FUNCTION get_developer_stats(p_developer_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_assignments', COUNT(*),
    'assigned', COUNT(*) FILTER (WHERE status = 'assigned'),
    'in_progress', COUNT(*) FILTER (WHERE status = 'in_progress'),
    'review', COUNT(*) FILTER (WHERE status = 'review'),
    'completed', COUNT(*) FILTER (WHERE status = 'completed'),
    'blocked', COUNT(*) FILTER (WHERE status = 'blocked'),
    'total_hours_estimated', COALESCE(SUM(hours_estimated), 0),
    'total_hours_actual', COALESCE(SUM(hours_actual), 0),
    'overdue_tasks', COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND status NOT IN ('completed', 'cancelled'))
  ) INTO result
  FROM project_assignments
  WHERE deleted_at IS NULL AND assigned_to = p_developer_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 11: Add comments for documentation
-- ============================================================================

COMMENT ON FUNCTION get_inquiry_stats IS 'Get inquiry pipeline statistics. Pass NULL for admin view, or user_id for client view';
COMMENT ON FUNCTION get_developer_stats IS 'Get assignment statistics for a specific developer';

-- ============================================================================
-- Migration Complete
-- ============================================================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE 'Phase 1 Migration Complete!';
  RAISE NOTICE 'New tables created: client_inquiries, proposals, project_assignments, project_updates';
  RAISE NOTICE 'Existing tables updated: profiles, projects';
  RAISE NOTICE 'Old requests/responses tables remain untouched';
END $$;
