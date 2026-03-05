-- ============================================================================
-- TechMate Deployments Migration
-- Tables for CI/CD deployment tracking, environments, and pipeline stages
-- ============================================================================

-- Enable required extensions (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ENVIRONMENTS
-- Tracks deployment target environments (production, staging, dev, preview)
-- ============================================================================
CREATE TABLE IF NOT EXISTS environments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'development'
    CHECK (type IN ('production', 'staging', 'development', 'preview')),
  status TEXT NOT NULL DEFAULT 'healthy'
    CHECK (status IN ('healthy', 'degraded', 'down', 'deploying')),
  version TEXT,
  url TEXT,
  region TEXT DEFAULT 'us-east-1',
  uptime NUMERIC(5,2) DEFAULT 100.00 CHECK (uptime >= 0 AND uptime <= 100),
  response_time INTEGER DEFAULT 0,
  error_rate NUMERIC(5,2) DEFAULT 0.00,
  traffic INTEGER DEFAULT 0,
  instances INTEGER DEFAULT 1,
  last_deployed_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- 2. DEPLOYMENTS
-- Core deployment records with full CI/CD pipeline tracking
-- ============================================================================
CREATE TABLE IF NOT EXISTS deployments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deploy_number SERIAL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  environment_id UUID REFERENCES environments(id) ON DELETE SET NULL,
  project_name TEXT NOT NULL,
  environment_name TEXT NOT NULL DEFAULT 'development',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'building', 'testing', 'deploying', 'success', 'failed', 'rolled-back', 'cancelled')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  current_stage TEXT DEFAULT 'queue'
    CHECK (current_stage IN ('queue', 'clone', 'build', 'test', 'deploy', 'verify', 'complete')),

  -- Git info
  branch TEXT,
  commit_hash TEXT,
  commit_message TEXT,

  -- Trigger info
  triggered_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  triggered_by_name TEXT,
  trigger_type TEXT DEFAULT 'manual'
    CHECK (trigger_type IN ('manual', 'push', 'merge', 'schedule', 'rollback', 'webhook')),

  -- Build metrics (stored as JSONB for flexibility)
  build_metrics JSONB DEFAULT '{}'::jsonb,
  -- Expected shape: { buildTime, testsPassed, testsTotal, coverage, bundleSize }

  -- Lighthouse scores
  lighthouse JSONB DEFAULT '{}'::jsonb,
  -- Expected shape: { performance, accessibility, bestPractices, seo }

  -- Timing
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  duration INTEGER, -- seconds

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- 3. DEPLOYMENT_STAGES
-- Individual pipeline stage records for each deployment
-- ============================================================================
CREATE TABLE IF NOT EXISTS deployment_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deployment_id UUID NOT NULL REFERENCES deployments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  stage_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'success', 'failed', 'skipped')),
  duration INTEGER, -- seconds
  logs TEXT[],
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- 4. DEPLOYMENT_INSIGHTS
-- AI-generated insights and recommendations for deployments
-- ============================================================================
CREATE TABLE IF NOT EXISTS deployment_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deployment_id UUID REFERENCES deployments(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'recommendation'
    CHECK (type IN ('prediction', 'optimization', 'alert', 'recommendation')),
  priority TEXT NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  title TEXT NOT NULL,
  description TEXT,
  impact TEXT,
  confidence INTEGER DEFAULT 50 CHECK (confidence >= 0 AND confidence <= 100),
  action_label TEXT,
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- 5. INDEXES for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_deployments_status ON deployments(status);
CREATE INDEX IF NOT EXISTS idx_deployments_environment ON deployments(environment_id);
CREATE INDEX IF NOT EXISTS idx_deployments_project ON deployments(project_id);
CREATE INDEX IF NOT EXISTS idx_deployments_created ON deployments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deployments_triggered_by ON deployments(triggered_by);
CREATE INDEX IF NOT EXISTS idx_deployment_stages_deployment ON deployment_stages(deployment_id);
CREATE INDEX IF NOT EXISTS idx_deployment_stages_status ON deployment_stages(status);
CREATE INDEX IF NOT EXISTS idx_deployment_insights_deployment ON deployment_insights(deployment_id);
CREATE INDEX IF NOT EXISTS idx_deployment_insights_type ON deployment_insights(type);
CREATE INDEX IF NOT EXISTS idx_environments_type ON environments(type);
CREATE INDEX IF NOT EXISTS idx_environments_status ON environments(status);

-- ============================================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_insights ENABLE ROW LEVEL SECURITY;

-- Environments: admins can manage, authenticated users can read
CREATE POLICY environments_select ON environments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY environments_admin_all ON environments
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- Deployments: admins full access, users can read their own triggered deployments
CREATE POLICY deployments_select ON deployments
  FOR SELECT TO authenticated
  USING (
    triggered_by = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

CREATE POLICY deployments_admin_insert ON deployments
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

CREATE POLICY deployments_admin_update ON deployments
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

CREATE POLICY deployments_admin_delete ON deployments
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- Deployment stages: follow parent deployment visibility
CREATE POLICY deployment_stages_select ON deployment_stages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deployments d
      WHERE d.id = deployment_stages.deployment_id
      AND (d.triggered_by = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
    )
  );

CREATE POLICY deployment_stages_admin_all ON deployment_stages
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- Deployment insights: follow parent deployment visibility
CREATE POLICY deployment_insights_select ON deployment_insights
  FOR SELECT TO authenticated
  USING (
    deployment_id IS NULL
    OR EXISTS (
      SELECT 1 FROM deployments d
      WHERE d.id = deployment_insights.deployment_id
      AND (d.triggered_by = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
    )
  );

CREATE POLICY deployment_insights_admin_all ON deployment_insights
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- ============================================================================
-- 7. HELPER FUNCTIONS
-- ============================================================================

-- Function to compute deployment metrics for the dashboard
CREATE OR REPLACE FUNCTION get_deployment_metrics(days_back INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_deployments', (
      SELECT COUNT(*) FROM deployments
      WHERE created_at >= now() - (days_back || ' days')::interval
      AND deleted_at IS NULL
    ),
    'successful_deployments', (
      SELECT COUNT(*) FROM deployments
      WHERE status = 'success'
      AND created_at >= now() - (days_back || ' days')::interval
      AND deleted_at IS NULL
    ),
    'failed_deployments', (
      SELECT COUNT(*) FROM deployments
      WHERE status = 'failed'
      AND created_at >= now() - (days_back || ' days')::interval
      AND deleted_at IS NULL
    ),
    'success_rate', (
      SELECT CASE
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND((COUNT(*) FILTER (WHERE status = 'success')::numeric / COUNT(*)::numeric) * 100, 1)
      END
      FROM deployments
      WHERE created_at >= now() - (days_back || ' days')::interval
      AND deleted_at IS NULL
    ),
    'avg_duration', (
      SELECT COALESCE(ROUND(AVG(duration)), 0)
      FROM deployments
      WHERE status = 'success'
      AND duration IS NOT NULL
      AND created_at >= now() - (days_back || ' days')::interval
      AND deleted_at IS NULL
    ),
    'deploys_today', (
      SELECT COUNT(*) FROM deployments
      WHERE created_at >= CURRENT_DATE
      AND deleted_at IS NULL
    ),
    'active_instances', (
      SELECT COALESCE(SUM(instances), 0) FROM environments
      WHERE is_active = true
    ),
    'total_regions', (
      SELECT COUNT(DISTINCT region) FROM environments
      WHERE is_active = true
    )
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get today's deployment summary 
CREATE OR REPLACE FUNCTION get_today_deployment_summary()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total', COUNT(*),
    'success', COUNT(*) FILTER (WHERE status = 'success'),
    'failed', COUNT(*) FILTER (WHERE status = 'failed'),
    'in_progress', COUNT(*) FILTER (WHERE status IN ('pending', 'building', 'testing', 'deploying')),
    'rolled_back', COUNT(*) FILTER (WHERE status = 'rolled-back')
  )
  FROM deployments
  WHERE created_at >= CURRENT_DATE
  AND deleted_at IS NULL
  INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated_at trigger function (reuse if exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_environments_updated_at ON environments;
CREATE TRIGGER update_environments_updated_at
  BEFORE UPDATE ON environments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_deployments_updated_at ON deployments;
CREATE TRIGGER update_deployments_updated_at
  BEFORE UPDATE ON deployments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. SEED DATA (Default environments)
-- ============================================================================
INSERT INTO environments (name, type, status, version, url, region, uptime, response_time, error_rate, traffic, instances)
VALUES
  ('Production', 'production', 'healthy', 'v1.0.0', 'https://app.nyxdev.com', 'us-east-1', 99.98, 142, 0.02, 45230, 12),
  ('Staging', 'staging', 'healthy', 'v1.1.0-rc.1', 'https://staging.nyxdev.com', 'us-west-2', 99.85, 156, 0.05, 1250, 3),
  ('Development', 'development', 'healthy', 'v1.1.0-beta.3', 'https://dev.nyxdev.com', 'us-east-2', 98.42, 189, 0.12, 420, 2),
  ('Preview', 'preview', 'healthy', 'pr-latest', 'https://preview.nyxdev.com', 'us-east-1', 100, 165, 0.00, 85, 1)
ON CONFLICT DO NOTHING;
