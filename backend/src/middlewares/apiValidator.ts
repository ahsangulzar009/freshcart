import { ApiResponse } from '@/utils/ApiResponse';
import { logger } from '@/utils/logger';
import  { NextFunction, Request, Response } from 'express'
import { ZodType } from 'zod'

export function apiValidator(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const errors = result.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message
      }));

      logger.warn("Api schema validation failed", {
        path: req.path,
        method: req.method,
        errors
      });

      ApiResponse(res, false, "Api schema validation failed", 422, undefined, errors);
      return;
    }

    req.body = result.data;
    next()
  }
}
