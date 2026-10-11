import { ApiResponse } from '@/utils/ApiResponse';
import { logger } from '@/utils/logger';
import { NextFunction, Request, Response } from 'express'

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error("Unhandled error", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body
  });

  // Prisma Error Handling
  if (err.constructor.name == "PrismaClientKnownRequestError") {
    const prismaError = err as unknown as {
      code: string,
      meta?: { target?: string[] }
    }
    if (prismaError.code === 'P2002') {
      ApiResponse(
        res,
        false,
        `${prismaError.meta?.target?.join(", ")} already exists`,
        409
      )

      return;
    }

    if (prismaError.code === 'P2025') {
      ApiResponse(res, false, "Record not found", 404)
      return;
    }
  }

  // JWT Error Handling
  if (err.name == 'JsonWebTokenError') {
    ApiResponse(res, false, "Invalid token", 401)
    return;
  }

  // Token Expire Error Handling
  if (err.name === "TokenExpiredError") {
    ApiResponse(res, false, "Token Expired", 401)
    return;
  }

  ApiResponse(
    res,
    false,
    process.env.NODE_ENV === 'production'
      ? "Internal server error"
      : err.message,
    500
  )

  return;
}