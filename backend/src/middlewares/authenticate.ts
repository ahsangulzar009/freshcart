import { AccessTokenPayload, verifyAccessToken } from "@/utils/jwt";
import { logger } from "@/utils/logger";
import { ApiResponse } from "@/utils/ApiResponse";
import { NextFunction, Request, Response } from "express"


export interface AuthRequest extends Request {
  user?: AccessTokenPayload
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      ApiResponse(res, false, "No token provided", 401)
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      ApiResponse(res, false, "Invalid token format", 401)
      return;
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded
    logger.info("Authenticated request", {
      userId: decoded.userId,
      role: decoded.role,
      path: req.path,
      method: req.method
    })

    next()

  } catch (error) {
    logger.warn("Authentication failed", {
      path: req.path,
      error: (error as Error).message
    })
  }
}

