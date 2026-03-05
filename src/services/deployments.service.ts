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
    DeploymentStageRow,
    DeploymentStageInsert,
    EnvironmentRow,
    EnvironmentUpdate,
    DeploymentInsightRow,
    DeploymentMetricsResult,
    TodayDeploymentSummary,
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
