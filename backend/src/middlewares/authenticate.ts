import { AccessTokenPayload, verifyAccessToken } from "@/utils/jwt";
import { logger } from "@/utils/logger";
import { NextFunction, Request, Response } from "express"


export interface AuthRequest extends Request {
  user: AccessTokenPayload
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      })
    }


    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid token format"
      })
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      })
    }
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
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    })
  }
}

