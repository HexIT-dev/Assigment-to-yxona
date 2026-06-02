import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import hallRoutes from './routes/hall.routes';
import bookingRoutes from './routes/booking.routes';
import userRoutes from './routes/user.routes';
import messageRoutes from './routes/message.routes';
import analyticsRoutes from './routes/analytics.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/halls', hallRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => {
  res.send('To\'yxona API is running...');
});

import prisma from './utils/prisma';
import bcrypt from 'bcryptjs';
import { HallStatus, ServiceType } from '@prisma/client';

const initAdmin = async () => {
  const admin = await prisma.user.findUnique({ where: { username: 'admin123' } });
  if (!admin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        firstName: 'System',
        lastName: 'Admin',
        email: 'admin@toyxona.uz',
        phone: '+998901234567',
        username: 'admin123',
        password: hashedPassword,
        role: 'ADMIN',
        isVerified: true,
        balance: 100000000
      }
    });
    console.log('Default admin created: admin123 / admin123');
  }

  // Seed Ilhom (Owner)
  const owner = await prisma.user.findUnique({ where: { username: 'ilhom' } });
  if (!owner) {
    const hashedPass = await bcrypt.hash('1234', 10);
    const newOwner = await prisma.user.create({
      data: {
        firstName: 'Ilhom',
        lastName: 'Gulyamov',
        email: 'ilhom@gmail.com',
        phone: '+998991234567',
        username: 'ilhom',
        password: hashedPass,
        role: 'OWNER',
        isVerified: true,
        balance: 50000000
      }
    });
    console.log('Default owner created: ilhom / 1234');

    // Add some halls for Ilhom
    const halls = [
      {
        name: 'Versailles Palace',
        district: 'Yunusobod',
        address: 'Amir Temur ko\'chasi, 108',
        capacity: 500,
        pricePerSeat: 250000,
        status: 'APPROVED' as HallStatus,
        ownerId: newOwner.id,
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200', is360: false },
            { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200', is360: true }
          ]
        },
        services: {
          create: [
            { name: 'VIP Catering', price: 5000000, type: 'FOOD' as ServiceType },
            { name: 'Live Orchestra', price: 3000000, type: 'MUSIC' as ServiceType }
          ]
        },
        phone: '+998901234567'
      },
      {
        name: 'The Ritz Carlton Hall',
        district: 'Mirobod',
        address: 'Shaxrisabz ko\'chasi, 5',
        capacity: 350,
        pricePerSeat: 400000,
        status: 'APPROVED' as HallStatus,
        ownerId: newOwner.id,
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200', is360: false }
          ]
        },
        services: {
          create: [
            { name: 'Elite Decor', price: 8000000, type: 'DECOR' as ServiceType }
          ]
        },
        phone: '+998901234568'
      }
    ];

    for (const hallData of halls) {
      await prisma.toyxona.create({ data: hallData });
    }
  }
};

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await initAdmin();
});

