
import { prisma } from '@/config/prisma';
import { ApiResponse } from '@/types/ApiRespnse';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/utils/jwt';
import { logger } from '@/utils/logger';
import { Request, Response } from 'express'

export async function refreshToken(req: Request, res: Response<RefreshTokenResponse>) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Session expired please login again"
      })
    }

    let payload;

    payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(401).json({
        success: false,
        message: "Please Login"
      })
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    })
    if (!storedToken) {
      return res.status(404).json({
        success: false,
        message: "Session expired please login again"
      })
    }

    if (storedToken.revokedAt) {
      await prisma.refreshToken.updateMany({
        where: { family: storedToken.family },
        data: { revokedAt: new Date() }
      })
      logger.warn("Refresh token reuse detected - family revoked", {
        userId: storedToken.userId,
        family: storedToken.family
      })

      return res.status(401).json({
        success: false,
        message: "Token reuse detected, Please login again"
      })
    }

    if (new Date() > storedToken.expiresAt) {
      return res.status(401).json({
        success: false,
        message: "Session expired please login again"
      })
    }

    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() }
    })

    const accessToken = generateAccessToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role
    });
    const { token: newRefreshToken, expiresAt } = generateRefreshToken(storedToken.user.id, payload.family);

    await prisma.refreshToken.create({
      data: { userId: storedToken.user.id, token: newRefreshToken, family: payload.family, expiresAt }
    })

    logger.info("Token refreshed", { userId: storedToken.user.id })

    return res.status(200).json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken
      }
    })

  } catch (error) {

  }
}

type RefreshTokenResponse = ApiResponse<{
  data: {
    accessToken: string,
    refreshToken: string
  }
}>