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
      return res.status(409).json({
        success: false,
        message: `${prismaError.meta?.target?.join(", ")} already exists`
      })
    }

    if (prismaError.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: "Record not found"
      })
    }
  }

  // JWT Error Handling
  if (err.name == 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    })

  }

  // Token Expire Error Handling
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token Expired"
    })
  }

  return res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? "Internal server error"
      : err.message,
  })
}