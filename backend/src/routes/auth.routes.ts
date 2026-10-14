import { logout } from "@/controller/auth/logout";
import { logoutAll } from "@/controller/auth/logoutAll";
import { refreshToken } from "@/controller/auth/refreshToken";
import { sendOtp } from "@/controller/auth/sendOtp";
import { verifyOtp } from "@/controller/auth/verifyOtp";
import { apiValidator } from "@/middlewares/apiValidator";
import { authenticate } from "@/middlewares/authenticate";
import { authRateLimiter, otpRateLimiter } from "@/middlewares/rateLimiter";
import authController from "@/modules/auth/auth.controller";
import { validator } from "@/validators";
import { Router } from "express";

const authRoutes = Router()

// Public

authRoutes.post('/send-otp',
  otpRateLimiter,
  apiValidator(validator.sentOtpSchema),
  sendOtp
)

authRoutes.post('/verify-otp',
  authRateLimiter,
  apiValidator(validator.verifyOtpSchema),
  verifyOtp
)

authRoutes.post('/refresh',
  authRateLimiter,
  apiValidator(validator.refreshTokenSchema),
  refreshToken
)

authRoutes.post('/logout',
  authRateLimiter,
  authenticate,
  logout
)

// Protected routes

authRoutes.post('/logout-all',
  authenticate,
  logoutAll
)

authRoutes.patch('/profile',
  authenticate,
  authController.updateProfile.bind(authController)
)

authRoutes.get('/me',
  authenticate,
  authController.me.bind(authController)
)

export default authRoutes