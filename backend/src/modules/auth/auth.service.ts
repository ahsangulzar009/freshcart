import { v7 as uuidv7 } from 'uuid'
import authRepository from './auth.repository';
import { logger } from '@/utils/logger';
import { generateOtp, getOtpExpiry, isOtpExpired } from '@/utils/otp';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '@/utils/jwt';
import { transporter } from '@/config/mailer';

const MAX_OTP_ATREMPTS = 5

export class AuthService {
  async sendOtp(email: string) {
    let user = await authRepository.findUserByEmail(email);

    if (!user) {
      user = await authRepository.createUser(email);
      logger.info("New USER CREATED", { userId: user.id, email })
    }

    if (!user.isActive) {
      throw new Error("Your account has been deactivated. Please contact support")
    }

    await authRepository.invalidatePreviousOtps(user.id);
    const code = generateOtp();
    const expiresAt = getOtpExpiry();
    await authRepository.createOtp(user.id, code, expiresAt);

    await this.sendOtpEmail(email, code)
    logger.info("OTP sent", { userId: user.id, email })

    return { message: "OTP sent to your email" }
  }

  async verifyOtp(email: string, code: string) {
    const user = await authRepository.findUserByEmail(email);

    if (!user) {
      throw new Error("User not found")
    }

    if (!user.isActive) {
      throw new Error("Your account has beed deactivated")
    }

    const otp = await authRepository.findValidOtp(user.id, code);
    if (!otp) {
      throw new Error("Invalid or expired otp")
    }

    if (otp.attempts >= MAX_OTP_ATREMPTS) {
      throw new Error("Too many failed attempts. Please request a new OTP.")
    }

    if (isOtpExpired(otp.expiresAt)) {
      throw new Error("OTP has expired. Please request a new one.")
    }

    await authRepository.markOtpAsUsed(otp.id)
    const family = uuidv7();
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role
    })

    const { token: refreshToken, expiresAt } = generateRefreshToken(user.id, family)

    await authRepository.createRefreshToken(
      user.id,
      refreshToken,
      family,
      expiresAt
    )

    logger.info("User logged in", { userId: user.id, email })

    return {
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
  }

  async logout(token: string) {
    const storedToken = await authRepository.findRefreshToken(token);

    if (storedToken) {
      await authRepository.revokeTokenFamily(storedToken.family);
      logger.info("User logged out", { userId: storedToken.userId })
    }

    return { message: "Logged out successfully" }
  }

  async refreshToken(token: string) {
    let payload;

    try {
      payload = verifyRefreshToken(token);
    } catch (error) {
      throw new Error("Invalid refresh token")
    }

    const storedToken = await authRepository.findRefreshToken(token);
    if (!storedToken) {
      throw new Error("Refresh token not found")
    }

    if (storedToken.revokedAt) {
      await authRepository.revokeTokenFamily(storedToken.family);
      logger.warn("Refresh token reuse detected - family revoked", {
        userId: storedToken.userId,
        family: storedToken.family
      })
      throw new Error("Token reuse detected, Please login again")
    }

    if (new Date() > storedToken.expiresAt) {
      throw new Error("Refresh token expired. Please login again.")
    }

    await authRepository.revokeRefreshToken(storedToken.id)

    const accessToken = generateAccessToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role
    });
    const { token: newRefreshToken, expiresAt } = generateRefreshToken(storedToken.user.id, payload.family);

    await authRepository.createRefreshToken(
      storedToken.user.id,
      newRefreshToken,
      payload.family,
      expiresAt
    )

    logger.info("Token refreshed", { userId: storedToken.user.id })
    return { accessToken, refreshToken: newRefreshToken }

  }

  async logoutAll(userId: string) {
    await authRepository.revokeAllUserTokens(userId)
    logger.info("User logged out form all devices", { userId })

    return { message: "Logged out from all devices." }
  }

  private async sendOtpEmail(email: string, code: string) {
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

}

export default new AuthService