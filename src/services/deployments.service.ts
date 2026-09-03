// ============================================================================
// Deployments Service
// API layer for deployment management, environments, and CI/CD pipeline data
// ============================================================================

import api from '../lib/apiClient';
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
        const data = await api.get<EnvironmentRow[]>('/environments');
        // Backend doesn't support an is_active filter param — filtered
        // client-side here, same approach used elsewhere in this codebase
        // (e.g. teams.service.ts's getAvailableProjects).
        const active = (Array.isArray(data) ? data : [])
            .filter(e => e.is_active)
            .sort((a, b) => a.type.localeCompare(b.type));
        return { data: active, error: null };
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
        const data = await api.put<EnvironmentRow>(`/environments/${id}`, updates);
        return { data, error: null };
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
        const params = new URLSearchParams();
        if (filters?.status && filters.status !== 'all') params.set('status', filters.status);
        if (filters?.environment_id) params.set('environmentId', filters.environment_id);
        if (filters?.project_id) params.set('projectId', filters.project_id);
        if (filters?.triggered_by) params.set('triggeredBy', filters.triggered_by);
        params.set('limit', String(filters?.limit || 20));
        params.set('offset', String(filters?.offset || 0));

        const data = await api.get<DeploymentWithStages[]>(`/deployments?${params.toString()}`);

        // Backend already sorts stages by stage_order server-side, but
        // sorting again here is harmless and keeps this resilient either way.
        const deployments = (Array.isArray(data) ? data : []).map((d) => ({
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
        const deployment = await api.get<DeploymentWithStages>(`/deployments/${id}`);
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
        // The backend creates default (or custom, if provided) pipeline
        // stages server-side in the same request now — no more separate
        // insert-then-insert-stages round trip.
        const newDeployment = await api.post<DeploymentWithStages>('/deployments', {
            ...deployment,
            stages,
        });

        newDeployment.stages = (newDeployment.stages || []).sort(
            (a: DeploymentStageRow, b: DeploymentStageRow) => a.stage_order - b.stage_order
        );

        return { data: newDeployment, error: null };
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
        const data = await api.put<DeploymentRow>(`/deployments/${id}`, updates);
        return { data, error: null };
    } catch (error) {
        console.error('Error in updateDeployment:', error);
        return { data: null, error: formatError(error) };
    }
}

/** Rollback a deployment (sets status to rolled-back) */
export async function rollbackDeployment(
    id: string
): Promise<ServiceResponse<DeploymentRow>> {
    try {
        const data = await api.put<DeploymentRow>(`/deployments/${id}/rollback`, {});
        return { data, error: null };
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
        const data = await api.put<DeploymentStageRow>(`/deployments/stages/${stageId}`, updates);
        return { data, error: null };
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
        const query = deploymentId ? `?deploymentId=${deploymentId}` : '';
        const data = await api.get<DeploymentInsightRow[]>(`/deployments/insights${query}`);
        return { data: Array.isArray(data) ? data : [], error: null };
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
        const data = await api.put<DeploymentInsightRow>(`/deployments/insights/${insightId}/dismiss`, {});
        return { data, error: null };
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
        const data = await api.get<DeploymentMetricsResult>(`/deployments/metrics?daysBack=${daysBack}`);
        return { data, error: null };
    } catch (error) {
        console.error('Error in getDeploymentMetrics:', error);
        return { data: null, error: formatError(error) };
    }
}

/** Get today's deployment summary */
export async function getTodayDeploymentSummary(): Promise<ServiceResponse<TodayDeploymentSummary>> {
    try {
        const data = await api.get<TodayDeploymentSummary>('/deployments/today-summary');
        return { data, error: null };
    } catch (error) {
        console.error('Error in getTodayDeploymentSummary:', error);
        return { data: null, error: formatError(error) };
    }
}

// ============================================================================
// Real-time subscriptions
// ============================================================================

/**
 * NOTE: Supabase realtime is gone, and this backend has no websocket/SSE
 * layer yet. No-op stub — same treatment as every other subscribeTo*
 * function in this codebase (messages, notifications, inquiries).
 */
export function subscribeToDeployments(
    _callback: (payload: { eventType: string; new: DeploymentRow; old: DeploymentRow }) => void
) {
    console.warn(
        '[deployments.service] subscribeToDeployments: realtime is not implemented in the new backend yet — this is a no-op.'
    );
    return { unsubscribe: () => {} };
}

/** Same no-op treatment as subscribeToDeployments — see note above. */
export function subscribeToEnvironments(
    _callback: (payload: { eventType: string; new: EnvironmentRow; old: EnvironmentRow }) => void
) {
    console.warn(
        '[deployments.service] subscribeToEnvironments: realtime is not implemented in the new backend yet — this is a no-op.'
    );
    return { unsubscribe: () => {} };
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
        const query = stageName ? `?stageName=${stageName}` : '';
        const data = await api.get<DeploymentLogRow[]>(`/deployments/${deploymentId}/logs${query}`);
        return { data: Array.isArray(data) ? data : [], error: null };
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
        const data = await api.post<DeploymentLogRow>(`/deployments/${log.deployment_id}/logs`, log);
        return { data, error: null };
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
        const data = await api.get<DeploymentApprovalRow[]>(`/deployments/${deploymentId}/approvals`);
        return { data: Array.isArray(data) ? data : [], error: null };
    } catch (error) {
        console.error('Error in getDeploymentApprovals:', error);
        return { data: null, error: formatError(error) };
    }
}

