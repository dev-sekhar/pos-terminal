import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { Prisma, PrismaClient } from '@prisma/client';
import listEndpoints from 'express-list-endpoints'; // Keep this for now

// --- IMPORT YOUR ROUTE AND MIDDLEWARE HANDLERS ---
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
import authMiddleware from './middleware/authMiddleware';
import tenantMiddleware from './middleware/tenantMiddleware';
import dashboardRoutes from './routes/dashboard';

// --- INITIALIZE APP ---
dotenv.config();
const app: Express = express();
const prisma = new PrismaClient();

// --- GLOBAL MIDDLEWARE (WITHOUT AUTH) ---
app.use(helmet());
app.use(cors());
app.use(express.json());

// --- START: ULTIMATE REQUEST LOGGER ---
// This will log every single request that hits the Node.js server.
app.use('*', (req, res, next) => {
  console.log(`[NODE RECEIVED]: ${req.method} ${req.originalUrl}`);
  next();
});
// --- END: ULTIMATE REQUEST LOGGER ---

// --- PUBLIC ROUTES ---
// These are registered BEFORE any auth middleware is applied.
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes); // LOGIN ROUTE IS HERE
app.use('/api/register-tenant', registerTenantRoutes);


// --- PROTECTED ROUTES ---
// The auth and tenant middleware are combined and applied ONLY to the routes below.
const protectedMiddleware = [authMiddleware, tenantMiddleware];

app.use('/api/users', protectedMiddleware, userRoutes);
app.use('/api/branches', protectedMiddleware, branchRoutes);
app.use('/api/products', protectedMiddleware, productRoutes);
app.use('/api/categories', protectedMiddleware, categoryRoutes);
app.use('/api/inventory', protectedMiddleware, inventoryRoutes);
app.use('/api/sales', protectedMiddleware, salesRoutes);
app.use('/api/suppliers', protectedMiddleware, supplierRoutes);
app.use('/api/purchases', protectedMiddleware, purchaseRoutes);
app.use('/api/tenants', protectedMiddleware, tenantsRoutes);
app.use('/api/dashboard', protectedMiddleware, dashboardRoutes); // <-- ADD THIS LINE



// --- GLOBAL ERROR HANDLER (must be last) ---
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("[ERROR HANDLER]", err); // Add logging here
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    let message = 'A database error occurred.';
    if (err.code === 'P2002') message = 'A record with this unique value already exists.';
    if (err.code === 'P2025') message = 'Record not found.';
    return res.status(400).json({ message });
  }
  res.status(500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// --- LIST ENDPOINTS & START SERVER ---
console.log('--- Registered API Endpoints ---');
console.log(listEndpoints(app));
console.log('------------------------------');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;