import { AccessTokenPayload, verifyAccessToken } from "@/utils/jwt";
import { logger } from "@/utils/logger";
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

    const clientType = req.headers["x-client-type"] === "mobile" ? "mobile" : "web";
    let token: string | undefined


    if (clientType === "mobile") {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    } else {
      token = req.cookies?.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      })
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
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

