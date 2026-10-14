
import { logger } from '@/utils/logger';
import { NextFunction, Request, Response } from 'express'
import { ZodType } from 'zod'

export function apiValidator(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const errors = result.error.issues.map((err) => ({
        path: err.path,
        message: err.message
      }));

      logger.warn("Api schema validation failed", {
        path: req.path,
        method: req.method,
        errors
      });


      return res.status(422).json({
        success: false,
        message: "Invalid request data",
        userErrors: errors
      })
    }

    req.body = result.data;
    next()
  }
}
