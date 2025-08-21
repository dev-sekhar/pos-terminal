import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// --- THIS IS THE FIX (Part 1) ---
// We only import the Prisma namespace. The `prisma generate` command ensures
// that the error types are correctly attached to this namespace.
// import { Prisma } from '@prisma/client/runtime/library';
import listEndpoints from 'express-list-endpoints';

// --- IMPORT ROUTE AND MIDDLEWARE HANDLERS ---
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
import dashboardRoutes from './routes/dashboard';
import settingsRoutes from './routes/settings';
import authMiddleware from './middleware/authMiddleware';
import tenantMiddleware from './middleware/tenantMiddleware';

// --- INITIALIZE APP ---
dotenv.config();
const app: Express = express();

// --- GLOBAL MIDDLEWARE ---
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost and lvh.me subdomains
    if (origin.match(/^http:\/\/(.*\.)?lvh\.me:8080$/) || 
        origin.match(/^http:\/\/localhost:(3000|8080)$/)) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[NODE RECEIVED]: ${req.method} ${req.originalUrl}`);
  next();
});

// --- PUBLIC ROUTES (No Auth Required) ---
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/register-tenant', registerTenantRoutes);

// --- PROTECTED ROUTES (Auth Required) ---
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
app.use('/api/dashboard', protectedMiddleware, dashboardRoutes);
app.use('/api/settings', protectedMiddleware, settingsRoutes);

// --- GLOBAL ERROR HANDLER (must be last) ---
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  // Simplified error checking that doesn't rely on Prisma types
  if (err?.code === 'P2002') {
    return res.status(409).json({ 
      message: 'A unique constraint would be violated.' 
    });
  }

  if (err?.name?.includes('Prisma')) {
    return res.status(500).json({ 
      message: 'Database error occurred.' 
    });
  }

  res.status(500).json({ message: 'Internal server error' });
});

// --- LIST ENDPOINTS & START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  try {
    console.log('--- Registered API Endpoints ---');
    console.table(listEndpoints(app));
    console.log('------------------------------');
  } catch (e) {
    console.log("Could not display endpoints.", e);
  }
});

export default app;