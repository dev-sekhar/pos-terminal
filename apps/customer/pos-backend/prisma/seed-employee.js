const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seedEmployee() {
  const hashedPassword = await bcrypt.hash("admin123", 10); // Hash a default password

  await prisma.employee.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: hashedPassword,
      name: "Admin User",
      role: "ADMIN",
    },
  });

  console.log("Employee seeded successfully");
}

seedEmployee()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
