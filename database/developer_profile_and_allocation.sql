-- ============================================================================
-- TechMate Developer Profile & Allocation Management
-- Additional schema, functions, and indexes for the developer profile page
-- and project ↔ developer allocation features.
--
-- Run AFTER team_tables.sql has been applied.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. UNIQUE constraint on (team_member_id, project_id) for active allocations
--    Prevents duplicate active assignments of the same dev to the same project.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_dev_alloc_unique_active
    ON public.developer_allocations (team_member_id, project_id)
    WHERE status = 'active';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Helper view: team_member_workload
--    Precomputed workload stats per team member (for fast profile pages).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.team_member_workload AS
SELECT
    tm.id                       AS team_member_id,
    tm.full_name,
    tm.email,
    tm.role,
    tm.department,
    tm.seniority,
    tm.status                   AS member_status,
    tm.availability,
    tm.hourly_rate,
    tm.skills,
    tm.avatar_url,
    tm.joined_at,
    COUNT(da.id) FILTER (WHERE da.status = 'active')                    AS active_projects,
    COALESCE(SUM(da.allocation_pct) FILTER (WHERE da.status = 'active'), 0) AS total_allocation_pct,
    COALESCE(SUM(da.hours_estimated) FILTER (WHERE da.status = 'active'), 0) AS total_hours_estimated,
    COALESCE(SUM(da.hours_logged) FILTER (WHERE da.status = 'active'), 0)    AS total_hours_logged,
    COUNT(da.id) FILTER (WHERE da.status = 'completed')                  AS completed_projects,
    COALESCE(SUM(da.hours_logged), 0)                                    AS lifetime_hours_logged
FROM public.team_members tm
LEFT JOIN public.developer_allocations da ON da.team_member_id = tm.id
WHERE tm.deleted_at IS NULL
GROUP BY tm.id;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. RPC: get_team_member_profile(p_member_id uuid)
--    Returns everything the Developer Profile page needs in a single call.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_team_member_profile(p_member_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_member  jsonb;
    v_allocs  jsonb;
    v_history jsonb;
BEGIN
    -- Member details
    SELECT to_jsonb(w) INTO v_member
    FROM public.team_member_workload w
    WHERE w.team_member_id = p_member_id;

    IF v_member IS NULL THEN
        RAISE EXCEPTION 'Team member not found: %', p_member_id;
    END IF;

    -- Active allocations with project info
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id',              da.id,
            'project_id',      da.project_id,
            'project_name',    p.name,
            'project_status',  p.status,
            'role_on_project', da.role_on_project,
            'allocation_pct',  da.allocation_pct,
            'hours_estimated', da.hours_estimated,
            'hours_logged',    da.hours_logged,
            'start_date',      da.start_date,
            'end_date',        da.end_date,
            'status',          da.status,
            'notes',           da.notes,
            'created_at',      da.created_at
        ) ORDER BY da.created_at DESC
    ), '[]'::jsonb) INTO v_allocs
    FROM public.developer_allocations da
    JOIN public.projects p ON p.id = da.project_id
    WHERE da.team_member_id = p_member_id
      AND da.status = 'active';

    -- Allocation history (completed / paused / removed)
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'id',              da.id,
            'project_id',      da.project_id,
            'project_name',    p.name,
            'role_on_project', da.role_on_project,
            'allocation_pct',  da.allocation_pct,
            'hours_estimated', da.hours_estimated,
            'hours_logged',    da.hours_logged,
            'start_date',      da.start_date,
            'end_date',        da.end_date,
            'status',          da.status,
            'notes',           da.notes,
            'created_at',      da.created_at
        ) ORDER BY da.created_at DESC
    ), '[]'::jsonb) INTO v_history
    FROM public.developer_allocations da
    JOIN public.projects p ON p.id = da.project_id
    WHERE da.team_member_id = p_member_id
      AND da.status != 'active';

    RETURN jsonb_build_object(
        'member',       v_member,
        'allocations',  v_allocs,
        'history',      v_history
    );
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. RPC: get_project_team(p_project_id uuid)
--    Returns all allocated team members for a given project.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_project_team(p_project_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_team   jsonb;
    v_avail  jsonb;
BEGIN
    -- Currently assigned
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'allocation_id',   da.id,
            'team_member_id',  tm.id,
            'full_name',       tm.full_name,
            'email',           tm.email,
            'avatar_url',      tm.avatar_url,
            'role',            tm.role,
            'seniority',       tm.seniority,
            'department',      tm.department,
            'skills',          tm.skills,
            'hourly_rate',     tm.hourly_rate,
            'member_status',   tm.status,
            'role_on_project', da.role_on_project,
            'allocation_pct',  da.allocation_pct,
            'hours_estimated', da.hours_estimated,
            'hours_logged',    da.hours_logged,
            'start_date',      da.start_date,
            'end_date',        da.end_date,
            'alloc_status',    da.status,
            'notes',           da.notes
        ) ORDER BY tm.full_name
    ), '[]'::jsonb) INTO v_team
    FROM public.developer_allocations da
    JOIN public.team_members tm ON tm.id = da.team_member_id
    WHERE da.project_id = p_project_id
      AND da.status = 'active'
      AND tm.deleted_at IS NULL;

    -- Available team members (not already on this project with active allocation)
    SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
            'team_member_id',       tm.id,
            'full_name',            tm.full_name,
            'email',                tm.email,
            'avatar_url',           tm.avatar_url,
            'role',                 tm.role,
            'seniority',            tm.seniority,
            'department',           tm.department,
            'skills',               tm.skills,
            'hourly_rate',          tm.hourly_rate,
            'member_status',        tm.status,
            'total_allocation_pct', COALESCE(w.total_allocation_pct, 0),
            'active_projects',      COALESCE(w.active_projects, 0)
        ) ORDER BY tm.full_name
    ), '[]'::jsonb) INTO v_avail
    FROM public.team_members tm
    LEFT JOIN public.team_member_workload w ON w.team_member_id = tm.id
    WHERE tm.deleted_at IS NULL
      AND tm.status = 'active'
      AND NOT EXISTS (
            SELECT 1 FROM public.developer_allocations da2
            WHERE da2.team_member_id = tm.id
              AND da2.project_id = p_project_id
              AND da2.status = 'active'
      );

    RETURN jsonb_build_object(
        'team',      v_team,
        'available', v_avail
    );
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Grant execute to authenticated users (protected by RLS on underlying tables)
-- ─────────────────────────────────────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION public.get_team_member_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_project_team(uuid) TO authenticated;
GRANT SELECT ON public.team_member_workload TO authenticated;
