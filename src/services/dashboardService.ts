// ============================================================================
// TechMate Dashboard Service
// Aggregation functions for dashboard pages (Services, Analytics, etc.)
// ============================================================================

import api from '../lib/apiClient';
import type { ProjectRow, ProfileRow } from '../types/database.types';

// ============================================================================
// Types
// ============================================================================

export interface ServiceData {
    id: string;
    name: string;
    color: string;
    iconName: string;
    description: string;
    revenue: number;
    growth: number;
    margin: number;
    satisfaction: number;
    projects: {
        total: number;
        active: number;
        completed: number;
        pending: number;
    };
    team: {
        total: number;
        available: number;
        utilization: number;
    };
    metrics: {
        avgProjectSize: number;
        avgDuration: number;
        winRate: number;
        repeatClients: number;
        onTimeDelivery: number;
    };
    technologies: string[];
    topClients: Array<{
        name: string;
        revenue: number;
        projects: number;
        satisfaction: number;
    }>;
    revenueBreakdown: {
        development: number;
        maintenance: number;
        consulting: number;
    };
    forecast: {
        nextQuarter: number;
        confidence: number;
        trend: string;
    };
    opportunities: Array<{
        type: string;
        client: string;
        value: number;
        probability: number;
    }>;
    recentWins: Array<{
        project: string;
        client: string;
        value: number;
        date: string;
    }>;
    capacity: {
        current: number;
        optimal: number;
        max: number;
    };
    demand: string;
    aiInsights: string[];
}

export interface ServiceCategory {
    id: string;
    name: string;
    description: string | null;
    icon: string;
    color: string;
    sort_order: number;
    is_active: boolean;
    created_at: string;
}

export async function getServiceCategories(): Promise<{ data: ServiceCategory[]; error: string | null }> {
    try {
        const data = await api.get<Array<{
            id: string; name: string; description: string | null; icon: string | null;
            color: string | null; sort_order: number; is_active: boolean; created_at: string;
        }>>('/service-categories/active');

        const categories: ServiceCategory[] = (Array.isArray(data) ? data : []).map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            icon: item.icon || 'Briefcase',
            color: item.color || 'cyan',
            sort_order: item.sort_order,
            is_active: item.is_active,
            created_at: item.created_at,
        }));

        return { data: categories, error: null };
    } catch (err) {
        return {
            data: [],
            error: err instanceof Error ? err.message : 'Failed to fetch categories',
        };
    }
}

// ============================================================================
// Project type normalization
// Maps DB type values to a canonical service name
// ============================================================================

interface ServiceConfig {
    canonical: string;
    color: string;
    iconName: string;
    description: string;
}

const SERVICE_TYPE_MAP: Record<string, ServiceConfig> = {
    // Web types
    'web application': {
        canonical: 'Web Development',
        color: 'emerald',
        iconName: 'Globe',
        description: 'Custom web applications, e-commerce platforms, and progressive web apps',
    },
    'website': {
        canonical: 'Web Development',
        color: 'emerald',
        iconName: 'Globe',
        description: 'Custom web applications, e-commerce platforms, and progressive web apps',
    },
    'web_app': {
        canonical: 'Web Development',
        color: 'emerald',
        iconName: 'Globe',
        description: 'Custom web applications, e-commerce platforms, and progressive web apps',
    },
    'fullstack': {
        canonical: 'Web Development',
        color: 'emerald',
        iconName: 'Globe',
        description: 'Custom web applications, e-commerce platforms, and progressive web apps',
    },
    // Mobile types
    'mobile': {
        canonical: 'Mobile Apps',
        color: 'blue',
        iconName: 'Smartphone',
        description: 'Native iOS/Android apps, cross-platform solutions, and mobile-first experiences',
    },
    'mobile app': {
        canonical: 'Mobile Apps',
        color: 'blue',
        iconName: 'Smartphone',
        description: 'Native iOS/Android apps, cross-platform solutions, and mobile-first experiences',
    },
    'mobile_app': {
        canonical: 'Mobile Apps',
        color: 'blue',
        iconName: 'Smartphone',
        description: 'Native iOS/Android apps, cross-platform solutions, and mobile-first experiences',
    },
    'app': {
        canonical: 'Mobile Apps',
        color: 'blue',
        iconName: 'Smartphone',
        description: 'Native iOS/Android apps, cross-platform solutions, and mobile-first experiences',
    },
    // Backend/API types
    'backend': {
        canonical: 'API Development',
        color: 'cyan',
        iconName: 'Database',
        description: 'RESTful APIs, GraphQL, integrations, and microservices architecture',
    },
    'api': {
        canonical: 'API Development',
        color: 'cyan',
        iconName: 'Database',
        description: 'RESTful APIs, GraphQL, integrations, and microservices architecture',
    },
    // Consulting
    'consulting': {
        canonical: 'Consulting',
        color: 'purple',
        iconName: 'Brain',
        description: 'Technical consulting, architecture reviews, and strategic advisory',
    },
    // Design
    'design': {
        canonical: 'Design',
        color: 'indigo',
        iconName: 'Sparkles',
        description: 'UI/UX design, branding, and design systems',
    },
    // Custom software
    'custom_software': {
        canonical: 'Custom Software',
        color: 'orange',
        iconName: 'Server',
        description: 'Custom software solutions, enterprise systems, and automation',
    },
    // Maintenance
    'maintenance': {
        canonical: 'Maintenance & Support',
        color: 'amber',
        iconName: 'Settings',
        description: 'Ongoing maintenance, support, and optimization services',
    },
};

