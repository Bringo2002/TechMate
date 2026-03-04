-- ============================================================================
-- TechMate Teams & Developer Allocation Schema
-- Run this migration AFTER the existing production schema is in place.
-- ============================================================================

-- 1. team_members – every developer / designer / lead on the internal roster
CREATE TABLE IF NOT EXISTS public.team_members (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    full_name       text NOT NULL,
    email           text NOT NULL,
    avatar_url      text,
    role            text NOT NULL DEFAULT 'developer',         -- developer | designer | tech_lead | devops | qa | pm
    department      text DEFAULT 'engineering',                -- engineering | design | qa | devops | management
    seniority       text DEFAULT 'mid',                        -- junior | mid | senior | lead | principal
    skills          text[] DEFAULT '{}',
    hourly_rate     numeric(10,2) DEFAULT 0,
    availability    integer DEFAULT 40,                        -- weekly hours available
    status          text DEFAULT 'active'                      -- active | on_leave | inactive
        CHECK (status IN ('active','on_leave','inactive')),
    joined_at       timestamptz DEFAULT now(),
    created_at      timestamptz DEFAULT now(),
    updated_at      timestamptz DEFAULT now(),
    deleted_at      timestamptz
);

-- 2. developer_allocations – links team_members to projects with time tracking
CREATE TABLE IF NOT EXISTS public.developer_allocations (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    team_member_id  uuid NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
    project_id      uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    role_on_project text DEFAULT 'developer',                  -- developer | lead | reviewer | designer | qa
    allocation_pct  integer DEFAULT 100                        -- percentage of capacity allocated (0-100)
        CHECK (allocation_pct >= 0 AND allocation_pct <= 100),
    hours_estimated numeric(8,1) DEFAULT 0,
    hours_logged    numeric(8,1) DEFAULT 0,
    start_date      date,
    end_date        date,
    status          text DEFAULT 'active'                      -- active | completed | paused | removed
        CHECK (status IN ('active','completed','paused','removed')),
    notes           text,
    created_at      timestamptz DEFAULT now(),
    updated_at      timestamptz DEFAULT now()
);

-- 3. Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_team_members_status      ON public.team_members (status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_team_members_role         ON public.team_members (role) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_team_members_department   ON public.team_members (department) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_dev_alloc_member          ON public.developer_allocations (team_member_id);
CREATE INDEX IF NOT EXISTS idx_dev_alloc_project         ON public.developer_allocations (project_id);
CREATE INDEX IF NOT EXISTS idx_dev_alloc_status          ON public.developer_allocations (status);

-- 4. updated_at trigger (reuse existing function if you have one)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_team_members_updated ON public.team_members;
CREATE TRIGGER trg_team_members_updated
    BEFORE UPDATE ON public.team_members
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_dev_alloc_updated ON public.developer_allocations;
CREATE TRIGGER trg_dev_alloc_updated
    BEFORE UPDATE ON public.developer_allocations
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. RLS policies (admin-only access)
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developer_allocations ENABLE ROW LEVEL SECURITY;

-- Admins can read/write everything
CREATE POLICY admin_team_members_all ON public.team_members
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );

CREATE POLICY admin_dev_alloc_all ON public.developer_allocations
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- Team members can read their own row
CREATE POLICY team_member_self_read ON public.team_members
    FOR SELECT USING (profile_id = auth.uid());

-- Team members can see their own allocations
CREATE POLICY dev_alloc_self_read ON public.developer_allocations
    FOR SELECT USING (
        team_member_id IN (SELECT id FROM public.team_members WHERE profile_id = auth.uid())
    );

-- 6. Helper view: team workload summary
CREATE OR REPLACE VIEW public.team_workload_summary AS
SELECT
    tm.id                             AS team_member_id,
    tm.full_name,
    tm.role,
    tm.department,
    tm.seniority,
    tm.availability,
    tm.status                         AS member_status,
    COUNT(da.id) FILTER (WHERE da.status = 'active')        AS active_projects,
    COALESCE(SUM(da.allocation_pct) FILTER (WHERE da.status = 'active'), 0) AS total_allocation_pct,
    COALESCE(SUM(da.hours_estimated) FILTER (WHERE da.status = 'active'), 0) AS total_hours_estimated,
    COALESCE(SUM(da.hours_logged)    FILTER (WHERE da.status = 'active'), 0) AS total_hours_logged
FROM
    public.team_members tm
LEFT JOIN
    public.developer_allocations da ON da.team_member_id = tm.id
WHERE
    tm.deleted_at IS NULL
GROUP BY
    tm.id, tm.full_name, tm.role, tm.department, tm.seniority, tm.availability, tm.status;
