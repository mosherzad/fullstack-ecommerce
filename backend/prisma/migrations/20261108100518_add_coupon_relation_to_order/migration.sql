/*
  Warnings:

  - Added the required column `subtotal` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "couponId" TEXT,
ADD COLUMN     "discountAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "subtotal" DECIMAL(65,30) NOT NULL;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
