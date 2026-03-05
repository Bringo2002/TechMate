// ============================================================================
// Deployments Service
// API layer for deployment management, environments, and CI/CD pipeline data
// ============================================================================

import supabase from '../lib/supabaseClient';
import type {
    DeploymentRow,
    DeploymentInsert,
    DeploymentUpdate,
    DeploymentWithStages,
    DeploymentWithDetails,
    DeploymentStageRow,
    DeploymentStageInsert,
    EnvironmentRow,
    EnvironmentUpdate,
    DeploymentInsightRow,
    DeploymentMetricsResult,
    TodayDeploymentSummary,
    DeploymentLogRow,
    DeploymentLogInsert,
    DeploymentApprovalRow,
    DeploymentApprovalUpdate,
    DeploymentSearchResult,
    DeploymentHistoryResult,
} from '../types/database.types';
import type { ServiceResponse, ServiceError } from '../types/api.types';

// ============================================================================
// Helpers
// ============================================================================

const formatError = (error: unknown): ServiceError => {
    const err = error as Record<string, string | undefined>;
    return {
        code: err?.code || 'UNKNOWN',
        message: err?.message || 'An unknown error occurred',
        details: err?.details,
        hint: err?.hint,
    };
};

// ============================================================================
// Environments
// ============================================================================

/** Get all active environments */
export async function getEnvironments(): Promise<ServiceResponse<EnvironmentRow[]>> {
    try {
        const { data, error } = await supabase
            .from('environments')
            .select('*')
            .eq('is_active', true)
            .order('type', { ascending: true });

        if (error) throw error;
        return { data: data as EnvironmentRow[], error: null };
    } catch (error) {
        console.error('Error in getEnvironments:', error);
        return { data: null, error: formatError(error) };
    }
}

/** Update environment status/metrics */
export async function updateEnvironment(
    id: string,
    updates: EnvironmentUpdate
): Promise<ServiceResponse<EnvironmentRow>> {
    try {
        const { data, error } = await supabase
            .from('environments')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { data: data as EnvironmentRow, error: null };
    } catch (error) {
        console.error('Error in updateEnvironment:', error);
        return { data: null, error: formatError(error) };
    }
}

// ============================================================================
// Deployments
// ============================================================================

export interface DeploymentFilters {
    status?: string;
    environment_id?: string;
    project_id?: string;
    triggered_by?: string;
    limit?: number;
    offset?: number;
}

/** Get deployments with optional filters and joined stages */
export async function getDeployments(
    filters?: DeploymentFilters
): Promise<ServiceResponse<DeploymentWithStages[]>> {
    try {
        let query = supabase
            .from('deployments')
            .select(`
                *,
                stages:deployment_stages(*)
            `)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (filters?.status && filters.status !== 'all') {
            query = query.eq('status', filters.status);
        }
        if (filters?.environment_id) {
            query = query.eq('environment_id', filters.environment_id);
        }
        if (filters?.project_id) {
            query = query.eq('project_id', filters.project_id);
        }
        if (filters?.triggered_by) {
            query = query.eq('triggered_by', filters.triggered_by);
        }

        const limit = filters?.limit || 20;
        const offset = filters?.offset || 0;
        query = query.range(offset, offset + limit - 1);

        const { data, error } = await query;

        if (error) throw error;

        // Sort stages by stage_order within each deployment
        const deployments = (data as DeploymentWithStages[]).map((d) => ({
            ...d,
            stages: (d.stages || []).sort(
                (a: DeploymentStageRow, b: DeploymentStageRow) => a.stage_order - b.stage_order
            ),
        }));

        return { data: deployments, error: null };
    } catch (error) {
        console.error('Error in getDeployments:', error);
        return { data: null, error: formatError(error) };
    }
}

