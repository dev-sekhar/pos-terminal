import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSystemSettings() {
  try {
    const existingSettings = await prisma.systemSettings.findFirst();
    
    if (!existingSettings) {
      await prisma.systemSettings.create({
        data: {
          paymentGraceDays: 7,
          readOnlyGraceDays: 14,
          loginBlockGraceDays: 21
        }
      });
      console.log('✅ System settings seeded successfully');
    } else {
      console.log('ℹ️ System settings already exist');
    }
  } catch (error) {
    console.error('❌ Error seeding system settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSystemSettings();