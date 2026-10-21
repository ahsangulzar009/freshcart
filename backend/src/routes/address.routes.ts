import { createAddress } from "@/controller/address/createAddress";
import { deleteAddresses } from "@/controller/address/deleteAddress";
import { getAddressById } from "@/controller/address/getAddressById";
import { getUserAddresses } from "@/controller/address/getUserAddresses";
import { setDefaultAddress } from "@/controller/address/setDefaultAddress";
import { updateAddress } from "@/controller/address/updateAddress";
import { apiValidator } from "@/middlewares/apiValidator";
import { validator } from "@/validators";
import { Router } from "express";

const addressRoutes = Router()

addressRoutes.get("/", getUserAddresses)

addressRoutes.post("/",
  apiValidator(validator.createAddressSchema),
  createAddress
)

addressRoutes.get("/:id", getAddressById)

addressRoutes.put("/:id",
  apiValidator(validator.updateAddressSchema),
  updateAddress
)

addressRoutes.delete("/", deleteAddresses)

addressRoutes.patch("/:id/default", setDefaultAddress)

export default addressRoutes