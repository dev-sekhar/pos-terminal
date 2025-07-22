-- DropForeignKey
ALTER TABLE `branch` DROP FOREIGN KEY `Branch_createdById_fkey`;

-- DropIndex
DROP INDEX `Branch_createdById_fkey` ON `branch`;

-- AlterTable
ALTER TABLE `branch` MODIFY `createdById` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Branch` ADD CONSTRAINT `Branch_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
