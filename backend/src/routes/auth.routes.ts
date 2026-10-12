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
  authController.sendOtp.bind(authController)
)

authRoutes.post('/verify-otp',
  authRateLimiter,
  apiValidator(validator.verifyOtpSchema),
  authController.verifyOtp.bind(authController)
)

authRoutes.post('/refresh',
  authRateLimiter,
  apiValidator(validator.refreshTokenSchema),
  authController.refreshToken.bind(authController)
)

authRoutes.post('/logout',
  authRateLimiter,
  apiValidator(validator.logoutSchema),
  authController.logout.bind(authController)
)

// Protected routes

authRoutes.post('/logout-all',
  authenticate,
  authController.logoutAll.bind(authController)
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