import { prisma } from '@/config/prisma';
import { AuthRequest } from '@/middlewares/authenticate';
import { ApiResponse } from '@/types/ApiRespnse';
import { logger } from '@/utils/logger';
import { Response } from 'express';

export async function currentUser(req: AuthRequest, res: Response<CurrentUserResponse>) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated"
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    logger.error("currentUser controller error", { error: (error as Error).message });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error for fetching current user"
    });
  }
}

type CurrentUserResponse = ApiResponse<{
  data: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    role: string;
  }
}>;