/** Get a single deployment by ID with stages */
export async function getDeploymentById(
    id: string
): Promise<ServiceResponse<DeploymentWithStages>> {
    try {
        const { data, error } = await supabase
            .from('deployments')
            .select(`
                *,
                stages:deployment_stages(*)
            `)
            .eq('id', id)
            .is('deleted_at', null)
            .single();

        if (error) throw error;

        const deployment = data as DeploymentWithStages;
        deployment.stages = (deployment.stages || []).sort(
            (a: DeploymentStageRow, b: DeploymentStageRow) => a.stage_order - b.stage_order
        );

        return { data: deployment, error: null };
    } catch (error) {
        console.error('Error in getDeploymentById:', error);
        return { data: null, error: formatError(error) };
    }
}

/** Create a new deployment with stages */
export async function createDeployment(
    deployment: DeploymentInsert,
    stages?: Omit<DeploymentStageInsert, 'deployment_id'>[]
): Promise<ServiceResponse<DeploymentWithStages>> {
    try {
        // Insert deployment
        const { data: deployData, error: deployError } = await supabase
            .from('deployments')
            .insert(deployment)
            .select()
            .single();

        if (deployError) throw deployError;

        const newDeployment = deployData as DeploymentRow;

        // Insert default pipeline stages if not provided
        const defaultStages: Omit<DeploymentStageInsert, 'deployment_id'>[] = stages || [
            { name: 'Clone', stage_order: 0, status: 'pending', duration: null, logs: null, started_at: null, completed_at: null, metadata: {} },
            { name: 'Install', stage_order: 1, status: 'pending', duration: null, logs: null, started_at: null, completed_at: null, metadata: {} },
            { name: 'Build', stage_order: 2, status: 'pending', duration: null, logs: null, started_at: null, completed_at: null, metadata: {} },
            { name: 'Test', stage_order: 3, status: 'pending', duration: null, logs: null, started_at: null, completed_at: null, metadata: {} },
            { name: 'Deploy', stage_order: 4, status: 'pending', duration: null, logs: null, started_at: null, completed_at: null, metadata: {} },
            { name: 'Verify', stage_order: 5, status: 'pending', duration: null, logs: null, started_at: null, completed_at: null, metadata: {} },
        ];

        const stageInserts = defaultStages.map((s) => ({
            ...s,
            deployment_id: newDeployment.id,
        }));

        const { data: stageData, error: stageError } = await supabase
            .from('deployment_stages')
            .insert(stageInserts)
            .select();

        if (stageError) throw stageError;

        return {
            data: {
                ...newDeployment,
                stages: (stageData as DeploymentStageRow[]).sort(
                    (a, b) => a.stage_order - b.stage_order
                ),
            },
            error: null,
        };
    } catch (error) {
        console.error('Error in createDeployment:', error);
        return { data: null, error: formatError(error) };
    }
}

/** Update a deployment */
export async function updateDeployment(
    id: string,
    updates: DeploymentUpdate
): Promise<ServiceResponse<DeploymentRow>> {
    try {
        const { data, error } = await supabase
            .from('deployments')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { data: data as DeploymentRow, error: null };
    } catch (error) {
        console.error('Error in updateDeployment:', error);
        return { data: null, error: formatError(error) };
    }
}

