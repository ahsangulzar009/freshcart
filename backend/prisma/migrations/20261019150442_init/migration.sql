-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_deliveryPartnerId_fkey";

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "deliveryPartnerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_deliveryPartnerId_fkey" FOREIGN KEY ("deliveryPartnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
