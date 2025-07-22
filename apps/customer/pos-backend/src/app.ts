import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import branchRoutes from './routes/branches';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import inventoryRoutes from './routes/inventory';
import salesRoutes from './routes/sales';
import supplierRoutes from './routes/suppliers';
import purchaseRoutes from './routes/purchases';
import tenantsRoutes from './routes/tenants';
import registerTenantRoutes from './routes/registerTenant';
import { Prisma } from '@prisma/client';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();
const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Handle JSON parse errors
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }
  next(err);
});

// Global error handler (should be last)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    let message = 'A database error occurred.';
    if (err.code === 'P2003') {
      message = 'Foreign key constraint failed. Please check related IDs (e.g., tenant, category, user).';
    } else if (err.code === 'P2002') {
      message = 'A record with this unique value already exists.';
    } else if (err.code === 'P2025') {
      message = 'Record not found.';
    }
    return res.status(400).json({ message });
  }
  // Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({ message: 'Invalid data provided. Please check your request.' });
  }
  // Syntax errors (e.g., JSON)
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }
  // Fallback
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Process-level error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Optionally: process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  // Optionally: process.exit(1);
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/tenants', tenantsRoutes);
app.use('/api/register-tenant', registerTenantRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing HTTP server and Prisma Client...');
  await prisma.$disconnect();
  process.exit(0);
});

export default app; 