/** Rollback a deployment (sets status to rolled-back, creates a new rollback deployment) */
export async function rollbackDeployment(
    id: string
): Promise<ServiceResponse<DeploymentRow>> {
    try {
        const { data, error } = await supabase
            .from('deployments')
            .update({ status: 'rolled-back' as const, completed_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return { data: data as DeploymentRow, error: null };
    } catch (error) {
        console.error('Error in rollbackDeployment:', error);
        return { data: null, error: formatError(error) };
    }
}

// ============================================================================
// Deployment Stages
// ============================================================================

/** Update a deployment stage */
export async function updateDeploymentStage(
    stageId: string,
    updates: Partial<DeploymentStageRow>
): Promise<ServiceResponse<DeploymentStageRow>> {
    try {
        const { data, error } = await supabase
            .from('deployment_stages')
            .update(updates)
            .eq('id', stageId)
            .select()
            .single();

        if (error) throw error;
        return { data: data as DeploymentStageRow, error: null };
    } catch (error) {
        console.error('Error in updateDeploymentStage:', error);
        return { data: null, error: formatError(error) };
    }
}

// ============================================================================
// Insights
// ============================================================================

/** Get deployment insights */
export async function getDeploymentInsights(
    deploymentId?: string
): Promise<ServiceResponse<DeploymentInsightRow[]>> {
    try {
        let query = supabase
            .from('deployment_insights')
            .select('*')
            .eq('is_dismissed', false)
            .order('created_at', { ascending: false })
            .limit(10);

        if (deploymentId) {
            query = query.eq('deployment_id', deploymentId);
        }

        const { data, error } = await query;

        if (error) throw error;
        return { data: data as DeploymentInsightRow[], error: null };
    } catch (error) {
        console.error('Error in getDeploymentInsights:', error);
        return { data: null, error: formatError(error) };
    }
}

/** Dismiss an insight */
export async function dismissInsight(
    insightId: string
): Promise<ServiceResponse<DeploymentInsightRow>> {
    try {
        const { data, error } = await supabase
            .from('deployment_insights')
            .update({ is_dismissed: true })
            .eq('id', insightId)
            .select()
            .single();

        if (error) throw error;
        return { data: data as DeploymentInsightRow, error: null };
    } catch (error) {
        console.error('Error in dismissInsight:', error);
        return { data: null, error: formatError(error) };
    }
}

// ============================================================================
// Metrics
// ============================================================================

/** Get deployment metrics (aggregated stats) */
export async function getDeploymentMetrics(
    daysBack = 30
): Promise<ServiceResponse<DeploymentMetricsResult>> {
    try {
        const { data, error } = await supabase.rpc('get_deployment_metrics', {
            days_back: daysBack,
        });

        if (error) throw error;
        return { data: data as DeploymentMetricsResult, error: null };
    } catch (error) {
        console.error('Error in getDeploymentMetrics:', error);
        return { data: null, error: formatError(error) };
    }
}

/** Get today's deployment summary */
export async function getTodayDeploymentSummary(): Promise<ServiceResponse<TodayDeploymentSummary>> {
    try {
        const { data, error } = await supabase.rpc('get_today_deployment_summary');

        if (error) throw error;
        return { data: data as TodayDeploymentSummary, error: null };
    } catch (error) {
        console.error('Error in getTodayDeploymentSummary:', error);
        return { data: null, error: formatError(error) };
    }
}

// ============================================================================
// Real-time subscriptions
// ============================================================================

/** Subscribe to deployment changes */
export function subscribeToDeployments(
    callback: (payload: { eventType: string; new: DeploymentRow; old: DeploymentRow }) => void
) {
    return supabase
        .channel('deployments_changes')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'deployments' },
            (payload) => {
                callback({
                    eventType: payload.eventType,
                    new: payload.new as DeploymentRow,
                    old: payload.old as DeploymentRow,
                });
            }
        )
        .subscribe();
}

/** Subscribe to environment changes */
export function subscribeToEnvironments(
    callback: (payload: { eventType: string; new: EnvironmentRow; old: EnvironmentRow }) => void
) {
    return supabase
        .channel('environments_changes')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'environments' },
            (payload) => {
                callback({
                    eventType: payload.eventType,
                    new: payload.new as EnvironmentRow,
                    old: payload.old as EnvironmentRow,
                });
            }
        )
        .subscribe();
}

// ============================================================================
// Deployment Logs (V2)
// ============================================================================

/** Get deployment logs, optionally filtered by stage */
export async function getDeploymentLogs(
    deploymentId: string,
    stageName?: string
): Promise<ServiceResponse<DeploymentLogRow[]>> {
    try {
        let query = supabase
            .from('deployment_logs')
            .select('*')
            .eq('deployment_id', deploymentId)
            .order('timestamp', { ascending: true });

        if (stageName) {
            query = query.eq('stage_name', stageName);
        }

        const { data, error } = await query;

        if (error) throw error;
        return { data: data as DeploymentLogRow[], error: null };
    } catch (error) {
        console.error('Error in getDeploymentLogs:', error);
        return { data: null, error: formatError(error) };
    }
}

