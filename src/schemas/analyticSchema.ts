import z from "zod";

/**
 * Schema for analytic query validation.
 * max_users must be optional so the test without params passes (200 OK).
 * It also handles numeric constraints required by the tests.
 */
export const lowUsageSchema = z.object({
  query: z.object({
    max_users: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Number(val)), { 
        message: "max_users must be a valid number" 
      })
      .transform((val) => (val ? Number(val) : 10))
      .pipe(
        z.number().min(0).max(100)
      ),
  }),
});