import { prisma } from '@/config/prisma';
import { AuthRequest } from '@/middlewares/authenticate';
import { ApiResponse } from '@/types/ApiRespnse';
import { logger } from '@/utils/logger';
import { Response } from 'express'


export async function updateProfile(req: AuthRequest, res: Response<UpdateProfileResponse>) {
  try {
    const { name, phone } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { name, phone },
      select: { id: true, email: true, name: true, phone: true, role: true }
    })

    logger.info("Profile updated", { userId: user.id, email: user.email })

    return res.status(201).json({
      success: true,
      message: "Profile updated successfully!",
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role
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
    id: string,
    email: string,
    name: string | null,
    phone: string | null,
    role: string
  }
}>