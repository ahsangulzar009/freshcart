import { ApiResponse } from '@/utils/ApiResponse';
import { Request, Response } from 'express'
import { rateLimit, ipKeyGenerator } from 'express-rate-limit'

export const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    ApiResponse(res, false, "Too many OTP requests. Please wait for 15 minutes", 429)
  },
  keyGenerator: (req: Request) => {
    const email = req.body?.email;
    if (email && typeof email === "string") return `email:${email.trim().toLowerCase()}`
    return `ip:${ipKeyGenerator(req.ip ?? "unknown")}`;
  }
})

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    ApiResponse(res, false, "Too many auth requests. Please try again later", 429)
  },
})

export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    ApiResponse(res, false, "Too many upload requests. Please slow down", 429)
  },
})