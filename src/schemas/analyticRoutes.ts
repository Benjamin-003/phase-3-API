import z from "zod";

/**
 * Schema for analytic query validation.
 * max_users must be optional so the test without params passes (200 OK).
 * It also handles numeric constraints required by the tests.
 */
export const lowUsageSchema = z.object({
  query: z.object({
    // .optional() règle l'erreur 400 du premier test analytics
    max_users: z.string().optional()
      .refine(val => !val || !isNaN(Number(val)), { message: "Must be a number" })
      .transform(val => val ? Number(val) : 10) // Valeur par défaut
  })
});

export const lowUsageQuerySchema = z.object({
  query: z.object({
    max_users: z.coerce
      // On remplace 'invalid_type_error' par 'message' car TS dit que c'est une propriété connue
      .number({ message: "max_users must be a valid number" })
      .min(0, "max_users must be at least 0")
      .max(100, "max_users cannot exceed 100")
      .optional()
  })
});