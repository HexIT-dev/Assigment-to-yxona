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

// Reflect the request origin so any frontend (Netlify, localhost) is allowed.
app.use(cors({
  origin: true,
  credentials: true,
}));
// Rasmlar base64 (data-URL) ko'rinishida yuboriladi — standart 100kb limit yetmaydi
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

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
  // Eslatma: ownerlarni bu yerda avtomatik tasdiqlamaymiz.
  // Spec bo'yicha ega birinchi marta login qilganda OTP orqali o'zi tasdiqlanishi kerak.

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

  const demoUser = await prisma.user.findUnique({ where: { username: 'user' } });
  if (!demoUser) {
    const hashedPassword = await bcrypt.hash('1234', 10);
    await prisma.user.create({
      data: {
        firstName: 'Demo',
        lastName: 'Foydalanuvchi',
        email: 'user@toyxona.uz',
        phone: '+998901112200',
        username: 'user',
        password: hashedPassword,
        role: 'USER',
        isVerified: true,
        balance: 0
      }
    });
    console.log('Default user created: user / 1234');
  }

  const seedOwners = [
    {
      username: 'ilhom',
      firstName: 'Ilhom', lastName: 'Gulyamov',
      email: 'ilhom@gmail.com', phone: '+998991234567',
      halls: [
        {
          name: 'Versailles Palace', district: 'Yunusobod',
          address: "Amir Temur ko'chasi, 108", capacity: 500, pricePerSeat: 250000,
          phone: '+998901234567',
          images: [
            { url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1200', is360: false },
            { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200', is360: true }
          ],
          services: [
            { name: 'VIP Catering', price: 5000000, type: 'FOOD' as ServiceType },
            { name: 'Jonli Orkestr', price: 3000000, type: 'MUSIC' as ServiceType }
          ]
        },
        {
          name: 'The Ritz Carlton Hall', district: 'Mirobod',
          address: "Shaxrisabz ko'chasi, 5", capacity: 350, pricePerSeat: 400000,
          phone: '+998901234568',
          images: [
            { url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200', is360: false }
          ],
          services: [
            { name: 'Elite Dekoratsiya', price: 8000000, type: 'DECOR' as ServiceType }
          ]
        }
      ]
    },
    {
      username: 'jasur',
      firstName: 'Jasur', lastName: 'Toshmatov',
      email: 'jasur@gmail.com', phone: '+998901112233',
      halls: [
        {
          name: 'Grand Paradise', district: 'Yunusobod',
          address: "Yunusobod ko'chasi, 45", capacity: 600, pricePerSeat: 300000,
          phone: '+998901112233',
          images: [
            { url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=1200', is360: false },
            { url: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?auto=format&fit=crop&q=80&w=1200', is360: true }
          ],
          services: [
            { name: "To'y Taomi", price: 4000000, type: 'FOOD' as ServiceType },
            { name: 'Karnay-Surnay', price: 2000000, type: 'KARNAY' as ServiceType }
          ]
        },
        {
          name: 'Royal Garden', district: 'Chilonzor',
          address: "Chilonzor ko'chasi, 12", capacity: 400, pricePerSeat: 350000,
          phone: '+998901112244',
          images: [
            { url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=1200', is360: false }
          ],
          services: [
            { name: 'Bog Dekoratsiyasi', price: 6000000, type: 'DECOR' as ServiceType },
            { name: 'Professional DJ', price: 3500000, type: 'MUSIC' as ServiceType }
          ]
        }
      ]
    },
    {
      username: 'nodira',
      firstName: 'Nodira', lastName: 'Karimova',
      email: 'nodira@gmail.com', phone: '+998932223344',
      halls: [
        {
          name: 'Margilan Saroyi', district: 'Mirobod',
          address: "Mustaqillik ko'chasi, 78", capacity: 450, pricePerSeat: 280000,
          phone: '+998932223344',
          images: [
            { url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=1200', is360: false },
            { url: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?auto=format&fit=crop&q=80&w=1200', is360: true }
          ],
          services: [
            { name: 'Premium Meny', price: 5500000, type: 'MENU' as ServiceType },
            { name: 'Gul Dekoratsiyasi', price: 4500000, type: 'DECOR' as ServiceType }
          ]
        },
        {
          name: 'Diamond Hall', district: "Mirzo Ulug'bek",
          address: "Mirzo Ulug'bek ko'chasi, 33", capacity: 300, pricePerSeat: 450000,
          phone: '+998932223355',
          images: [
            { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=1200', is360: false }
          ],
          services: [
            { name: 'VIP Avtomobil', price: 3000000, type: 'CAR' as ServiceType },
            { name: 'Kuy-Qo\'shiq', price: 4000000, type: 'SINGER' as ServiceType }
          ]
        }
      ]
    },
    {
      username: 'sardor',
      firstName: 'Sardor', lastName: 'Yusupov',
      email: 'sardor@gmail.com', phone: '+998945556677',
      halls: [
        {
          name: 'Silk Road Hall', district: 'Shayxontohur',
          address: "Shayxontohur ko'chasi, 56", capacity: 550, pricePerSeat: 320000,
          phone: '+998945556677',
          images: [
            { url: 'https://images.unsplash.com/photo-1478146059778-26028b07395a?auto=format&fit=crop&q=80&w=1200', is360: false },
            { url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=1200', is360: true }
          ],
          services: [
            { name: "Milliy Taom", price: 4800000, type: 'FOOD' as ServiceType },
            { name: 'Folklor Ansambli', price: 3200000, type: 'MUSIC' as ServiceType }
          ]
        },
        {
          name: 'Toshkent Saroyi', district: 'Yunusobod',
          address: "Amir Temur shoh ko'chasi, 15", capacity: 700, pricePerSeat: 200000,
          phone: '+998945556688',
          images: [
            { url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=1200', is360: false }
          ],
          services: [
            { name: 'Standart Meny', price: 3000000, type: 'MENU' as ServiceType }
          ]
        }
      ]
    },
    {
      username: 'malika',
      firstName: 'Malika', lastName: 'Rahimova',
      email: 'malika@gmail.com', phone: '+998976667788',
      halls: [
        {
          name: 'Golden Crown', district: 'Chilonzor',
          address: "Bunyodkor ko'chasi, 90", capacity: 380, pricePerSeat: 380000,
          phone: '+998976667788',
          images: [
            { url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=1200', is360: false },
            { url: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?auto=format&fit=crop&q=80&w=1200', is360: true }
          ],
          services: [
            { name: 'Zamonaviy Dekor', price: 7000000, type: 'DECOR' as ServiceType },
            { name: 'Elin Qo\'shiqchisi', price: 5000000, type: 'SINGER' as ServiceType }
          ]
        },
        {
          name: 'Azure Hall', district: 'Mirobod',
          address: "Osiyo ko'chasi, 22", capacity: 420, pricePerSeat: 260000,
          phone: '+998976667799',
          images: [
            { url: 'https://images.unsplash.com/photo-1496843916299-590492c751f4?auto=format&fit=crop&q=80&w=1200', is360: false }
          ],
          services: [
            { name: 'Karnay Jamoasi', price: 1800000, type: 'KARNAY' as ServiceType },
            { name: 'Premium Taom', price: 5200000, type: 'FOOD' as ServiceType }
          ]
        }
      ]
    }
  ];

  for (const ownerData of seedOwners) {
    const existing = await prisma.user.findUnique({ where: { username: ownerData.username } });
    if (existing) continue;

    const hashedPass = await bcrypt.hash('1234', 10);
    const newOwner = await prisma.user.create({
      data: {
        firstName: ownerData.firstName,
        lastName: ownerData.lastName,
        email: ownerData.email,
        phone: ownerData.phone,
        username: ownerData.username,
        password: hashedPass,
        role: 'OWNER',
        isVerified: true,
        balance: 50000000
      }
    });
    console.log(`Owner created: ${ownerData.username} / 1234`);

    for (const hall of ownerData.halls) {
      await prisma.toyxona.create({
        data: {
          name: hall.name,
          district: hall.district,
          address: hall.address,
          capacity: hall.capacity,
          pricePerSeat: hall.pricePerSeat,
          phone: hall.phone,
          status: 'APPROVED' as HallStatus,
          ownerId: newOwner.id,
          images: { create: hall.images },
          services: { create: hall.services }
        }
      });
    }
  }
};

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await initAdmin();
});