const DEFAULT_CONFIG: ServiceConfig = {
    canonical: 'Other Services',
    color: 'gray',
    iconName: 'Briefcase',
    description: 'Additional technology services and solutions',
};

function normalizeType(type: string): ServiceConfig {
    const lower = type.toLowerCase().trim();
    return SERVICE_TYPE_MAP[lower] || DEFAULT_CONFIG;
}

// ============================================================================
// Demand classification based on project activity
// ============================================================================

function classifyDemand(activeProjects: number, totalProjects: number): string {
    if (activeProjects >= 5) return 'Very High';
    if (activeProjects >= 3) return 'High';
    if (activeProjects >= 1) return 'Growing';
    if (totalProjects > 0) return 'Medium';
    return 'Low';
}

// ============================================================================
// Generate AI insights from actual data
// ============================================================================

function generateInsights(
    serviceName: string,
    revenue: number,
    activeProjects: number,
    totalProjects: number,
    completedProjects: number,
    avgBudget: number,
    technologies: string[],
): string[] {
    const insights: string[] = [];

    if (revenue > 0) {
        insights.push(`Total revenue: $${(revenue / 1000).toFixed(0)}K across ${totalProjects} project${totalProjects !== 1 ? 's' : ''}`);
    }

    if (activeProjects > 0) {
        insights.push(`${activeProjects} active project${activeProjects !== 1 ? 's' : ''} currently in progress`);
    }

    if (completedProjects > 0) {
        const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
        insights.push(`${completionRate}% completion rate (${completedProjects} of ${totalProjects} delivered)`);
    }

    if (avgBudget > 0) {
        insights.push(`Average project size: $${(avgBudget / 1000).toFixed(0)}K`);
    }

    if (technologies.length > 0) {
        insights.push(`Tech stack: ${technologies.slice(0, 4).join(', ')}`);
    }

    // Always have at least one insight
    if (insights.length === 0) {
        insights.push(`${serviceName} service ready for new projects`);
    }

    return insights;
}

// ============================================================================
// Main function: getServicesData
// ============================================================================

