import { PrismaClient } from '@prisma/client';

// This is the official Prisma singleton pattern.
// It prevents multiple instances of Prisma Client from being created in development
// due to hot-reloading, which is the likely cause of your "did not initialize" error.

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    // Optional: add logging to see database queries in your terminal
    log: ['query', 'info', 'warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;