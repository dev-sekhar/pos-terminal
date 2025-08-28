import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const prisma = new PrismaClient();
const PORT = 5002;
const JWT_SECRET = process.env.JWT_SECRET || 'admin-secret-key';

app.use(cors());
app.use(express.json());

// Employee login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find employee in the database
    const employee = await prisma.employee.findFirst({
      where: { 
        email,
        active: true
      }
    });

    if (!employee) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, employee.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        employeeId: employee.id,
        email: employee.email,
        role: employee.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: employee.id,
        email: employee.email,
        name: employee.name,
        role: employee.role,
        isSystemAdmin: true
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Protected route to get employee profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: req.user.employeeId }
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      id: employee.id,
      email: employee.email,
      name: employee.name,
      role: employee.role,
      isSystemAdmin: true
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Toggle tenant status
app.patch('/api/tenants/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const tenant = await prisma.tenant.findUnique({
      where: { id }
    });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: { active: !tenant.active }
    });

    res.json(updatedTenant);
  } catch (error) {
    console.error('Toggle tenant error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get tenant billing information
app.get('/api/tenants/:id/billing', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [tenant, invoices] = await Promise.all([
      prisma.tenant.findUnique({
        where: { id },
        include: { pricingPlan: true }
      }),
      prisma.invoice.findMany({
        where: { tenantId: id },
        include: {
          payments: true
        },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const totalDue = invoices
      .filter(inv => inv.status === 'PENDING' || inv.status === 'OVERDUE')
      .reduce((sum, inv) => {
        const paid = inv.payments.reduce((pSum, payment) => pSum + payment.amount, 0);
        return sum + (inv.amount - paid);
      }, 0);

    res.json({
      tenant,
      invoices,
      totalDue
    });
  } catch (error) {
    console.error('Billing fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all tenants
app.get('/api/tenants', authenticateToken, async (req, res) => {
  try {
    const tenants = await prisma.tenant.findMany({
      where: {
        deleted: false
      },
      include: {
        pricingPlan: true,
        _count: {
          select: {
            users: { where: { deleted: false } },
            branches: { where: { deleted: false } },
            products: { where: { deleted: false } }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(tenants);
  } catch (error) {
    console.error('Tenants fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// System settings endpoints
app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    let settings = await prisma.systemSettings.findFirst();
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: { paymentGraceDays: 7 }
      });
    }
    res.json(settings);
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.patch('/api/settings', authenticateToken, async (req, res) => {
  try {
    const { paymentGraceDays } = req.body;
    
    let settings = await prisma.systemSettings.findFirst();
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: { paymentGraceDays }
      });
    } else {
      settings = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: { paymentGraceDays }
      });
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Admin backend running on port ${PORT}`);
});