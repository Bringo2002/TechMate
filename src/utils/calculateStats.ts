// src/utils/calculateStats.ts

import { PieData } from '../components/dashboard/charts/RequestBreakdownPie';
//import { BarChartProps } from '../components/dashboard/charts/BarChart'; 
import { LineChartProps } from '../components/dashboard/charts/LineChart';

export interface Request {
  id: string;
  type: string;
  createdAt: string; // ISO date string
  status: 'pending' | 'completed' | 'rejected';
  // any other relevant fields
}

/**
 * Calculate monthly totals for BarChart and LineChart
 */
export const calculateMonthlyStats = (requests: Request[]): { month: string; value: number }[] => {
  const stats: Record<string, number> = {};

  requests.forEach(req => {
    const month = new Date(req.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
    stats[month] = (stats[month] || 0) + 1;
  });

  // Convert to array sorted by month
  return Object.entries(stats)
    .map(([month, value]) => ({ month, value }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
};

/**
 * Calculate request type breakdown for Pie chart
 */
export const calculateRequestBreakdown = (requests: Request[]): PieData[] => {
  const counts: Record<string, number> = {};

  requests.forEach(req => {
    counts[req.type] = (counts[req.type] || 0) + 1;
  });

  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6']; // Tailwind accent colors
  return Object.entries(counts).map(([label, value], i) => ({
    label,
    value,
    color: colors[i % colors.length],
  }));
};

/**
 * Optional helper to calculate trend line (monthly values) for LineChart
 */
export const calculateTrendLine = (requests: Request[]): LineChartProps['data'] => {
  return calculateMonthlyStats(requests); // can reuse monthly stats
};
