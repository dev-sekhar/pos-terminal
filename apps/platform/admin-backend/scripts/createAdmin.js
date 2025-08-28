import { PrismaClient } from '../../../../node_modules/.prisma/client/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Check if admin employee already exists
    const existingAdmin = await prisma.employee.findFirst({
      where: { email: 'admin@posterminal.com' }
    });

    if (existingAdmin) {
      console.log('Admin employee already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin employee
    const adminEmployee = await prisma.employee.create({
      data: {
        email: 'admin@posterminal.com',
        password: hashedPassword,
        name: 'System Administrator',
        role: 'ADMIN'
      }
    });

    console.log('Admin employee created successfully:');
    console.log('Email: admin@posterminal.com');
    console.log('Password: admin123');
    console.log('Role: ADMIN');

  } catch (error) {
    console.error('Error creating admin employee:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();