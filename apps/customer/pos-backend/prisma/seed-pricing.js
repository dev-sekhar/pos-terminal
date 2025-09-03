const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedPricing() {
  const plans = [
    {
      name: "Free",
      price: 0,
      currency: "USD",
      paymentFrequency: "monthly",
      maxUsers: 1,
      maxBranches: 1,
      maxProducts: 10,
      features: ["Basic Dashboard", "Sales Management", "Community Support"],
    },
    {
      name: "Basic",
      price: 29,
      currency: "USD",
      paymentFrequency: "monthly",
      maxUsers: 5,
      maxBranches: 5,
      maxProducts: 50,
      features: [
        "Basic Dashboard",
        "Sales Management",
        "Inventory Tracking",
        "Email Support",
      ],
    },
    {
      name: "Premium",
      price: 79,
      currency: "USD",
      paymentFrequency: "monthly",
      maxUsers: 15,
      maxBranches: 20,
      maxProducts: 200,
      features: [
        "Advanced Dashboard",
        "Multi-branch Management",
        "Advanced Reports",
        "Priority Support",
      ],
    },
    {
      name: "Enterprise",
      price: null,
      currency: "USD",
      paymentFrequency: "monthly",
      maxUsers: null,
      maxBranches: null,
      maxProducts: null,
      features: [
        "Custom Features",
        "Dedicated Support",
        "API Access",
        "Custom Integrations",
      ],
    },
  ];

  for (const plan of plans) {
    await prisma.pricingPlan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
  }

  console.log("Pricing plans seeded successfully");
}

seedPricing()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
