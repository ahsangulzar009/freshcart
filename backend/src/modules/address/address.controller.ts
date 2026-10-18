import { AuthRequest } from "@/middlewares/authenticate";
import { Response } from "express"
import addressService from "./address.service";
import { logger } from "@/utils/logger";
import { ApiResponse } from "@/utils/ApiResponse";

export class AddressController {
  async createAddress(req: AuthRequest, res: Response) {
    try {

      const address = await addressService.createAddress({
        userId: req.user!.userId,
        ...req.body
      });
      ApiResponse(res, true, "Address Created", 201, address)
    } catch (error) {
      logger.error("createAddress controller error", { error: (error as Error).message });
      ApiResponse(res, false, (error as Error).message, 500)
    }
  }

  async getUserAddress(req: AuthRequest, res: Response) {
    try {
      const addresses = await addressService.getUserAddresses(req.user!.userId);
      ApiResponse(res, true, "Addresses fetched", 200, addresses)
    } catch (error) {
      logger.error("getUserAddress controller error", { error: (error as Error).message });
      ApiResponse(res, false, (error as Error).message, 500)
    }
  }

  async getAddressById(req: AuthRequest, res: Response) {
    try {
      const address = await addressService.getAddressById(String(req.params.id), req.user!.userId)
      ApiResponse(res, true, "Address fetched", 200, address)
    } catch (error) {
      logger.error("getAddressById controller error", { error: (error as Error).message });
      ApiResponse(res, false, (error as Error).message, 500)
    }
  }

  async updateAddress(req: AuthRequest, res: Response) {
    try {
      const address = await addressService.updateAddress(String(req.params.id), req.user!.userId, req.body)
      ApiResponse(res, true, "Address updted successfully", 200, address)
    } catch (error) {
      logger.error("updateAddress controller error", { error: (error as Error).message });
      ApiResponse(res, false, (error as Error).message, 500)
    }
  }

  async deleteAddress(req: AuthRequest, res: Response) {
    try {
      const result = await addressService.deleteAddress(String(req.params.id), req.user!.userId)
      ApiResponse(res, true, result.message, 200)
    } catch (error) {
      logger.error("deleteAddress controller error", { error: (error as Error).message });
      ApiResponse(res, false, (error as Error).message, 500)
    }
  }

  async setDefaultAddress(req: AuthRequest, res: Response) {
    try {
      const result = await addressService.setDefaultAddress(String(req.params.id), req.user!.userId);
      ApiResponse(res, true, result.message, 201)
    } catch (error) {
      logger.error("setDefaultAddress controller error", { error: (error as Error).message });
      ApiResponse(res, false, (error as Error).message, 500)
    }
  }

}

export default new AddressController