import type { Request, Response, NextFunction } from 'express'; // Ajout de 'type' ici
import { z, ZodError } from 'zod'; // On importe 'z' pour plus de simplicité


export const validate = (schema: z.ZodObject<any, any>) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // On valide les données
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          error: 'Validation failed',
          errors: error.issues,
        });
      }
      return res.status(500).json({ 
        status: 'error', 
        message: 'Internal server error' 
      });
    }
  };