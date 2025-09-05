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

    // Set plan start date when activating tenant if not set
    const updateData = { active: !tenant.active };
    if (!tenant.active && !tenant.currentPlanStartDate) {
      updateData.currentPlanStartDate = new Date();
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: updateData
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
        include: { 
          pricingPlan: true,
          nextPlan: true
        }
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
        data: { 
          paymentGraceDays: 7,
          readOnlyGraceDays: 14,
          loginBlockGraceDays: 21
        }
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
    const { paymentGraceDays, readOnlyGraceDays, loginBlockGraceDays } = req.body;
    
    let settings = await prisma.systemSettings.findFirst();
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: { paymentGraceDays, readOnlyGraceDays, loginBlockGraceDays }
      });
    } else {
      settings = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: { paymentGraceDays, readOnlyGraceDays, loginBlockGraceDays }
      });
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Currencies endpoints
app.get('/api/currencies', authenticateToken, async (req, res) => {
  try {
    const currencies = await prisma.currency.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    });
    res.json(currencies);
  } catch (error) {
    console.error('Error fetching currencies:', error);
    res.status(500).json({ message: 'Failed to fetch currencies' });
  }
});

app.post('/api/currencies', authenticateToken, async (req, res) => {
  try {
    const { code, name, symbol } = req.body;
    const currency = await prisma.currency.create({
      data: { code, name, symbol }
    });
    res.json(currency);
  } catch (error) {
    console.error('Error creating currency:', error);
    res.status(500).json({ message: 'Failed to create currency' });
  }
});

// Units endpoints
app.get('/api/units', authenticateToken, async (req, res) => {
  try {
    const units = await prisma.unit.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    });
    res.json(units);
  } catch (error) {
    console.error('Error fetching units:', error);
    res.status(500).json({ message: 'Failed to fetch units' });
  }
});

app.post('/api/units', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const unit = await prisma.unit.create({
      data: { name }
    });
    res.json(unit);
  } catch (error) {
    console.error('Error creating unit:', error);
    res.status(500).json({ message: 'Failed to create unit' });
  }
});

app.put('/api/units/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, active } = req.body;
    const updatedUnit = await prisma.unit.update({
      where: { id: parseInt(id) },
      data: { name, active }
    });
    res.json(updatedUnit);
  } catch (error) {
    console.error('Error updating unit:', error);
    res.status(500).json({ message: 'Failed to update unit' });
  }
});

app.delete('/api/units/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.unit.update({ where: { id: parseInt(id) }, data: { active: false } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting unit:', error);
    res.status(500).json({ message: 'Failed to delete unit' });
  }
});

// Payment Types endpoints
app.get('/api/payment-types', authenticateToken, async (req, res) => {
  try {
    const paymentTypes = await prisma.paymentType.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    });
    res.json(paymentTypes);
  } catch (error) {
    console.error('Error fetching payment types:', error);
    res.status(500).json({ message: 'Failed to fetch payment types' });
  }
});

app.post('/api/payment-types', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const paymentType = await prisma.paymentType.create({
      data: { name }
    });
    res.json(paymentType);
  } catch (error) {
    console.error('Error creating payment type:', error);
    res.status(500).json({ message: 'Failed to create payment type' });
  }
});

app.put('/api/payment-types/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, active } = req.body;
    const updatedPaymentType = await prisma.paymentType.update({
      where: { id: parseInt(id) },
      data: { name, active }
    });
    res.json(updatedPaymentType);
  } catch (error) {
    console.error('Error updating payment type:', error);
    res.status(500).json({ message: 'Failed to update payment type' });
  }
});

