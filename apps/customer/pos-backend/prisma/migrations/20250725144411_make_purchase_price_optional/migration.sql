-- AlterTable
ALTER TABLE `purchase` MODIFY `total` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `purchaseitem` MODIFY `price` DOUBLE NULL DEFAULT 0;
