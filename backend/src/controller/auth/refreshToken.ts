
import { prisma } from '@/config/prisma';
import { ApiResponse } from '@/types/ApiRespnse';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/utils/jwt';
import { logger } from '@/utils/logger';
import { Request, Response } from 'express'

export async function refreshToken(req: Request, res: Response<RefreshTokenResponse>) {
  try {
    const clientType = req.headers["x-client-type"] === "mobile" ? "mobile" : "web";

    const refreshToken =
      clientType === "mobile" ? req.body.refreshToken : req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Session expired, please login again",
      });
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true
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

    let payload;

    payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(401).json({
        success: false,
        message: "Please Login again"
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

    if (!storedToken.user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated"
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
      data: { userId: storedToken.user.id, token: newRefreshToken, family: storedToken.family, expiresAt }
    })



    logger.info("Token refreshed", { userId: storedToken.user.id, clientType })

    if (clientType === "mobile") {
      return res.status(200).json({
        success: true,
        data: {
          accessToken,
          refreshToken: newRefreshToken
        }
      })
    }

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 10 * 60 * 1000,
      path: "/api/v1/freshcart/auth/me"
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/v1/freshcart/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true
    })

  } catch (error) {
    logger.error("refreshToken controller error", { error: (error as Error).message })
    return res.status(500).json({
      success: false,
      message: "Internal Server Error for refreshing token"
    })
  }
}

type RefreshTokenResponse = ApiResponse<{
  data?: {
    accessToken: string,
    refreshToken: string
  }
}>