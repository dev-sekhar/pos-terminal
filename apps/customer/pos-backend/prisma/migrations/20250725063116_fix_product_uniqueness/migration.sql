/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,code]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Product_code_key` ON `product`;

-- CreateIndex
CREATE UNIQUE INDEX `Product_tenantId_code_key` ON `Product`(`tenantId`, `code`);
