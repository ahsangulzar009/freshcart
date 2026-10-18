import { logger } from "@/utils/logger";
import addressRepository from "./address.repository";

interface CreateAddressInput {
  userId: string;
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

interface UpdateAddressInput {
  label?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
}

export class AddressService {
  async createAddress(data: CreateAddressInput) {
    const address = await addressRepository.create(data);
    logger.info("Address Created", { addressId: address.id, userId: address.userId })
    return address
  }

  async getUserAddresses(userId: string) {
    return await addressRepository.findByUser(userId)
  }

  async getAddressById(id: string, userId: string) {
    const address = await addressRepository.findById(id);

    if (!address) {
      throw new Error("Address is not found")
    }

    if (address.userId !== userId) {
      throw new Error("Forbidden")
    }

    return address
  }

  async updateAddress(id: string, userId: string, data: UpdateAddressInput) {
    const address = await addressRepository.findById(id);

    if (!address) {
      throw new Error("Address is not found")
    }

    if (address.userId !== userId) {
      throw new Error("Forbidden")
    };

    const updated = await addressRepository.update(id, data);
    logger.info("Address updated", { addressId: address.id, userId })

    return updated
  }

  async deleteAddress(id: string, userId: string) {
    const address = await addressRepository.findById(id);

    if (!address) {
      throw new Error("Address is not found")
    }

    if (address.userId !== userId) {
      throw new Error("Forbidden")
    };

    await addressRepository.delete(id)

    logger.info("Address deleted", { addressId: id, userId })
    return { message: "Address deleted successfully!" }
  }

  async setDefaultAddress(id: string, userId: string) {
    const address = await addressRepository.findById(id);

    if (!address) {
      throw new Error("Address is not found")
    }

    if (address.userId !== userId) {
      throw new Error("Forbidden")
    };

    await addressRepository.setDefault(id, userId)
    logger.info("Default address set", { addressId: id, userId })
    return { message: "Default address updated" }
  }

}

export default new AddressService