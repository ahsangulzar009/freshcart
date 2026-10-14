import { transporter } from '@/config/mailer';
import { prisma } from '@/config/prisma';
import { ApiResponse } from '@/types/ApiRespnse';
import { logger } from '@/utils/logger';
import { generateOtp, getOtpExpiry } from '@/utils/otp';
import { Request, Response } from 'express'


async function sendOtpEmail(email: string, code: string) {
  try {
    await transporter.sendMail({
      from: `Freshcart <${process.env.SMTP_FROM}>`,
      to: email,
      subject: "Your verification code",
      text: `Your OTP is ${code}. It expires in 10 minutes.`,
      html: `
          <div style="font-family: sans-serif; max-width:480px; margin: 0 auto;">
            <h2>Your Login Code</h2>
            <p>Use the code below to login. It expires in 10 minutes.</p>
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; padding: 20px; background: #f4f4f4; text-align: center; border-radius: 8px; margin: 24px 0;">
              ${code}
            </div>
            <p style="color: #888; font-size: 13px;">
              If you didn't request this, ignore this email.
            </p>
          </div>
        `
    })
  } catch (error) {
    logger.error("Failed to send OTP email", { email, error })
    throw new Error("Failed to send OTP email. Please try again.")
  }
}

export async function sendOtp(req: Request, res: Response<SendOtpResponse>) {
  try {
    const { email } = req.body

    let user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      user = await prisma.user.create({
        data: { email, role: "CUSTOMER" }
      })
      logger.info("New USER CREATED", { userId: user.id, email })
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support"
      })
    }

    await prisma.otpCode.updateMany({
      where: { userId: user.id },
      data: { usedAt: new Date() }
    })

    const code = generateOtp();
    const expiresAt = getOtpExpiry();

    await prisma.otpCode.create({
      data: { userId: user.id, code, expiresAt }
    })

    await sendOtpEmail(email, code)

    logger.info("OTP sent", { userId: user.id, email })

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email"
    })

  } catch (error) {
    logger.error("Send OTP controller error", { error: (error as Error).message })
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    })
  }
}

type SendOtpResponse = ApiResponse<{
  message: string
}>