import { apiValidator } from "@/middlewares/apiValidator";
import addressController from "@/modules/address/address.controller";
import { validator } from "@/validators";
import { Router } from "express";

const addressRoutes = Router()

addressRoutes.get("/", addressController.getUserAddress.bind(addressController))

addressRoutes.post("/", apiValidator(validator.createAddressSchema), addressController.createAddress.bind(addressController))

addressRoutes.get("/:id", addressController.getAddressById.bind(addressController))

addressRoutes.put("/:id", apiValidator(validator.updateAddressSchema), addressController.updateAddress.bind(addressController))

addressRoutes.delete("/:id", addressController.deleteAddress.bind(addressController))

addressRoutes.patch("/:id/default", addressController.setDefaultAddress.bind(addressController))