import {
  EFFICIENCY_THRESHOLDS,
  WARNING_HIGH_THRESHOLD,
  WARNING_MEDIUM_THRESHOLD,
} from '../constants/analytics.js';

export interface ToolLike {
  monthly_cost: any;
  active_users_count: any;
  owner_department?: string | null;
  vendor?: string | null;
}

/**
 * Aggregates tools into per-department statistics.
 * Returns a map: department name → { total_cost, tools_count, total_users }.
 */
export function aggregateByDepartment(
  tools: ToolLike[]
): Record<string, { total_cost: number; tools_count: number; total_users: number }> {
  const stats: Record<string, { total_cost: number; tools_count: number; total_users: number }> = {};

  for (const tool of tools) {
    const dept = tool.owner_department || 'Unassigned';
    const cost = Number(tool.monthly_cost) || 0;

    if (!stats[dept]) {
      stats[dept] = { total_cost: 0, tools_count: 0, total_users: 0 };
    }

    stats[dept].total_cost += cost;
    stats[dept].tools_count += 1;
    stats[dept].total_users += Number(tool.active_users_count) || 0;
  }

  return stats;
}

/**
 * Formats raw department stats into the API response shape,
 * adding budget percentage for each department.
 */
export function formatDepartmentData(
  stats: Record<string, { total_cost: number; tools_count: number; total_users: number }>,
  totalCost: number
) {
  return Object.entries(stats).map(([name, s]) => ({
    department: name,
    ...s,
    percentage_of_total:
      totalCost > 0 ? Number(((s.total_cost / totalCost) * 100).toFixed(2)) : 0,
  }));
}

/**
 * Determines the warning level for a tool based on its cost per active user.
 * - 'high'   : cost_per_user > WARNING_HIGH_THRESHOLD
 * - 'medium' : cost_per_user > WARNING_MEDIUM_THRESHOLD
 * - 'low'    : otherwise
 */
export function calculateWarningLevel(users: number, costPerUser: number): 'high' | 'medium' | 'low' {
  if (users === 0 || costPerUser > WARNING_HIGH_THRESHOLD) return 'high';
  if (costPerUser > WARNING_MEDIUM_THRESHOLD) return 'medium';
  return 'low';
}

/**
 * Maps a numeric average cost per user to a human-readable efficiency label.
 * Thresholds come from constants/analytics.ts.
 */
export function calculateEfficiency(
  avgCostPerUser: number
): 'excellent' | 'good' | 'average' | 'below_average' {
  if (avgCostPerUser < EFFICIENCY_THRESHOLDS.EXCELLENT) return 'excellent';
  if (avgCostPerUser <= EFFICIENCY_THRESHOLDS.GOOD) return 'good';
  if (avgCostPerUser <= EFFICIENCY_THRESHOLDS.AVERAGE) return 'average';
  return 'below_average';
}

/**
 * Calculates cost per user for a tool, handling division by zero.
 */
export function calcCostPerUser(monthlyCost: number, activeUsers: number): number {
  return activeUsers > 0 ? monthlyCost / activeUsers : monthlyCost;
}
