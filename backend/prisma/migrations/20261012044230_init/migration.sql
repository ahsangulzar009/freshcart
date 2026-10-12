/*
  Warnings:

  - You are about to drop the column `paymentMathod` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "orders" DROP COLUMN "paymentMathod",
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'COD';
