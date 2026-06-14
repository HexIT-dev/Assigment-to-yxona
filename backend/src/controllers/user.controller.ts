import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import bcrypt from 'bcryptjs';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { role, search } = req.query;

    const where: any = role ? { role: role as any } : {};
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { username: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        username: true,
        role: true,
        isVerified: true,
        avatarUrl: true,
        createdAt: true,
        halls: {
          select: {
            id: true,
            name: true,
            district: true,
            status: true,
            capacity: true,
            pricePerSeat: true,
            images: { select: { url: true }, take: 1 }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        username: true,
        role: true,
        isVerified: true,
        avatarUrl: true,
        createdAt: true,
        halls: {
          include: {
            images: true,
            _count: { select: { bookings: true } }
          }
        }
      }
    });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { firstName, lastName, phone, password, avatarUrl } = req.body;

    const updateData: any = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (avatarUrl) updateData.avatarUrl = avatarUrl;
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true, firstName: true, lastName: true,
        email: true, phone: true, username: true,
        role: true, avatarUrl: true
      }
    });

    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    // O'zini o'chirib bo'lmaydi
    if (id === req.user.id) {
      res.status(400).json({ message: "O'zingizni o'chira olmaysiz" });
      return;
    }

    // Egaga tegishli to'yxonalar
    const halls = await prisma.toyxona.findMany({ where: { ownerId: id }, select: { id: true } });
    const hallIds = halls.map((h) => h.id);

    // Bog'liq yozuvlarni tartib bilan o'chiramiz (FK cheklovlari buzilmasligi uchun)
    await prisma.$transaction([
      // Egasining to'yxonalaridagi bronlar (BookingService cascade bilan ketadi)
      prisma.booking.deleteMany({ where: { hallId: { in: hallIds } } }),
      // Foydalanuvchi o'zi qilgan bronlar
      prisma.booking.deleteMany({ where: { userId: id } }),
      // Xabarlar
      prisma.message.deleteMany({ where: { OR: [{ senderId: id }, { receiverId: id }] } }),
      // Bloklash yozuvlari
      prisma.blockedUser.deleteMany({ where: { OR: [{ blockerId: id }, { blockedId: id }] } }),
      // To'yxonalar (rasm/xizmatlar cascade bilan ketadi)
      prisma.toyxona.deleteMany({ where: { ownerId: id } }),
      // Eng oxirida foydalanuvchining o'zi
      prisma.user.delete({ where: { id } }),
    ]);

    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createOwnerByAdmin = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, username, password } = req.body;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }, { phone }] }
    });
    if (existing) {
      res.status(400).json({ message: 'Bu email, username yoki telefon allaqachon mavjud' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const randomBalance = Math.floor(5000000 + Math.random() * 95000000);

    const user = await prisma.user.create({
      data: {
        firstName, lastName, email, phone, username,
        password: hashedPassword,
        role: 'OWNER',
        isVerified: true,
        balance: randomBalance
      },
      select: {
        id: true, firstName: true, lastName: true,
        email: true, phone: true, username: true,
        role: true, balance: true, isVerified: true, createdAt: true
      }
    });

    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
