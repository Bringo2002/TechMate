-- ============================================================================
-- TechMate Deployments V2 Migration
-- Adds: Deployment Logs, Approval Gating, Search, History, Environment Promotion
-- Run AFTER deployments_migration.sql
-- ============================================================================

-- ============================================================================
-- 1. NEW COLUMNS ON DEPLOYMENTS
-- Approval gating, promotion tracking, full-text search
-- ============================================================================

-- Approval workflow columns
ALTER TABLE deployments
  ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'not_required'
    CHECK (approval_status IN ('not_required', 'pending', 'approved', 'rejected'));

ALTER TABLE deployments
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL;

ALTER TABLE deployments
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Environment promotion chain
ALTER TABLE deployments
  ADD COLUMN IF NOT EXISTS promoted_from_deployment_id UUID REFERENCES deployments(id) ON DELETE SET NULL;

-- Rollback chain tracking
ALTER TABLE deployments
  ADD COLUMN IF NOT EXISTS rollback_from_deployment_id UUID REFERENCES deployments(id) ON DELETE SET NULL;

-- Full-text search vector
ALTER TABLE deployments
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- ============================================================================
-- 2. DEPLOYMENT_LOGS
-- Fine-grained, timestamped log entries per deployment (per stage)
-- ============================================================================
CREATE TABLE IF NOT EXISTS deployment_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deployment_id UUID NOT NULL REFERENCES deployments(id) ON DELETE CASCADE,
  stage_name TEXT,
  level TEXT NOT NULL DEFAULT 'info'
    CHECK (level IN ('info', 'warn', 'error', 'debug', 'success')),
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  source TEXT, -- e.g. 'ci-runner', 'build-agent', 'test-suite', 'deploy-agent'
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- 3. DEPLOYMENT_APPROVALS
-- Approval workflow for production deployments
-- ============================================================================
CREATE TABLE IF NOT EXISTS deployment_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deployment_id UUID NOT NULL REFERENCES deployments(id) ON DELETE CASCADE,
  requested_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  requested_by_name TEXT,
  reviewer UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewer_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  notes TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================================================
-- 4. INDEXES
-- ============================================================================

-- Deployment logs
CREATE INDEX IF NOT EXISTS idx_deployment_logs_deployment ON deployment_logs(deployment_id);
CREATE INDEX IF NOT EXISTS idx_deployment_logs_deployment_stage ON deployment_logs(deployment_id, stage_name);
CREATE INDEX IF NOT EXISTS idx_deployment_logs_level ON deployment_logs(level);
CREATE INDEX IF NOT EXISTS idx_deployment_logs_timestamp ON deployment_logs(timestamp DESC);

-- Deployment approvals
CREATE INDEX IF NOT EXISTS idx_deployment_approvals_deployment ON deployment_approvals(deployment_id);
CREATE INDEX IF NOT EXISTS idx_deployment_approvals_status ON deployment_approvals(status);
CREATE INDEX IF NOT EXISTS idx_deployment_approvals_reviewer ON deployment_approvals(reviewer);

-- Deployments search + history
CREATE INDEX IF NOT EXISTS idx_deployments_search_vector ON deployments USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_deployments_approval_status ON deployments(approval_status);
CREATE INDEX IF NOT EXISTS idx_deployments_project_created ON deployments(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deployments_project_name ON deployments(project_name);

-- ============================================================================
-- 5. SEARCH VECTOR TRIGGER
-- Auto-update tsvector on insert/update for full-text search
-- ============================================================================
CREATE OR REPLACE FUNCTION deployments_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.project_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.environment_name, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.branch, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.commit_message, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.triggered_by_name, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(NEW.commit_hash, '')), 'D');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS deployments_search_vector_trigger ON deployments;
CREATE TRIGGER deployments_search_vector_trigger
  BEFORE INSERT OR UPDATE OF project_name, environment_name, branch, commit_message, triggered_by_name, commit_hash
  ON deployments
  FOR EACH ROW EXECUTE FUNCTION deployments_search_vector_update();