/** Add a log entry to a deployment */
export async function addDeploymentLog(
    log: DeploymentLogInsert
): Promise<ServiceResponse<DeploymentLogRow>> {
    try {
        const { data, error } = await supabase
            .from('deployment_logs')
            .insert(log)
            .select()
            .single();

        if (error) throw error;
        return { data: data as DeploymentLogRow, error: null };
    } catch (error) {
        console.error('Error in addDeploymentLog:', error);
        return { data: null, error: formatError(error) };
    }
}

// ============================================================================
// Deployment Approvals (V2)
// ============================================================================

/** Get approvals for a deployment */
export async function getDeploymentApprovals(
    deploymentId: string
): Promise<ServiceResponse<DeploymentApprovalRow[]>> {
    try {
        const { data, error } = await supabase
            .from('deployment_approvals')
            .select('*')
            .eq('deployment_id', deploymentId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { data: data as DeploymentApprovalRow[], error: null };
    } catch (error) {
        console.error('Error in getDeploymentApprovals:', error);
        return { data: null, error: formatError(error) };
    }
}

/** Request approval for a deployment */
export async function requestApproval(
    deploymentId: string,
    requestedBy: string,
    requestedByName: string
): Promise<ServiceResponse<DeploymentApprovalRow>> {
    try {
        // Create approval request
        const { data, error } = await supabase
            .from('deployment_approvals')
            .insert({
                deployment_id: deploymentId,
                requested_by: requestedBy,
                requested_by_name: requestedByName,
                status: 'pending',
            })
            .select()
            .single();

        if (error) throw error;

        // Update deployment approval status
        await supabase
            .from('deployments')
            .update({ approval_status: 'pending' })
            .eq('id', deploymentId);

        return { data: data as DeploymentApprovalRow, error: null };
    } catch (error) {
        console.error('Error in requestApproval:', error);
        return { data: null, error: formatError(error) };
    }
}

/** Resolve (approve/reject) an approval request */
export async function resolveApproval(
    approvalId: string,
    status: 'approved' | 'rejected',
    reviewerId: string,
    reviewerName: string,
    notes?: string
): Promise<ServiceResponse<DeploymentApprovalRow>> {
    try {
        const updates: DeploymentApprovalUpdate = {
            status,
            reviewer: reviewerId,
            reviewer_name: reviewerName,
            notes: notes || null,
            resolved_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('deployment_approvals')
            .update(updates)
            .eq('id', approvalId)
            .select()
            .single();

        if (error) throw error;

        const approval = data as DeploymentApprovalRow;

        // Update parent deployment
        await supabase
            .from('deployments')
            .update({
                approval_status: status,
                approved_by: status === 'approved' ? reviewerId : null,
                approved_at: status === 'approved' ? new Date().toISOString() : null,
                // If approved, move to building; if rejected, cancel
                status: status === 'approved' ? 'building' : 'cancelled',
            })
            .eq('id', approval.deployment_id);

        return { data: approval, error: null };
    } catch (error) {
        console.error('Error in resolveApproval:', error);
        return { data: null, error: formatError(error) };
    }
}

// ============================================================================
// Search & History (V2)
// ============================================================================

export interface SearchDeploymentParams {
    query?: string;
    status?: string;
    projectId?: string;
    environmentId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    pageSize?: number;
}

/** Full-text search deployments with filters and pagination */
export async function searchDeployments(
    params: SearchDeploymentParams
): Promise<ServiceResponse<DeploymentSearchResult>> {
    try {
        const { data, error } = await supabase.rpc('search_deployments', {
            search_query: params.query || null,
            status_filter: params.status || null,
            project_filter: params.projectId || null,
            env_filter: params.environmentId || null,
            date_from: params.dateFrom || null,
            date_to: params.dateTo || null,
            page_num: params.page || 1,
            page_size: params.pageSize || 20,
        });

        if (error) throw error;
        return { data: data as DeploymentSearchResult, error: null };
    } catch (error) {
        console.error('Error in searchDeployments:', error);
        return { data: null, error: formatError(error) };
    }
}

/** Get deployment history for a project (paginated) */
export async function getDeploymentHistory(
    projectId?: string,
    page = 1,
    perPage = 20
): Promise<ServiceResponse<DeploymentHistoryResult>> {
    try {
        const { data, error } = await supabase.rpc('get_deployment_history', {
            p_project_id: projectId || null,
            p_page: page,
            p_per_page: perPage,
        });

        if (error) throw error;
        return { data: data as DeploymentHistoryResult, error: null };
    } catch (error) {
        console.error('Error in getDeploymentHistory:', error);
        return { data: null, error: formatError(error) };
    }
}

// ============================================================================
// Environment Promotion (V2)
// ============================================================================

/** Promote a successful deployment to a target environment */
export async function promoteDeployment(
    sourceDeploymentId: string,
    targetEnvironmentId: string,
    promoterId: string
): Promise<ServiceResponse<DeploymentRow>> {
    try {
        const { data, error } = await supabase.rpc('promote_deployment', {
            source_deployment_id: sourceDeploymentId,
            target_environment_id: targetEnvironmentId,
            promoter_id: promoterId,
        });

        if (error) throw error;
        return { data: data as DeploymentRow, error: null };
    } catch (error) {
        console.error('Error in promoteDeployment:', error);
        return { data: null, error: formatError(error) };
    }
}

/** Get distinct project names from deployments (for filter dropdown) */
export async function getDeploymentProjects(): Promise<ServiceResponse<Array<{ project_id: string; project_name: string }>>> {
    try {
        const { data, error } = await supabase
            .from('deployments')
            .select('project_id, project_name')
            .is('deleted_at', null)
            .not('project_id', 'is', null)
            .order('project_name', { ascending: true });

        if (error) throw error;

        // Deduplicate by project_id
        const seen = new Set<string>();
        const unique = (data || []).filter((d) => {
            if (!d.project_id || seen.has(d.project_id)) return false;
            seen.add(d.project_id);
            return true;
        });

        return { data: unique as Array<{ project_id: string; project_name: string }>, error: null };
    } catch (error) {
        console.error('Error in getDeploymentProjects:', error);
        return { data: null, error: formatError(error) };
    }
}

/** Get a single deployment with full details (stages, approvals, logs) */
export async function getDeploymentWithDetails(
    id: string
): Promise<ServiceResponse<DeploymentWithDetails>> {
    try {
        const [depRes, logsRes, approvalsRes] = await Promise.all([
            supabase
                .from('deployments')
                .select('*, stages:deployment_stages(*)')
                .eq('id', id)
                .is('deleted_at', null)
                .single(),
            supabase
                .from('deployment_logs')
                .select('*')
                .eq('deployment_id', id)
                .order('timestamp', { ascending: true }),
            supabase
                .from('deployment_approvals')
                .select('*')
                .eq('deployment_id', id)
                .order('created_at', { ascending: false }),
        ]);

        if (depRes.error) throw depRes.error;

        const deployment = depRes.data as DeploymentWithDetails;
        deployment.stages = (deployment.stages || []).sort(
            (a: DeploymentStageRow, b: DeploymentStageRow) => a.stage_order - b.stage_order
        );
        deployment.logs = (logsRes.data as DeploymentLogRow[]) || [];
        deployment.approvals = (approvalsRes.data as DeploymentApprovalRow[]) || [];

        return { data: deployment, error: null };
    } catch (error) {
        console.error('Error in getDeploymentWithDetails:', error);
        return { data: null, error: formatError(error) };
    }
}
