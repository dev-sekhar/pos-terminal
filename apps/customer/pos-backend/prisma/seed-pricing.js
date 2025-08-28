const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seedPricing() {
  const plans = [
    {
      name: "Free",
      price: "Free (first 3 months)",
      maxUsers: "1 User",
      maxBranches: "1 Branch",
      maxProducts: "10 Products",
      features: ["Basic Dashboard", "Sales Management", "Community Support"],
    },
    {
      name: "Basic",
      price: "$29/month",
      maxUsers: "5 Users",
      maxBranches: "5 Branches",
      maxProducts: "50 Products",
      features: [
        "Basic Dashboard",
        "Sales Management",
        "Inventory Tracking",
        "Email Support",
      ],
    },
    {
      name: "Premium",
      price: "$79/month",
      maxUsers: "15 Users",
      maxBranches: "20 Branches",
      maxProducts: "200 Products",
      features: [
        "Advanced Dashboard",
        "Multi-branch Management",
        "Advanced Reports",
        "Priority Support",
      ],
    },
    {
      name: "Enterprise",
      price: "Contact Us",
      maxUsers: "Unlimited",
      maxBranches: "Unlimited",
      maxProducts: "Unlimited",
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
