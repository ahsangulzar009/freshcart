import { prisma } from '@/config/prisma';
import { AuthRequest } from '@/middlewares/authenticate';
import { ApiResponse } from '@/types/ApiRespnse';
import { logger } from '@/utils/logger';
import { Response } from 'express'

export async function logoutAll(req: AuthRequest, res: Response<LogoutAllResponse>) {
  try {

    await prisma.refreshToken.updateMany({
      where: { userId: req.user!.userId, revokedAt: null },
      data: { revokedAt: new Date() }
    })
    logger.info("User logged out form all devices", { userId: req.user!.userId })

    return res.status(200).json({
      success: true,
      message: "User logged out from all devices"
    })

  } catch (error) {
    logger.error("logoutAll controller error", { error: (error as Error).message })
    return res.status(500).json({
      success: false,
      message: "Internal Server Error for logout from all devices"
    })
  }
}

type LogoutAllResponse = ApiResponse<{
  message: string
}>