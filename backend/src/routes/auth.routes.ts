import { currentUser } from "@/controller/auth/currentUser";
import { logout } from "@/controller/auth/logout";
import { logoutAll } from "@/controller/auth/logoutAll";
import { refreshToken } from "@/controller/auth/refreshToken";
import { sendOtp } from "@/controller/auth/sendOtp";
import { updateProfile } from "@/controller/auth/updateProfile";
import { verifyOtp } from "@/controller/auth/verifyOtp";
import { apiValidator } from "@/middlewares/apiValidator";
import { authenticate } from "@/middlewares/authenticate";
import { authRateLimiter, otpRateLimiter } from "@/middlewares/rateLimiter";
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
  refreshToken
)


// Protected routes

authRoutes.post('/logout',
  authRateLimiter,
  authenticate,
  logout
)

authRoutes.post('/logout-all',
  authRateLimiter,
  authenticate,
  logoutAll
)

authRoutes.patch('/profile',
  authenticate,
  updateProfile
)

authRoutes.get('/me',
  authenticate,
  currentUser
)

export default authRoutes