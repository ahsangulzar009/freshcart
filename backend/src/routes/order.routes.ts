import { createOrder } from "@/controller/order/createOrder";
import { getAllOrders } from "@/controller/order/getAllOrders";
import { getMyOrders } from "@/controller/order/getMyOrders";
import { getOrderById } from "@/controller/order/getOrderById";
import { apiValidator } from "@/middlewares/apiValidator";
import { authorize } from "@/middlewares/authorize";
import { validator } from "@/validators";
import { Router } from "express";

const orderRoutes = Router()

orderRoutes.post("/",
  authorize("CUSTOMER"),
  apiValidator(validator.placeOrderSchema),
  createOrder
)

orderRoutes.get("/my",
  authorize("CUSTOMER", "DELIVERY_PARTNER"),
  getMyOrders
)

orderRoutes.get("/",
  authorize("ADMIN"),
  getAllOrders
)

orderRoutes.get('/:id',
  authorize("CUSTOMER", "ADMIN"),
  getOrderById
)

export default orderRoutes