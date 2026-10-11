import express from 'express'
import helmet from 'helmet';
import cors from 'cors'
import { rateLimit } from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { apiV1Register } from './apiRegisters/apiV1Route.registers';
import { logger } from './utils/logger';
import { errorHandler } from './middlewares/errorHandler';

const app = express()

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
)

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
)

const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, Please try again later."
  }
})

app.use(globalRateLimiter)

app.use(compression())
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

app.use('/uploads', express.static(path.join(__dirname, '..', "uploads")))

apiV1Register(app)

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" })
})

app.use(errorHandler)

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
})

export default app;