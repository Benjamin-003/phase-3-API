import prisma from '../lib/prisma.js';
import type { Prisma } from '@prisma/client';

/**
 * Repository layer — encapsulates all Prisma queries for the Tools entity.
 * No business logic here: only raw data access.
 */
export class ToolRepository {

  async findMany(where: Prisma.toolsWhereInput, skip: number, take: number) {
    return prisma.tools.findMany({
      where,
      include: { categories: true },
      orderBy: { name: 'asc' },
      skip,
      take,
    });
  }

  async count(where: Prisma.toolsWhereInput) {
    return prisma.tools.count({ where });
  }

  async findById(id: number) {
    return prisma.tools.findUnique({
      where: { id },
      include: { categories: true },
    });
  }

  async findActive() {
    return prisma.tools.findMany({
      where: { status: 'active' },
      include: { categories: true },
    });
  }

  async findAll() {
    return prisma.tools.findMany({ include: { categories: true } });
  }

  async findByMaxUsers(maxUsers: number) {
    return prisma.tools.findMany({
      where: { active_users_count: { lte: maxUsers } },
      include: { categories: true },
      orderBy: { active_users_count: 'asc' },
    });
  }

  async create(data: Prisma.toolsCreateInput) {
    return prisma.tools.create({ data, include: { categories: true } });
  }

  async update(id: number, data: Prisma.toolsUpdateInput) {
    return prisma.tools.update({ where: { id }, data, include: { categories: true } });
  }

  async delete(id: number) {
    return prisma.tools.delete({ where: { id } });
  }
}

export const toolRepository = new ToolRepository();