-- Back-fill search vectors for existing rows
UPDATE deployments SET search_vector =
  setweight(to_tsvector('english', COALESCE(project_name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(environment_name, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(branch, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(commit_message, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(triggered_by_name, '')), 'C') ||
  setweight(to_tsvector('english', COALESCE(commit_hash, '')), 'D')
WHERE search_vector IS NULL;

-- ============================================================================
-- 6. ROW LEVEL SECURITY FOR NEW TABLES
-- ============================================================================

ALTER TABLE deployment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_approvals ENABLE ROW LEVEL SECURITY;

-- Deployment logs: follow parent deployment visibility
CREATE POLICY deployment_logs_select ON deployment_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deployments d
      WHERE d.id = deployment_logs.deployment_id
      AND (d.triggered_by = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
    )
  );

CREATE POLICY deployment_logs_admin_all ON deployment_logs
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- Deployment approvals: admin full access, assigned reviewers can update
CREATE POLICY deployment_approvals_select ON deployment_approvals
  FOR SELECT TO authenticated
  USING (
    requested_by = auth.uid()
    OR reviewer = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

CREATE POLICY deployment_approvals_admin_all ON deployment_approvals
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- Reviewers can update approvals assigned to them
CREATE POLICY deployment_approvals_reviewer_update ON deployment_approvals
  FOR UPDATE TO authenticated
  USING (reviewer = auth.uid())
  WITH CHECK (reviewer = auth.uid());

-- ============================================================================
-- 7. SEARCH DEPLOYMENTS FUNCTION
-- Full-text search with filters and pagination
-- ============================================================================
CREATE OR REPLACE FUNCTION search_deployments(
  search_query TEXT DEFAULT NULL,
  status_filter TEXT DEFAULT NULL,
  project_filter UUID DEFAULT NULL,
  env_filter UUID DEFAULT NULL,
  date_from TIMESTAMPTZ DEFAULT NULL,
  date_to TIMESTAMPTZ DEFAULT NULL,
  page_num INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 20
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  total_count INTEGER;
  offset_val INTEGER;
BEGIN
  offset_val := (page_num - 1) * page_size;

  -- Count total matches
  SELECT COUNT(*) INTO total_count
  FROM deployments
  WHERE deleted_at IS NULL
    AND (search_query IS NULL OR search_query = '' OR search_vector @@ plainto_tsquery('english', search_query))
    AND (status_filter IS NULL OR status_filter = 'all' OR status = status_filter)
    AND (project_filter IS NULL OR project_id = project_filter)
    AND (env_filter IS NULL OR environment_id = env_filter)
    AND (date_from IS NULL OR created_at >= date_from)
    AND (date_to IS NULL OR created_at <= date_to);

  -- Fetch paginated results
  SELECT json_build_object(
    'deployments', COALESCE((
      SELECT json_agg(row_to_json(d))
      FROM (
        SELECT
          dep.*,
          COALESCE(
            (SELECT json_agg(row_to_json(s) ORDER BY s.stage_order)
             FROM deployment_stages s WHERE s.deployment_id = dep.id),
            '[]'::json
          ) AS stages,
          COALESCE(
            (SELECT json_agg(row_to_json(a) ORDER BY a.created_at DESC)
             FROM deployment_approvals a WHERE a.deployment_id = dep.id),
            '[]'::json
          ) AS approvals
        FROM deployments dep
        WHERE dep.deleted_at IS NULL
          AND (search_query IS NULL OR search_query = '' OR dep.search_vector @@ plainto_tsquery('english', search_query))
          AND (status_filter IS NULL OR status_filter = 'all' OR dep.status = status_filter)
          AND (project_filter IS NULL OR dep.project_id = project_filter)
          AND (env_filter IS NULL OR dep.environment_id = env_filter)
          AND (date_from IS NULL OR dep.created_at >= date_from)
          AND (date_to IS NULL OR dep.created_at <= date_to)
        ORDER BY
          CASE WHEN search_query IS NOT NULL AND search_query != ''
               THEN ts_rank(dep.search_vector, plainto_tsquery('english', search_query))
               ELSE 0 END DESC,
          dep.created_at DESC
        LIMIT page_size
        OFFSET offset_val
      ) d
    ), '[]'::json),
    'total', total_count,
    'page', page_num,
    'page_size', page_size,
    'total_pages', CEIL(total_count::numeric / page_size::numeric)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. GET DEPLOYMENT HISTORY (per project, paginated)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_deployment_history(
  p_project_id UUID DEFAULT NULL,
  p_page INTEGER DEFAULT 1,
  p_per_page INTEGER DEFAULT 20
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  total_count INTEGER;
  v_offset INTEGER;
BEGIN
  v_offset := (p_page - 1) * p_per_page;

  SELECT COUNT(*) INTO total_count
  FROM deployments
  WHERE deleted_at IS NULL
    AND (p_project_id IS NULL OR project_id = p_project_id);

  SELECT json_build_object(
    'deployments', COALESCE((
      SELECT json_agg(row_to_json(d))
      FROM (
        SELECT
          dep.id, dep.deploy_number, dep.project_id, dep.project_name,
          dep.environment_id, dep.environment_name, dep.status,
          dep.branch, dep.commit_hash, dep.commit_message,
          dep.triggered_by_name, dep.trigger_type,
          dep.approval_status, dep.duration,
          dep.started_at, dep.completed_at, dep.created_at,
          dep.build_metrics, dep.lighthouse
        FROM deployments dep
        WHERE dep.deleted_at IS NULL
          AND (p_project_id IS NULL OR dep.project_id = p_project_id)
        ORDER BY dep.created_at DESC
        LIMIT p_per_page
        OFFSET v_offset
      ) d
    ), '[]'::json),
    'total', total_count,
    'page', p_page,
    'per_page', p_per_page,
    'total_pages', CEIL(total_count::numeric / p_per_page::numeric)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 9. PROMOTE DEPLOYMENT
-- Creates a new deployment on a target environment from a source deployment
-- ============================================================================
CREATE OR REPLACE FUNCTION promote_deployment(
  source_deployment_id UUID,
  target_environment_id UUID,
  promoter_id UUID
)
RETURNS JSON AS $$
DECLARE
  source_dep deployments%ROWTYPE;
  target_env environments%ROWTYPE;
  new_dep_id UUID;
  promoter_name TEXT;
  result JSON;
BEGIN
  -- Get source deployment
  SELECT * INTO source_dep FROM deployments WHERE id = source_deployment_id AND deleted_at IS NULL;
  IF source_dep IS NULL THEN
    RAISE EXCEPTION 'Source deployment not found';
  END IF;
  IF source_dep.status != 'success' THEN
    RAISE EXCEPTION 'Can only promote successful deployments';
  END IF;

  -- Get target environment
  SELECT * INTO target_env FROM environments WHERE id = target_environment_id AND is_active = true;
  IF target_env IS NULL THEN
    RAISE EXCEPTION 'Target environment not found or inactive';
  END IF;

  -- Get promoter name
  SELECT full_name INTO promoter_name FROM profiles WHERE id = promoter_id;

  -- Determine if target is production (requires approval)
  new_dep_id := uuid_generate_v4();

  INSERT INTO deployments (
    id, project_id, project_name, environment_id, environment_name,
    status, branch, commit_hash, commit_message,
    triggered_by, triggered_by_name, trigger_type,
    build_metrics, lighthouse,
    promoted_from_deployment_id,
    approval_status
  ) VALUES (
    new_dep_id,
    source_dep.project_id, source_dep.project_name,
    target_environment_id, target_env.name,
    CASE WHEN target_env.type = 'production' THEN 'pending' ELSE 'building' END,
    source_dep.branch, source_dep.commit_hash,
    'Promoted from ' || source_dep.environment_name || ' (DEP-' || source_dep.deploy_number || ')',
    promoter_id, promoter_name, 'merge',
    source_dep.build_metrics, source_dep.lighthouse,
    source_deployment_id,
    CASE WHEN target_env.type = 'production' THEN 'pending' ELSE 'not_required' END
  );

  -- Auto-create pipeline stages
  INSERT INTO deployment_stages (deployment_id, name, stage_order, status)
  VALUES
    (new_dep_id, 'Clone', 0, 'pending'),
    (new_dep_id, 'Install', 1, 'pending'),
    (new_dep_id, 'Build', 2, 'pending'),
    (new_dep_id, 'Test', 3, 'pending'),
    (new_dep_id, 'Deploy', 4, 'pending'),
    (new_dep_id, 'Verify', 5, 'pending');

  -- Create approval request if targeting production
  IF target_env.type = 'production' THEN
    INSERT INTO deployment_approvals (deployment_id, requested_by, requested_by_name, status)
    VALUES (new_dep_id, promoter_id, promoter_name, 'pending');

    -- Add log entry
    INSERT INTO deployment_logs (deployment_id, stage_name, level, message, source)
    VALUES (new_dep_id, NULL, 'info', 'Deployment created via promotion. Awaiting production approval.', 'system');
  ELSE
    INSERT INTO deployment_logs (deployment_id, stage_name, level, message, source)
    VALUES (new_dep_id, NULL, 'info', 'Deployment promoted from ' || source_dep.environment_name || '.', 'system');
  END IF;

  -- Return the new deployment
  SELECT row_to_json(d) INTO result
  FROM (SELECT * FROM deployments WHERE id = new_dep_id) d;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 10. SEED: Sample deployment logs for existing deployments
-- ============================================================================
DO $$
DECLARE
  dep_id UUID;
BEGIN
  -- Grab one deployment to add sample logs to (if any exist)
  SELECT id INTO dep_id FROM deployments LIMIT 1;
  IF dep_id IS NOT NULL THEN
    INSERT INTO deployment_logs (deployment_id, stage_name, level, message, source, timestamp) VALUES
      (dep_id, 'Clone', 'info', 'Cloning repository from GitHub...', 'ci-runner', now() - interval '5 minutes'),
      (dep_id, 'Clone', 'success', 'Repository cloned successfully (2.3s)', 'ci-runner', now() - interval '4 minutes 57 seconds'),
      (dep_id, 'Install', 'info', 'Installing dependencies with pnpm...', 'ci-runner', now() - interval '4 minutes 55 seconds'),
      (dep_id, 'Install', 'info', 'Resolved 847 packages', 'ci-runner', now() - interval '4 minutes 30 seconds'),
      (dep_id, 'Install', 'success', 'Dependencies installed (25.1s)', 'ci-runner', now() - interval '4 minutes 30 seconds'),
      (dep_id, 'Build', 'info', 'Building with Vite v5...', 'build-agent', now() - interval '4 minutes 28 seconds'),
      (dep_id, 'Build', 'info', 'TypeScript compilation: 0 errors', 'build-agent', now() - interval '3 minutes 45 seconds'),
      (dep_id, 'Build', 'info', 'Bundle size: 2.4MB (gzipped: 680KB)', 'build-agent', now() - interval '3 minutes 40 seconds'),
      (dep_id, 'Build', 'success', 'Build completed (48.2s)', 'build-agent', now() - interval '3 minutes 40 seconds'),
      (dep_id, 'Test', 'info', 'Running test suite with Vitest...', 'test-suite', now() - interval '3 minutes 38 seconds'),
      (dep_id, 'Test', 'info', 'Test suites: 24 passed, 0 failed', 'test-suite', now() - interval '2 minutes 50 seconds'),
      (dep_id, 'Test', 'info', 'Tests: 186 passed, 0 failed', 'test-suite', now() - interval '2 minutes 50 seconds'),
      (dep_id, 'Test', 'info', 'Coverage: 87.3%', 'test-suite', now() - interval '2 minutes 49 seconds'),
      (dep_id, 'Test', 'success', 'All tests passed (48.8s)', 'test-suite', now() - interval '2 minutes 49 seconds'),
      (dep_id, 'Deploy', 'info', 'Deploying to production cluster...', 'deploy-agent', now() - interval '2 minutes 47 seconds'),
      (dep_id, 'Deploy', 'info', 'Rolling update: 0/12 instances updated', 'deploy-agent', now() - interval '2 minutes 30 seconds'),
      (dep_id, 'Deploy', 'info', 'Rolling update: 6/12 instances updated', 'deploy-agent', now() - interval '2 minutes'),
      (dep_id, 'Deploy', 'info', 'Rolling update: 12/12 instances updated', 'deploy-agent', now() - interval '1 minute 30 seconds'),
      (dep_id, 'Deploy', 'success', 'Deployment complete (77.3s)', 'deploy-agent', now() - interval '1 minute 30 seconds'),
      (dep_id, 'Verify', 'info', 'Running health checks...', 'deploy-agent', now() - interval '1 minute 28 seconds'),
      (dep_id, 'Verify', 'info', 'Health check: 12/12 instances healthy', 'deploy-agent', now() - interval '1 minute'),
      (dep_id, 'Verify', 'info', 'Lighthouse audit: Performance 94, Accessibility 100, Best Practices 96, SEO 100', 'deploy-agent', now() - interval '45 seconds'),
      (dep_id, 'Verify', 'success', 'All verification checks passed (43.1s)', 'deploy-agent', now() - interval '43 seconds');
  END IF;
END;
$$;