app.delete('/api/payment-types/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.paymentType.update({ where: { id: parseInt(id) }, data: { active: false } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting payment type:', error);
    res.status(500).json({ message: 'Failed to delete payment type' });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Admin backend running on port ${PORT}`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  server.close(() => {
    process.exit(1);
  });
});

// Employee CRUD endpoints
app.get('/api/employees', authenticateToken, async (req, res) => {
  try {
    const { showDeleted } = req.query; // Get the query parameter

    const whereClause = showDeleted === 'true' ? {} : { deleted: false }; // Conditionally set where clause

    const employees = await prisma.employee.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Failed to fetch employees' });
  }
});

app.post('/api/employees', authenticateToken, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newEmployee = await prisma.employee.create({
      data: { name, email, password: hashedPassword, role, active: true }
    });
    res.status(201).json(newEmployee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Failed to create employee' });
  }
});

app.put('/api/employees/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, active } = req.body;
    const updatedEmployee = await prisma.employee.update({
      where: { id: parseInt(id) },
      data: { name, email, role, active }
    });
    res.json(updatedEmployee);
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Failed to update employee' });
  }
});

app.delete('/api/employees/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.employee.update({ where: { id: parseInt(id) }, data: { deleted: true } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Failed to delete employee' });
  }
});

// Pricing plans endpoints
app.get('/api/pricing-plans', authenticateToken, async (req, res) => {
  try {
    const plans = await prisma.pricingPlan.findMany({
      where: { active: true },
      orderBy: { id: 'asc' }
    });
    res.json(plans);
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    res.status(500).json({ message: 'Failed to fetch pricing plans' });
  }
});

// Get outstanding invoices by year
app.get('/api/invoices/outstanding', authenticateToken, async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    const invoices = await prisma.invoice.findMany({
      where: {
        status: { in: ['PENDING', 'OVERDUE'] },
        createdAt: { gte: startDate, lte: endDate }
      },
      include: {
        tenant: true,
        pricingPlan: true,
        payments: true
      },
      orderBy: { dueDate: 'asc' }
    });
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching outstanding invoices:', error);
    res.status(500).json({ message: 'Failed to fetch outstanding invoices' });
  }
});

// Get paid payments by year
app.get('/api/payments/paid', authenticateToken, async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    const payments = await prisma.payment.findMany({
      where: {
        paymentDate: { gte: startDate, lte: endDate }
      },
      include: {
        invoice: {
          include: {
            tenant: true,
            pricingPlan: true
          }
        }
      },
      orderBy: { paymentDate: 'desc' }
    });
    res.json(payments);
  } catch (error) {
    console.error('Error fetching paid payments:', error);
    res.status(500).json({ message: 'Failed to fetch paid payments' });
  }
});

app.patch('/api/pricing-plans/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, currency, maxUsers, maxBranches, maxProducts } = req.body;
    
    const updatedPlan = await prisma.pricingPlan.update({
      where: { id: parseInt(id) },
      data: {
        name,
        price: price === '' ? null : price,
        currency,
        maxUsers: maxUsers === '' ? null : maxUsers,
        maxBranches: maxBranches === '' ? null : maxBranches,
        maxProducts: maxProducts === '' ? null : maxProducts
      }
    });
    
    res.json(updatedPlan);
  } catch (error) {
    console.error('Error updating pricing plan:', error);
    res.status(500).json({ message: 'Failed to update pricing plan' });
  }
});

// Update tenant pricing plan
app.patch('/api/tenants/:id/plan', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { pricingPlanId } = req.body;
    
    const tenant = await prisma.tenant.findUnique({
      where: { id }
    });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const updateData = { pricingPlanId: parseInt(pricingPlanId) };
    
    // Set currentPlanStartDate if not already set or if changing from no plan
    if (!tenant.currentPlanStartDate || !tenant.pricingPlanId) {
      updateData.currentPlanStartDate = new Date();
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: updateData
    });

    res.json(updatedTenant);
  } catch (error) {
    console.error('Error updating tenant plan:', error);
    res.status(500).json({ message: 'Failed to update tenant plan' });
  }
});

// Change tenant plan
app.patch('/api/tenants/:id/change-plan', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPlanId, activationDate } = req.body;
    
    console.log('Change plan request:', { id, newPlanId, activationDate });
    
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: { pricingPlan: true }
    });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    const activationDateTime = new Date(activationDate);
    
    // Calculate current plan end date (end of current billing cycle)
    let currentPlanEndDate = null;
    if (tenant.currentPlanStartDate) {
      const startDate = new Date(tenant.currentPlanStartDate);
      const now = new Date();
      const monthsDiff = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
      
      currentPlanEndDate = new Date(startDate);
      currentPlanEndDate.setMonth(startDate.getMonth() + monthsDiff + 1);
      currentPlanEndDate.setDate(currentPlanEndDate.getDate() - 1);
    }

    console.log('Update data:', {
      nextPlanId: parseInt(newPlanId),
      nextPlanActivationDate: activationDateTime,
      currentPlanEndDate
    });

    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: {
        nextPlanId: parseInt(newPlanId),
        nextPlanActivationDate: activationDateTime,
        currentPlanEndDate
      }
    });

    console.log('Updated tenant:', updatedTenant);
    res.json(updatedTenant);
  } catch (error) {
    console.error('Error changing tenant plan:', error);
    res.status(500).json({ message: 'Failed to change tenant plan' });
  }
});

// Units endpoints
app.get('/api/units', authenticateToken, async (req, res) => {
  try {
    const units = await prisma.unit.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    });
    res.json(units);
  } catch (error) {
    console.error('Error fetching units:', error);
    res.status(500).json({ message: 'Failed to fetch units' });
  }
});

app.post('/api/units', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const unit = await prisma.unit.create({
      data: { name }
    });
    res.json(unit);
  } catch (error) {
    console.error('Error creating unit:', error);
    res.status(500).json({ message: 'Failed to create unit' });
  }
});

app.put('/api/units/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, active } = req.body;
    const updatedUnit = await prisma.unit.update({
      where: { id: parseInt(id) },
      data: { name, active }
    });
    res.json(updatedUnit);
  } catch (error) {
    console.error('Error updating unit:', error);
    res.status(500).json({ message: 'Failed to update unit' });
  }
});

app.delete('/api/units/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.unit.update({ where: { id: parseInt(id) }, data: { active: false } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting unit:', error);
    res.status(500).json({ message: 'Failed to delete unit' });
  }
});

// Payment Types endpoints
app.get('/api/payment-types', authenticateToken, async (req, res) => {
  try {
    const paymentTypes = await prisma.paymentType.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    });
    res.json(paymentTypes);
  } catch (error) {
    console.error('Error fetching payment types:', error);
    res.status(500).json({ message: 'Failed to fetch payment types' });
  }
});

app.post('/api/payment-types', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    const paymentType = await prisma.paymentType.create({
      data: { name }
    });
    res.json(paymentType);
  } catch (error) {
    console.error('Error creating payment type:', error);
    res.status(500).json({ message: 'Failed to create payment type' });
  }
});

app.put('/api/payment-types/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, active } = req.body;
    const updatedPaymentType = await prisma.paymentType.update({
      where: { id: parseInt(id) },
      data: { name, active }
    });
    res.json(updatedPaymentType);
  } catch (error) {
    console.error('Error updating payment type:', error);
    res.status(500).json({ message: 'Failed to update payment type' });
  }
});

app.delete('/api/payment-types/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.paymentType.update({ where: { id: parseInt(id) }, data: { active: false } });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting payment type:', error);
    res.status(500).json({ message: 'Failed to delete payment type' });
  }
});



// Generate invoice for specific tenant
app.post('/api/tenants/:id/generate-invoice', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { billingPeriodStart, billingPeriodEnd } = req.body;
    
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: { pricingPlan: true }
    });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    if (!tenant.pricingPlan || tenant.pricingPlan.price === null || tenant.pricingPlan.price === 0) {
      return res.status(400).json({ message: 'Cannot generate invoice for free or contact-us plans' });
    }

    let currentPeriodStart, currentPeriodEnd;
    
    if (billingPeriodStart && billingPeriodEnd) {
      // Use custom billing period from admin
      currentPeriodStart = new Date(billingPeriodStart);
      currentPeriodEnd = new Date(billingPeriodEnd);
    } else {
      // Calculate current billing period automatically
      let planStartDate = tenant.currentPlanStartDate;
      if (!planStartDate) {
        planStartDate = new Date();
        await prisma.tenant.update({
          where: { id },
          data: { currentPlanStartDate: planStartDate }
        });
      }

      const now = new Date();
      const billingStart = new Date(planStartDate);
      const monthsDiff = (now.getFullYear() - billingStart.getFullYear()) * 12 + (now.getMonth() - billingStart.getMonth());
      
      currentPeriodStart = new Date(billingStart);
      currentPeriodStart.setMonth(billingStart.getMonth() + monthsDiff);
      
      currentPeriodEnd = new Date(currentPeriodStart);
      currentPeriodEnd.setMonth(currentPeriodStart.getMonth() + 1);
      currentPeriodEnd.setDate(currentPeriodEnd.getDate() - 1);
    }

    // Check if invoice already exists for this period
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        tenantId: id,
        description: {
          contains: `${currentPeriodStart.toLocaleDateString()} to ${currentPeriodEnd.toLocaleDateString()}`
        }
      }
    });

    if (existingInvoice) {
      return res.status(400).json({ message: 'Invoice already exists for this billing period' });
    }

    const dueDate = new Date(currentPeriodEnd);
    dueDate.setDate(dueDate.getDate() + 15); // 15 days after period end

    const invoice = await prisma.invoice.create({
      data: {
        tenantId: id,
        planId: tenant.pricingPlanId,
        amount: tenant.pricingPlan.price,
        dueDate,
        description: `${tenant.pricingPlan.name} plan - ${currentPeriodStart.toLocaleDateString()} to ${currentPeriodEnd.toLocaleDateString()}`,
        status: 'PENDING'
      }
    });

    res.json({ message: 'Invoice generated successfully', invoice });
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({ message: 'Failed to generate invoice' });
  }
});


