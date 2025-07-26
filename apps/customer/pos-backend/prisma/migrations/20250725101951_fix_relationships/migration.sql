/*
  Warnings:

  - You are about to drop the column `tenantId` on the `supplier` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `supplier` DROP FOREIGN KEY `Supplier_createdById_fkey`;

-- DropForeignKey
ALTER TABLE `supplier` DROP FOREIGN KEY `Supplier_tenantId_fkey`;

-- DropIndex
DROP INDEX `Supplier_createdById_fkey` ON `supplier`;

-- DropIndex
DROP INDEX `Supplier_tenantId_idx` ON `supplier`;

-- DropIndex
DROP INDEX `Supplier_tenantId_name_key` ON `supplier`;

-- AlterTable
ALTER TABLE `supplier` DROP COLUMN `tenantId`,
    MODIFY `createdById` INTEGER NULL;

-- CreateTable
CREATE TABLE `TenantsOnSuppliers` (
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `assignedBy` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `supplierId` INTEGER NOT NULL,

    PRIMARY KEY (`tenantId`, `supplierId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Supplier_name_key` ON `Supplier`(`name`);

-- AddForeignKey
ALTER TABLE `Supplier` ADD CONSTRAINT `Supplier_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TenantsOnSuppliers` ADD CONSTRAINT `TenantsOnSuppliers_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `Tenant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TenantsOnSuppliers` ADD CONSTRAINT `TenantsOnSuppliers_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
