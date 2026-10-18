import { prisma } from "@/config/prisma";

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

export class AddressRepository {
  async create(data: CreateAddressInput) {
    const count = await prisma.address.count({ where: { userId: data.userId } });
    const isDefault = count === 0 ? true : (data.isDefault ?? false);
    return prisma.address.create({ data: { ...data, isDefault } })
  }

  findByUser(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
    })
  }

  findById(id: string) {
    return prisma.address.findUnique({ where: { id } })
  }

  update(id: string, data: UpdateAddressInput) {
    return prisma.address.update({ where: { id }, data })
  }

  delete(id: string) {
    return prisma.address.delete({ where: { id } })
  }

  setDefault(id: string, userId: string) {
    return prisma.$transaction([
      prisma.address.updateMany({
        where: { userId },
        data: { isDefault: true }
      }),
      prisma.address.update({
        where: { id },
        data: { isDefault: true }
      })
    ])
  }

}

export default new AddressRepository;