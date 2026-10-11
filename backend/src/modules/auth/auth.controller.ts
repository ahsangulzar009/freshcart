import { ApiResponse } from '@/utils/ApiResponse';
import { logger } from '@/utils/logger';
import { Request, Response } from 'express'
import authService from './auth.service';
import { AuthRequest } from '@/middlewares/authenticate';
import { prisma } from '@/config/prisma';

export class AuthController {
  async sendOtp(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const result = await authService.sendOtp(email);
      ApiResponse(res, true, result.message, 200)
    } catch (error) {
      logger.error("Send OTP controller error", { error: (error as Error).message })
      ApiResponse(res, false, (error as Error).message, 400)
    }
  }

  async verifyOtp(req: Request, res: Response) {
    try {
      const { email, code } = req.body;
      const result = await authService.verifyOtp(email, code)
      ApiResponse(res, true, "Login Successfull", 200, result)
    } catch (error) {
      logger.error("verifyOtp controller error", { error: (error as Error).message })
      ApiResponse(res, false, (error as Error).message, 400)
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        ApiResponse(res, false, "Refresh token is expired", 400)
        return;
      }

      const result = await authService.refreshToken(refreshToken);
      ApiResponse(res, false, "Token refreshed", 200, result)
    } catch (error) {
      logger.error("refreshToken controller error", { error: (error as Error).message })
      ApiResponse(res, false, (error as Error).message, 401)
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        ApiResponse(res, false, "Refresh token is required", 400)
        return;
      }

      const result = await authService.logout(refreshToken);
      ApiResponse(res, false, result.message, 200)
    } catch (error) {
      logger.error("logout controller error", { error: (error as Error).message })
      ApiResponse(res, false, (error as Error).message, 400)
    }
  }

  async logoutAll(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      const result = await authService.logoutAll(userId);
      ApiResponse(res, false, result.message, 200)
    } catch (error) {
      logger.error("logoutAll controller error", { error: (error as Error).message })
      ApiResponse(res, false, (error as Error).message, 400)
    }
  }

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const { name, phone } = req.body;
      const user = await prisma.user.update({
        where: { id: req.user!.userId },
        data: { name, phone },
        select: { id: true, email: true, name: true, phone: true, role: true }
      })
      ApiResponse(res, true, "Profile updated", 201, user)
    } catch (error) {
      logger.error("updateProfile controller error", { error: (error as Error).message })
      ApiResponse(res, false, (error as Error).message, 400)
    }
  }

  async me(req: AuthRequest, res: Response) {
    try {
      ApiResponse(res, true, "User fetched", 200, req.user)
    } catch (error) {
      logger.error("me controller error", { error: (error as Error).message })
      ApiResponse(res, false, (error as Error).message, 400)
    }
  }

}

export default new AuthController