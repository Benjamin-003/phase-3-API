import { toolRepository } from '../repositories/toolRepository.js';
import { AppError } from '../utils/appError.js';
import type { Prisma } from '@prisma/client';

interface GetAllToolsOptions {
  name?: string;
  category_id?: number;
  owner_department?: string;
  page?: number;
  limit?: number;
}

/**
 * Service layer for Tools business logic.
 * Delegates all data access to ToolRepository.
 */
export class ToolService {

  /**
   * Retrieves tools with optional filtering and pagination.
   * Returns data + pagination metadata.
   */
  async getAllTools(options: GetAllToolsOptions = {}) {
    const { name, category_id, owner_department, page = 1, limit = 20 } = options;

    const where: Prisma.toolsWhereInput = {};
    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (category_id) where.category_id = category_id;
    if (owner_department) where.owner_department = owner_department as any;

    const skip = (page - 1) * limit;

    const [tools, total] = await Promise.all([
      toolRepository.findMany(where, skip, limit),
      toolRepository.count(where),
    ]);

    return {
      data: tools,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

/**
   * Finds a specific tool by its unique ID.
   * Logic: Returns null if not found so the controller can handle the 404.
   */
  async getToolById(id: number) {
    // Just return the result of the repository
    return await toolRepository.findById(id);
  }

  /**
   * Creates a new tool record.
   * Handles the category relation via connect.
   */
  async createTool(data: any) {
    const { category_id, ...rest } = data;

    const createData: Prisma.toolsCreateInput = {
      ...rest,
      ...(category_id && {
        categories: { connect: { id: Number(category_id) } },
      }),
    };

    return toolRepository.create(createData);
  }

  /**
   * Updates an existing tool with only the provided fields (partial update).
   * @throws {AppError} 404 if the tool does not exist.
   */
  async updateTool(id: number, data: Prisma.toolsUpdateInput) {
    try {
      return await toolRepository.update(id, data);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new AppError(404, 'Not Found', 'Cannot update tool: target ID does not exist.');
      }
      throw new AppError(500, 'Internal Server Error', 'An error occurred during the update process.');
    }
  }

  /**
   * Deletes a tool record.
   * @throws {AppError} 404 if the tool does not exist.
   */
  async deleteTool(id: number) {
    try {
      await toolRepository.delete(id);
      return { success: true };
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new AppError(404, 'Not Found', 'Cannot delete tool: target ID does not exist.');
      }
      throw new AppError(500, 'Internal Server Error', 'Failed to delete the tool.');
    }
  }
}

export const toolService = new ToolService();