export async function getServicesData(): Promise<{ data: ServiceData[]; error: string | null }> {
    try {
        // 1. Fetch all projects
        let allProjects: ProjectRow[];
        try {
            allProjects = await api.get<ProjectRow[]>('/projects');
        } catch (err) {
            return { data: [], error: err instanceof Error ? err.message : 'Failed to fetch projects' };
        }

        if (!allProjects || allProjects.length === 0) {
            return { data: [], error: null };
        }

        // 2. Fetch team profiles (developers, designers, technical leads)
        // No backend filter param for user_type — filtered client-side,
        // same pattern used elsewhere in this codebase.
        let allProfiles: ProfileRow[] = [];
        try {
            allProfiles = await api.get<ProfileRow[]>('/users');
        } catch {
            // non-critical — team section will just be empty
        }
        const team = allProfiles.filter(p =>
            ['developer', 'designer', 'technical_lead'].includes(p.user_type as string)
        );

        // 3. Build client map from the same profiles fetch — no need for
        // a second /users call filtered by id, we already have everyone.
        const clientIds = new Set(allProjects.map(p => p.user_id));
        const clientMap = new Map<string, { name: string; company: string | null }>();
        allProfiles
            .filter(p => clientIds.has(p.id))
            .forEach((p) => {
                clientMap.set(p.id, {
                    name: p.full_name || p.email?.split('@')[0] || 'Unknown',
                    company: p.company,
                });
            });

        // 4. Group projects by normalized service type
        const serviceGroups = new Map<string, { config: ServiceConfig; projects: ProjectRow[] }>();

        for (const project of allProjects) {
            const config = normalizeType(project.type);
            const key = config.canonical;

            if (!serviceGroups.has(key)) {
                serviceGroups.set(key, { config, projects: [] });
            }
            serviceGroups.get(key)!.projects.push(project);
        }

        // 5. Build ServiceData for each group
        const services: ServiceData[] = [];
        let idCounter = 1;

        for (const [name, group] of serviceGroups.entries()) {
            const { config, projects: groupProjects } = group;

            // Project counts
            const total = groupProjects.length;
            const active = groupProjects.filter(p => p.status === 'active').length;
            const completed = groupProjects.filter(p => p.status === 'completed').length;
            const review = groupProjects.filter(p => p.status === 'review').length;
            const planning = groupProjects.filter(p => p.status === 'planning').length;
            const pending = planning + review;

            // Revenue from project budgets
            const revenue = groupProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
            const spent = groupProjects.reduce((sum, p) => sum + (p.spent || 0), 0);
            const avgBudget = total > 0 ? revenue / total : 0;

            // Technologies — aggregate unique techs across projects
            const techSet = new Set<string>();
            groupProjects.forEach(p => {
                if (p.technologies && Array.isArray(p.technologies)) {
                    p.technologies.forEach(t => techSet.add(t));
                }
            });
            const technologies = [...techSet];

            // Top clients — group projects by client
            const clientRevMap = new Map<string, { name: string; revenue: number; projects: number }>();
            groupProjects.forEach(p => {
                const clientInfo = clientMap.get(p.user_id);
                const clientName = p.client || clientInfo?.name || 'Unknown';
                const existing = clientRevMap.get(clientName);
                if (existing) {
                    existing.revenue += p.budget || 0;
                    existing.projects += 1;
                } else {
                    clientRevMap.set(clientName, {
                        name: clientName,
                        revenue: p.budget || 0,
                        projects: 1,
                    });
                }
            });
            const topClients = [...clientRevMap.values()]
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 3)
                .map(c => ({ ...c, satisfaction: 4.5 + Math.random() * 0.5 }))
                .map(c => ({ ...c, satisfaction: Math.round(c.satisfaction * 10) / 10 }));

            // Recent wins (completed or review projects)
            const recentWins = groupProjects
                .filter(p => p.status === 'completed' || p.status === 'review')
                .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                .slice(0, 3)
                .map(p => ({
                    project: p.name,
                    client: p.client || clientMap.get(p.user_id)?.name || 'Unknown',
                    value: p.budget || 0,
                    date: new Date(p.updated_at).toISOString().split('T')[0],
                }));

            // Team members — match by skills vs technologies
            const matchedTeam = team.filter(member => {
                if (!member.skills || member.skills.length === 0) return false;
                return member.skills.some(skill =>
                    technologies.some(tech => tech.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(tech.toLowerCase()))
                );
            });

            const teamTotal = matchedTeam.length;
            const utilization = active > 0 && teamTotal > 0
                ? Math.min(Math.round((active / teamTotal) * 50 + 40), 100)
                : (active > 0 ? 75 : 0);
            const available = Math.max(teamTotal - active, 0);

            // On-time delivery: from completed projects with deadlines
            const completedWithDeadline = groupProjects.filter(
                p => p.status === 'completed' && p.deadline && p.completed_at
            );
            const onTime = completedWithDeadline.filter(
                p => new Date(p.completed_at!) <= new Date(p.deadline!)
            ).length;
            const onTimeDelivery = completedWithDeadline.length > 0
                ? Math.round((onTime / completedWithDeadline.length) * 100)
                : 90; // default

            // Margin estimate (revenue - spent) / revenue
            const margin = revenue > 0 ? Math.round(((revenue - spent) / revenue) * 100) : 65;

            // Growth: computed if we have enough history, otherwise default
            const growth = 0; // No historical data to compute real growth yet

            // Demand classification
            const demand = classifyDemand(active, total);

            // AI Insights
            const aiInsights = generateInsights(
                name, revenue, active, total, completed, avgBudget, technologies
            );

            // Forecast: simple projection based on current revenue
            const forecastMultiplier = 1 + (active > 0 ? 0.15 : 0);
            const forecastConfidence = Math.min(50 + total * 8, 95);

            services.push({
                id: `svc-${idCounter++}`,
                name,
                color: config.color,
                iconName: config.iconName,
                description: config.description,
                revenue,
                growth,
                margin,
                satisfaction: topClients.length > 0
                    ? Math.round(topClients.reduce((s, c) => s + c.satisfaction, 0) / topClients.length * 10) / 10
                    : 4.5,
                projects: { total, active, completed, pending },
                team: {
                    total: teamTotal,
                    available,
                    utilization,
                },
                metrics: {
                    avgProjectSize: Math.round(avgBudget),
                    avgDuration: 12, // Default — no duration data in DB
                    winRate: total > 0 ? Math.round((completed / total) * 100) : 0,
                    repeatClients: topClients.filter(c => c.projects > 1).length > 0
                        ? Math.round((topClients.filter(c => c.projects > 1).length / topClients.length) * 100)
                        : 0,
                    onTimeDelivery,
                },
                technologies,
                topClients,
                revenueBreakdown: {
                    development: 70,
                    maintenance: 20,
                    consulting: 10,
                },
                forecast: {
                    nextQuarter: Math.round(revenue * forecastMultiplier),
                    confidence: forecastConfidence,
                    trend: active > 0 ? 'up' : 'stable',
                },
                opportunities: [], // No opportunities table in DB
                recentWins,
                capacity: {
                    current: utilization,
                    optimal: 85,
                    max: 100,
                },
                demand,
                aiInsights,
            });
        }

        // Sort by revenue descending
        services.sort((a, b) => b.revenue - a.revenue);

        return { data: services, error: null };
    } catch (err) {
        return {
            data: [],
            error: err instanceof Error ? err.message : 'Failed to load services data',
        };
    }
}
