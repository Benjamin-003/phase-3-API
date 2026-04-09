import { z } from 'zod';

const DEPARTMENTS = [
  'Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'Design',
] as const;

const STATUSES = ['active', 'deprecated', 'trial'] as const;

/**
 * Schema for POST /api/tools — all required fields must be present.
 */
export const toolCreateSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    vendor: z.string().min(2, 'Vendor name must be at least 2 characters long'),
    monthly_cost: z.coerce.number().min(0, 'Monthly cost cannot be negative'),
    status: z.enum(STATUSES).default('active'),
    owner_department: z.enum(DEPARTMENTS).refine(Boolean, {
      message: 'Invalid department. Choose one of: Engineering, Sales, Marketing, HR, Finance, Operations, Design.',
    }),
    active_users_count: z.coerce.number().int().min(0, 'Active users count cannot be negative').optional(),
    category_id: z.coerce.number().int().positive().optional(),
  }),
});

/**
 * Schema for PUT /api/tools/:id — all fields are optional (partial update).
 */
export const toolUpdateSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
    vendor: z.string().min(2, 'Vendor name must be at least 2 characters long').optional(),
    monthly_cost: z.coerce.number().min(0, 'Monthly cost cannot be negative').optional(),
    status: z.enum(STATUSES).optional(),
    owner_department: z.enum(DEPARTMENTS).optional(),
    active_users_count: z.coerce.number().int().min(0).optional(),
    category_id: z.coerce.number().int().positive().optional(),
  }),
});

export type ToolCreateInput = z.infer<typeof toolCreateSchema>['body'];
export type ToolUpdateInput = z.infer<typeof toolUpdateSchema>['body'];

