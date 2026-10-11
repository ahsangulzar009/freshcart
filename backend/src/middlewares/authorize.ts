import { ApiResponse } from "@/utils/ApiResponse";
import { AccessTokenPayload } from "@/utils/jwt";
import { logger } from "@/utils/logger";
import { NextFunction, Request, Response } from 'express'

export interface AuthRequest extends Request {
  user?: AccessTokenPayload
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      ApiResponse(res, false, "Unauthorized", 401);
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn("Authorization failed", {
        userId: req.user.userId,
        role: req.user.role,
        requiredRoles: roles,
        path: req.path
      });
      ApiResponse(res, false, "Forbidden - insufficient permissions", 403);
      return;
    }

    next()

  }
}