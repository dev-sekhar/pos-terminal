// apps/customer/pos-backend/src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';

// This creates a single, shared instance of the Prisma client for your entire application.
const prisma = new PrismaClient();

export default prisma;