
import { Response } from 'express'
import { AuthRequest } from '@/middlewares/authenticate';
import { ApiResponse } from '@/types/ApiRespnse';
import { logger } from '@/utils/logger';

export async function currentUser(req: AuthRequest, res: Response<CurrentUserResponse>) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" })
    }
    return res.status(200).json({
      success: true,
      data: {
        userId: req.user.userId,
        email: req.user.email,
        role: req.user.role
      }
    })
  } catch (error) {
    logger.error("currentUser controller error", { error: (error as Error).message })
    return res.status(500).json({
      success: false,
      message: "Internal Server Error for authorization"
    })
  }
}

type CurrentUserResponse = ApiResponse<{
  data: {
    userId: string,
    email: string;
    role: string;
  }
}>