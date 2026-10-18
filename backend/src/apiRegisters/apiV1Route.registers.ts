import { authenticate } from '@/middlewares/authenticate';
import { authorize } from '@/middlewares/authorize';
import authRoutes from '@/routes/auth.routes';
import productRoutes from '@/routes/product.routes';
import { Express } from 'express'

export function apiV1Register(app: Express) {

  app.use('/api/v1/freshcart/auth', authRoutes)
  app.use('/api/v1/freshcart/products', productRoutes)

  app.use("/api/v1/freshcart/address/*", authenticate, authorize("CUSTOMER", "ADMIN"))
}