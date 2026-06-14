import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { sendOtpEmail } from '../utils/mailer';

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable is not set');

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, username, password, role } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }, { phone }] }
    });

    if (existingUser) {
       res.status(400).json({ message: 'User already exists with this email, username or phone' });
       return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = role === 'OWNER' ? generateOtp() : null;

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        username,
        password: hashedPassword,
        role,
        otp,
        isVerified: role !== 'OWNER' // Foydalanuvchilar darrov tasdiqlanadi, egalar OTP orqali
      }
    });

    // To'yxona egasiga tasdiqlash kodini emailga yuborish
    if (role === 'OWNER' && otp) {
      await sendOtpEmail(email, otp);
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    const { password: _, otp: __, ...safeUser } = user;
    res.status(201).json({ user: safeUser, token });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
       res.status(400).json({ message: 'Invalid credentials' });
       return;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
       res.status(400).json({ message: 'Invalid credentials' });
       return;
    }

    if (user.role === 'OWNER' && !user.isVerified) {
       // Ilk marta login: yangi OTP yaratib, emailga yuboramiz
       const otp = generateOtp();
       await prisma.user.update({ where: { id: user.id }, data: { otp } });
       await sendOtpEmail(user.email, otp);
       res.status(401).json({ message: 'Hisobingizni tasdiqlang', needsVerification: true, email: user.email });
       return;
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    const { password: _, otp: __, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Email orqali kirish / parolni tiklash uchun kod so'rash.
 * Barcha rollar uchun ishlaydi. Email mavjudligini oshkor qilmaymiz.
 */
export const requestCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: 'Email kiriting' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const otp = generateOtp();
      await prisma.user.update({ where: { id: user.id }, data: { otp } });
      await sendOtpEmail(email, otp);
    }

    // Email ro'yxatda bor-yo'qligini bildirmaymiz (xavfsizlik uchun)
    res.json({ message: "Agar bu email ro'yxatdan o'tgan bo'lsa, tasdiqlash kodi yuborildi" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.otp !== otp) {
       res.status(400).json({ message: 'Invalid OTP' });
       return;
    }

    await prisma.user.update({
      where: { email },
      data: { isVerified: true, otp: null }
    });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    const { password: _, otp: __, ...safeUser } = user;
    res.json({ message: 'Account verified successfully', token, user: safeUser });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, firstName: true, lastName: true, email: true, phone: true, username: true, role: true, balance: true, avatarUrl: true }
    });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
