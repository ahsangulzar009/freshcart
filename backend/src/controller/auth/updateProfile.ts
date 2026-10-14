import { prisma } from '@/config/prisma';
import { AuthRequest } from '@/middlewares/authenticate';
import { ApiResponse } from '@/types/ApiRespnse';
import { logger } from '@/utils/logger';
import { Response } from 'express'


export async function updateProfile(req: AuthRequest, res: Response<UpdateProfileResponse>) {
  try {

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    };

    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name or phone is required for updation"
      })
    }
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { name, phone },
      select: { id: true, email: true, name: true, phone: true }
    })

    logger.info("Profile updated", { userId: user.id, email: user.email, name: user.name, phone: user.phone })

    return res.status(201).json({
      success: true,
      message: "Profile updated successfully!",
      data: {
        name: user.name,
        phone: user.phone,
      }
    })

  } catch (error) {
    logger.error("updateProfile controller error", { error: (error as Error).message })
    return res.status(500).json({
      success: false,
      message: "Internal Server Error for updating profile"
    })
  }
}

type UpdateProfileResponse = ApiResponse<{
  message: string,
  data: {
    name: string | null,
    phone: string | null,
  }
}>