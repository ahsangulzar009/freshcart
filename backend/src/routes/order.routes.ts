import { apiValidator } from "@/middlewares/apiValidator";
import { authenticate } from "@/middlewares/authenticate";
import { authorize } from "@/middlewares/authorize";
import orderController from "@/modules/order/order.controller";
import { validator } from "@/validators";
import { Router } from "express";

const orderRoutes = Router()

orderRoutes.post("/",
  authorize("CUSTOMER"),
  apiValidator(validator.placeOrderSchema),
  orderController.placeOrder.bind(orderController)
)

orderRoutes.get("/my",
  authorize("CUSTOMER"),
  orderController.getMyOrders.bind(orderController)
)

orderRoutes.get("/",
  authorize("ADMIN"),
  orderController.getAllOrders.bind(orderController)
)

export default orderRoutes