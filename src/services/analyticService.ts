import { toolRepository } from '../repositories/toolRepository.js';
import { EFFICIENCY_THRESHOLDS, DEFAULT_EXPENSIVE_TOOLS_LIMIT } from '../constants/analytics.js';
import {
  aggregateByDepartment,
  formatDepartmentData,
  calculateEfficiency,
  calcCostPerUser,
} from '../utils/analyticsHelpers.js';

export class AnalyticService {

  /**
   * Aggregates tool costs and counts by department.
   * Uses named helper functions to keep each step readable and testable.
   */
  async getDepartmentStats() {
   const allTools = await toolRepository.findAll();
    if (allTools.length === 0) return null;

    const stats = aggregateByDepartment(allTools);
    const totalCompanyCost = Object.values(stats).reduce((sum, s) => sum + s.total_cost, 0);
    const data = formatDepartmentData(stats, totalCompanyCost);

    return {
      data,
      summary: {
        total_company_cost: Number(totalCompanyCost.toFixed(2)),
        departments_count: data.length,
        most_expensive_department:
          [...data].sort((a, b) => b.total_cost - a.total_cost)[0]?.department ?? 'N/A',
      },
    };
  }

  /**
   * Calculates vendor efficiency based on average cost per user.
   * Extracted aggregation logic keeps this function short.
   */
  async getVendorAnalysis() {
    const allTools = await toolRepository.findAll();
    const vendorStats: Record<string, { tools_count: number; total_cost: number; total_users: number }> = {};

    for (const tool of allTools) {
      const vendor = tool.vendor || 'Unknown';
      if (!vendorStats[vendor]) {
        vendorStats[vendor] = { tools_count: 0, total_cost: 0, total_users: 0 };
      }
      vendorStats[vendor].tools_count++;
      vendorStats[vendor].total_cost += Number(tool.monthly_cost);
      vendorStats[vendor].total_users += tool.active_users_count || 0;
    }

    return Object.entries(vendorStats).map(([vendor, s]) => {
      const avgCostPerUser = calcCostPerUser(s.total_cost, s.total_users);
      return {
        vendor,
        tools_count: s.tools_count,
        total_monthly_cost: Number(s.total_cost.toFixed(2)),
        average_cost_per_user: Number(avgCostPerUser.toFixed(2)),
        vendor_efficiency: calculateEfficiency(avgCostPerUser),
      };
    });
  }

  /**
   * Identifies tools that are expensive relative to their user base.
   * Computes cost_per_user, compares each tool to the company average,
   * and flags below-average tools with their potential savings.
   */
  async getExpensiveTools(minCost: number = 100, limit: number = DEFAULT_EXPENSIVE_TOOLS_LIMIT) {
    const activeTools = await toolRepository.findActive();

    // Company-wide averages (to determine efficiency_rating)
    const totalCost = activeTools.reduce((sum, t) => sum + Number(t.monthly_cost), 0);
    const totalUsers = activeTools.reduce((sum, t) => sum + (t.active_users_count || 0), 0);
    const companyAvgCostPerUser = calcCostPerUser(totalCost, totalUsers);

    const enriched = activeTools
      .filter((t) => Number(t.monthly_cost) >= minCost)
      .map((tool) => {
        const cost = Number(tool.monthly_cost);
        const users = tool.active_users_count || 0;
        const costPerUser = calcCostPerUser(cost, users);
        const efficiencyRating =
          costPerUser > companyAvgCostPerUser ? 'below_average' : 'above_average';

        return {
          id: tool.id,
          name: tool.name,
          vendor: tool.vendor,
          owner_department: tool.owner_department,
          monthly_cost: cost,
          active_users_count: users,
          cost_per_user: Number(costPerUser.toFixed(2)),
          efficiency_rating: efficiencyRating,
          potential_savings:
            efficiencyRating === 'below_average'
              ? Number((cost - companyAvgCostPerUser * users).toFixed(2))
              : 0,
          categories: tool.categories,
        };
      })
      .sort((a, b) => b.monthly_cost - a.monthly_cost)
      .slice(0, limit);

    const potentialSavings = enriched
      .filter((t) => t.efficiency_rating === 'below_average')
      .reduce((sum, t) => sum + t.potential_savings, 0);

    return {
      company_avg_cost_per_user: Number(companyAvgCostPerUser.toFixed(2)),
      potential_savings: Number(potentialSavings.toFixed(2)),
      data: enriched,
    };
  }

  /**
   * Identifies tools with low active user counts.
   */
  async getLowUsageTools(maxUsers: number = 10) {
  return await toolRepository.findByMaxUsers(maxUsers);
}

  /**
   * Groups and counts tools by their category.
   */
  async getToolsByCategory() {
    const categories = await toolRepository.findAll();
    const catMap: Record<number, { id: number; name: string | null; tool_count: number }> = {};

    for (const tool of categories) {
      if (!tool.categories) continue;
      const cat = tool.categories;
      if (!catMap[cat.id]) {
        catMap[cat.id] = { id: cat.id, name: cat.name, tool_count: 0 };
      }
      catMap[cat.id]!.tool_count++;
    }

    return Object.values(catMap).sort((a, b) => b.tool_count - a.tool_count);
  }
}

export const analyticService = new AnalyticService();
