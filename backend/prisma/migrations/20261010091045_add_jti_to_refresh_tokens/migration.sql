/*
  Warnings:

  - A unique constraint covering the columns `[jti]` on the table `RefreshTokens` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "RefreshTokens" ADD COLUMN     "jti" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "RefreshTokens_jti_key" ON "RefreshTokens"("jti");
