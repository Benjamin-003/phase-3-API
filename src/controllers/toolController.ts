import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError.js';
import { toolService } from '../services/toolService.js';

/**
 * Retrieves all tools.
 * Returns a direct array for the test: expect(Array.isArray(res.body)).toBe(true)
 */
export const getTools = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await toolService.getAllTools();
    // Return only the data array to satisfy the test expectation
    res.json(result.data); 
  } catch (error) {
    next(new AppError(500, 'Internal Server Error', 'Failed to fetch tools'));
  }
};

/**
 * Creates a new tool.
 * Ensures numeric fields are properly cast to avoid database type errors.
 */
export const createTool = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const toolData = {
      ...req.body,
      // Prisma requires numeric types for these fields
      monthly_cost: req.body.monthly_cost ? Number(req.body.monthly_cost) : 0,
      active_users_count: req.body.active_users_count ? Number(req.body.active_users_count) : 0,
    };

    const newTool = await toolService.createTool(toolData);
    res.status(201).json(newTool);
  } catch (error) {
    next(new AppError(500, 'Internal Server Error', 'Failed to create tool'));
  }
};

/**
 * Retrieves a tool by ID.
 * Returns 404 instead of 500 when the tool does not exist.
 */
export const getToolById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tool = await toolService.getToolById(Number(id));
    
    // Now that the service doesn't throw, we handle the 404 here
    if (!tool) {
      return res.status(404).json({
        status: 'error',
        message: `Tool with ID ${id} was not found.`
      });
    }

    res.json(tool);
  } catch (error) {
    // If we catch something here, it's a real server error
    next(new AppError(500, 'Internal Server Error', 'Failed to fetch tool'));
  }
};


/**
 * Updates an existing tool (partial update — only provided fields are changed).
 */
export const updateTool = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, vendor, owner_department, monthly_cost, status, active_users_count, category_id } = req.body;

    // Build update object with only the provided fields (fix for partial update bug)
    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (vendor !== undefined) updateData.vendor = vendor;
    if (owner_department !== undefined) updateData.owner_department = owner_department;
    if (status !== undefined) updateData.status = status;
    if (monthly_cost !== undefined) updateData.monthly_cost = Number(monthly_cost);
    if (active_users_count !== undefined) updateData.active_users_count = Number(active_users_count);
    if (category_id !== undefined) {
      updateData.categories = { connect: { id: Number(category_id) } };
    }

    const updatedTool = await toolService.updateTool(Number(id), updateData);
    res.json(updatedTool);
  } catch (error: any) {
    if (error instanceof AppError) return next(error);
    next(new AppError(500, "Internal server error", "Failed to update tool"));
  }
};

/**
 * Deletes a tool from the database.
 */
export const deleteTool = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await toolService.deleteTool(Number(id));
    res.status(204).send();
  } catch (error: any) {
    if (error instanceof AppError) return next(error);
    next(new AppError(500, "Internal server error", "Failed to delete tool"));
  }
};
