const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding default units, payment types, and currencies...');

  // Seed Units
  const units = [
    { name: 'pcs' },
    { name: 'kg' },
    { name: 'ltr' },
    { name: 'box' },
    { name: 'pack' },
    { name: 'meter' },
    { name: 'gram' },
    { name: 'dozen' },
    { name: 'bottle' },
    { name: 'can' }
  ];

  for (const unit of units) {
    await prisma.unit.upsert({
      where: { name: unit.name },
      update: {},
      create: unit
    });
  }

  // Seed Payment Types
  const paymentTypes = [
    { name: 'Cash' },
    { name: 'Card' },
    { name: 'UPI' },
    { name: 'Bank Transfer' },
    { name: 'Credit' },
    { name: 'Cheque' },
    { name: 'Digital Wallet' }
  ];

  for (const paymentType of paymentTypes) {
    await prisma.paymentType.upsert({
      where: { name: paymentType.name },
      update: {},
      create: paymentType
    });
  }

  // Seed Currencies
  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' }
  ];

  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { code: currency.code },
      update: {},
      create: currency
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });