/*
  Warnings:

  - You are about to alter the column `price` on the `pricingplan` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Double`.
  - You are about to alter the column `maxUsers` on the `pricingplan` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `maxBranches` on the `pricingplan` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `maxProducts` on the `pricingplan` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `pricingplan` ADD COLUMN `currency` VARCHAR(191) NOT NULL DEFAULT 'USD',
    ADD COLUMN `paymentFrequency` VARCHAR(191) NOT NULL DEFAULT 'monthly',
    MODIFY `price` DOUBLE NULL,
    MODIFY `maxUsers` INTEGER NULL,
    MODIFY `maxBranches` INTEGER NULL,
    MODIFY `maxProducts` INTEGER NULL;

-- AlterTable
ALTER TABLE `systemsettings` ADD COLUMN `loginBlockGraceDays` INTEGER NOT NULL DEFAULT 21,
    ADD COLUMN `readOnlyGraceDays` INTEGER NOT NULL DEFAULT 14;