/** Request approval for a deployment — the backend also updates the parent deployment's approval_status. */
export async function requestApproval(
    deploymentId: string,
    requestedBy: string,
    requestedByName: string
): Promise<ServiceResponse<DeploymentApprovalRow>> {
    try {
        const data = await api.post<DeploymentApprovalRow>(`/deployments/${deploymentId}/approvals`, {
            requestedBy,
            requestedByName,
        });
        return { data, error: null };
    } catch (error) {
        console.error('Error in requestApproval:', error);
        return { data: null, error: formatError(error) };
    }
}

/** Resolve (approve/reject) an approval request — the backend also updates the parent deployment. */
export async function resolveApproval(
    approvalId: string,
    status: 'approved' | 'rejected',
    reviewerId: string,
    reviewerName: string,
    notes?: string
): Promise<ServiceResponse<DeploymentApprovalRow>> {
    try {
        const data = await api.put<DeploymentApprovalRow>(`/deployments/approvals/${approvalId}/resolve`, {
            status,
            reviewerId,
            reviewerName,
            notes: notes || undefined,
        });
        return { data, error: null };
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
        const data = await api.post<DeploymentSearchResult>('/deployments/search', {
            query: params.query || undefined,
            status: params.status || undefined,
            projectId: params.projectId || undefined,
            environmentId: params.environmentId || undefined,
            dateFrom: params.dateFrom || undefined,
            dateTo: params.dateTo || undefined,
            page: params.page || 1,
            pageSize: params.pageSize || 20,
        });
        return { data, error: null };
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
        const params = new URLSearchParams();
        if (projectId) params.set('projectId', projectId);
        params.set('page', String(page));
        params.set('perPage', String(perPage));
        const data = await api.get<DeploymentHistoryResult>(`/deployments/history?${params.toString()}`);
        return { data, error: null };
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
        const data = await api.put<DeploymentRow>(`/deployments/${sourceDeploymentId}/promote`, {
            targetEnvironmentId,
            promoterId,
        });
        return { data, error: null };
    } catch (error) {
        console.error('Error in promoteDeployment:', error);
        return { data: null, error: formatError(error) };
    }
}

/** Get distinct project names from deployments (for filter dropdown) */
export async function getDeploymentProjects(): Promise<ServiceResponse<Array<{ project_id: string; project_name: string }>>> {
    try {
        // Backend already deduplicates via DISTINCT ON — no client-side
        // dedup needed anymore.
        const data = await api.get<Array<{ project_id: string; project_name: string }>>('/deployments/projects');
        return { data: Array.isArray(data) ? data : [], error: null };
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
        // Backend's /details endpoint already returns stages+logs+approvals
        // together — no more three-way Promise.all needed client-side.
        const deployment = await api.get<DeploymentWithDetails>(`/deployments/${id}/details`);
        deployment.stages = (deployment.stages || []).sort(
            (a: DeploymentStageRow, b: DeploymentStageRow) => a.stage_order - b.stage_order
        );
        deployment.logs = deployment.logs || [];
        deployment.approvals = deployment.approvals || [];

        return { data: deployment, error: null };
    } catch (error) {
        console.error('Error in getDeploymentWithDetails:', error);
        return { data: null, error: formatError(error) };
    }
}
