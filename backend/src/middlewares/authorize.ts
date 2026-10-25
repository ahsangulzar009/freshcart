import { AccessTokenPayload } from "@/utils/jwt";
import { logger } from "@/utils/logger";
import { NextFunction, Request, Response } from "express";

export interface AuthRequest extends Request {
  user?: AccessTokenPayload;
}

export type UserRole = "ADMIN" | "DELIVERY_PARTNER" | "CUSTOMER";

export function authorize(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (!roles.includes(req.user.role as UserRole)) {
        logger.warn("Authorization failed", {
          userId: req.user.userId,
          role: req.user.role,
          requiredRoles: roles,
          path: req.path,
        });

        return res.status(403).json({
          success: false,
          message: "Forbidden - insufficient permissions",
        });
      }

      next();
    } catch (error) {
      logger.error("Authorization error", {
        path: req.path,
        error: (error as Error).message,
      });

      return res.status(500).json({
        success: false,
        message: "Authorization error",
      });
    }
  };
}