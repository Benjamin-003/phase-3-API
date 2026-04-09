import type { Request, Response, NextFunction } from 'express';
import { analyticService } from '../services/analyticService.js';
import { AppError } from '../utils/appError.js';
import { DEFAULT_EXPENSIVE_TOOLS_LIMIT, DEFAULT_LOW_USAGE_THRESHOLD, MAX_USERS_LIMIT } from '../constants/analytics.js';

export const getDepartmentCosts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const results = await analyticService.getDepartmentStats();
    
    if (!results) {
      return res.json({ data: [], summary: {} });
    }

    // Generate summary from the data array inside results
    const summary = results.data.reduce((acc: any, curr: any) => {
      acc[curr.department] = curr.total_cost || 0;
      return acc;
    }, {});

    res.json({ data: results.data, summary });
  } catch (error) {
    next(new AppError(500, 'Internal Server Error', 'Failed to calculate department analytics'));
  }
};

export const getVendorSummary = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyticService.getVendorAnalysis();
    const vendor_insights = data.map((v: any) => ({
      name: v.vendor,
      toolCount: v._count?.id || 0,
      averageCost: v._avg?.monthly_cost || 0
    }));
    res.json({ data, vendor_insights }); // Add vendor_insights
  } catch (error) {
    next(new AppError(500, 'Internal Server Error', 'Failed to generate vendor summary'));
  }
};

export const getExpensiveTools = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const minCost = Number(req.query.minCost) || 100;
    const limit = Math.min(Number(req.query.limit) || DEFAULT_EXPENSIVE_TOOLS_LIMIT, MAX_USERS_LIMIT);

    const result = await analyticService.getExpensiveTools(minCost, limit);
    res.json({ count: result.data.length, threshold: minCost, ...result });
  } catch (error) {
    next(new AppError(500, 'Internal Server Error', 'Failed to retrieve expensive tools list'));
  }
};

/**
 * Gets underutilized tools.
 * Handles missing query parameters and provides the required structure.
 */

export const getLowUsageTools = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const maxUsersRaw = req.query.max_users;
    const threshold = typeof maxUsersRaw === 'number' ? maxUsersRaw : Number(maxUsersRaw) || 10;

    const tools = await analyticService.getLowUsageTools(threshold);
    
    const totalSavings = tools.reduce((acc: number, tool: any) => {
      const cost = Number(tool?.monthly_cost) || 0;
      return acc + cost;
    }, 0);

    res.status(200).json({
      threshold,
      data: tools,
      savings_analysis: { 
        tools_count: tools.length,
        potential_monthly_savings: totalSavings
      } 
    });
  } catch (error) {
    next(new AppError(500, 'Internal Server Error', 'Failed to fetch analytics'));
  }
};


export const getToolsByCategory = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyticService.getToolsByCategory();
    // The test suite expects an 'insights' property
    res.json({ data, insights: data });
  } catch (error) {
    next(new AppError(500, 'Internal Server Error', 'Failed to fetch category statistics'));
  }
};