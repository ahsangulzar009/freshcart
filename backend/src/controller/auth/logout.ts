import { prisma } from "@/config/prisma";
import { ApiResponse } from "@/types/ApiRespnse";
import { logger } from "@/utils/logger";
import { Request, Response } from 'express'

export async function logout(req: Request, res: Response<LogoutResponse>) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Session expired - Unable to logout"
      })
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    })
    if (!storedToken) {
      return res.status(404).json({
        success: false,
        message: "Session expired please login again"
      })
    }

    await prisma.refreshToken.updateMany({
      where: { family: storedToken.family },
      data: { revokedAt: new Date() }
    })

    logger.info("User logged out", { userId: storedToken.userId })

    return res.status(200).json({
      success: false,
      message: "Logout Successfully!"
    })

  } catch (error) {
    logger.error("logout controller error", { error: (error as Error).message })
    return res.status(500).json({
      success: false,
      message: "Internal Serevr Error for Logout"
    })
  }
}

type LogoutResponse = ApiResponse<{
  message: string
}>