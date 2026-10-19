import { authenticate } from '@/middlewares/authenticate';
import { authorize } from '@/middlewares/authorize';
import addressRoutes from '@/routes/address.routes';
import authRoutes from '@/routes/auth.routes';
import orderRoutes from '@/routes/order.routes';
import productRoutes from '@/routes/product.routes';
import { Express } from 'express'

export function apiV1Register(app: Express) {

  app.use('/api/v1/freshcart/auth', authRoutes)
  app.use('/api/v1/freshcart/products', productRoutes)

  app.use("/api/v1/freshcart/address", authenticate, authorize("CUSTOMER", "ADMIN"), addressRoutes)
  app.use("/api/v1/freshcart/orders", authenticate, orderRoutes)
}