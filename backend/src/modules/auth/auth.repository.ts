import { prisma } from "@/config/prisma";
import { ROLE } from "../../../prisma/generated/prisma/client";


export class AuthRepository {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  }

  findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id }
    })
  }

  createUser(email: string, role: ROLE = ROLE.CUSTOMER) {
    return prisma.user.create({
      data: { email, role }
    })
  }

  updateUser(id: string, data: { name?: string, phone?: string }) {
    return prisma.user.update({
      where: { id },
      data
    })
  }

  updatePassword(id: string, password: string) {
    return prisma.user.update({
      where: { id },
      data: { password }
    })
  }

  findUserByEmailWithPassword(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        password: true
      }
    })
  }

  invalidatePreviousOtps(userId: string) {
    return prisma.otpCode.updateMany({
      where: { id: userId },
      data: { usedAt: new Date() }
    })
  }

  createOtp(userId: string, code: string, expiresAt: Date) {
    return prisma.otpCode.create({
      data: { userId, code, expiresAt }
    })
  }

  findValidOtp(userId: string, code: string) {
    return prisma.otpCode.findFirst({
      where: {
        userId,
        code,
        usedAt: null,
        expiresAt: { gt: new Date() }
      }
    })
  }

  incrementOtpAttempts(otpId: string) {
    return prisma.otpCode.update({
      where: { id: otpId },
      data: { attempts: { increment: 1 } }
    })
  }

  markOtpAsUsed(otpId: string) {
    return prisma.otpCode.update({
      where: { id: otpId },
      data: { usedAt: new Date() }
    })
  }

  createRefreshToken(userId: string, token: string, family: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: { userId, token, family, expiresAt }
    })
  }

  findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true }
    })
  }

  revokeRefreshToken(id: string) {
    return prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() }
    })
  }

  revokeTokenFamily(family: string) {
    return prisma.refreshToken.updateMany({
      where: { family },
      data: { revokedAt: new Date() }
    })
  }

  revokeAllUserTokens(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() }
    })
  }

}

export default new AuthRepository