import { prisma } from "@/config/prisma";
import { AuthRequest } from "@/middlewares/authenticate";
import { ApiResponse } from "@/types/ApiRespnse";
import { logger } from "@/utils/logger";
import { Response } from "express";

export async function logout(req: AuthRequest, res: Response<LogoutResponse>) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { refreshToken } = req.body ?? {}

    if (refreshToken) {
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        select: { family: true, userId: true }
      });

      if (storedToken && storedToken.userId === req.user.userId) {
        await prisma.refreshToken.updateMany({
          where: { family: storedToken.family, revokedAt: null },
          data: { revokedAt: new Date() }
        });
      }
    } else {
      await prisma.refreshToken.updateMany({
        where: { userId: req.user.userId, revokedAt: null },
        data: { revokedAt: new Date() }
      });
    }

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/"
    });

    logger.info("User logged out", { userId: req.user.userId });

    return res.status(200).json({
      success: true,
      message: "Logout Successfully!"
    });

  } catch (error) {
    logger.error("logout controller error", { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error for Logout"
    });
  }
}

type LogoutResponse = ApiResponse<{
  message: string
}>;