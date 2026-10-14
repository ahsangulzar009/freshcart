import { prisma } from '@/config/prisma';
import { ApiResponse } from '@/types/ApiRespnse';
import { generateAccessToken, generateRefreshToken } from '@/utils/jwt';
import { logger } from '@/utils/logger';
import { Request, Response } from 'express'
import { v7 as uuidv7 } from 'uuid'

export async function verifyOtp(req: Request, res: Response<VerifyOtpResponse>) {
  try {
    const { email, code } = req.body;

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      })
    }

    if (!user.isActive) {
      return res.status(404).json({
        success: false,
        message: "Your account has beed deactivated"
      })
    }

    const otp = await prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        code,
        usedAt: null,
        expiresAt: { gt: new Date() }
      }
    });
    if (!otp) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired otp"
      })
    }

    if (otp.attempts >= 5) {
      return res.status(409).json({
        success: false,
        message: "Too many failed attempts. Please request a new OTP."
      })
    }

    if (new Date() > otp.expiresAt) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one."
      })
    }

    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { usedAt: new Date() }
    })
    const family = uuidv7();
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    const { token: refreshToken, expiresAt } = generateRefreshToken(user.id, family)
    await prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken, family, expiresAt }
    })

    logger.info("User logged in", { userId: user.id, email });

    return res.status(200).json({
      success: true,
      message: "Login Successfull",
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role
        }
      }
    })
  } catch (error) {
    logger.error("verifyOtp controller error", { error: (error as Error).message })
    return res.status(500).json({
      success: false,
      message: "Internal Server Error for Verification OTP"
    })
  }
}

type VerifyOtpResponse = ApiResponse<{
  message: string,
  data: {
    accessToken: string,
    refreshToken: string,
    user: {
      id: string,
      email: string,
      name: string | null,
      phone: string | null,
      role: string
    }
  }
}>