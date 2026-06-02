import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getAdminAnalytics = async (req: Request, res: Response) => {
  try {
    if (req.user.role !== 'ADMIN') {
      res.status(403).json({ message: 'Only admin can view these analytics' });
      return;
    }

    const users = await prisma.user.findMany({
      where: { role: 'USER' },
      select: { createdAt: true }
    });

    const monthlyRegistrations: Record<string, number> = {};
    users.forEach(u => {
      const month = u.createdAt.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlyRegistrations[month] = (monthlyRegistrations[month] || 0) + 1;
    });

    const registrationsChartData = Object.keys(monthlyRegistrations).map(month => ({
      name: month,
      users: monthlyRegistrations[month]
    }));

    const halls = await prisma.toyxona.findMany({
      include: {
        _count: {
          select: { bookings: { where: { status: { notIn: ['CANCELLED', 'REJECTED'] } } } }
        }
      }
    });

    const popularHallsChartData = halls.map(h => ({
      name: h.name,
      bookings: h._count.bookings
    })).sort((a, b) => b.bookings - a.bookings).slice(0, 10); 

    res.json({
      registrations: registrationsChartData,
      popularHalls: popularHallsChartData
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getOwnerAnalytics = async (req: Request, res: Response) => {
  try {
    if (req.user.role !== 'OWNER') {
      res.status(403).json({ message: 'Only owner can view these analytics' });
      return;
    }

    const hallId = req.params.hallId as string;

    const hall = await prisma.toyxona.findUnique({ where: { id: hallId } });
    if (!hall || hall.ownerId !== req.user.id) {
       res.status(403).json({ message: 'Not authorized for this hall' });
       return;
    }

    const bookings = await prisma.booking.findMany({
      where: { hallId: hallId, status: { notIn: ['CANCELLED', 'REJECTED'] } }
    });

    const monthlyData: Record<string, { payments: number, users: Set<string> }> = {};

    bookings.forEach(b => {
      const month = b.date.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthlyData[month]) {
        monthlyData[month] = { payments: 0, users: new Set() };
      }
      monthlyData[month].payments += b.totalPrice;
      monthlyData[month].users.add(b.userId);
    });

    const ownerChartData = Object.keys(monthlyData).map(month => ({
      name: month,
      payments: monthlyData[month].payments,
      userCount: monthlyData[month].users.size
    }));

    res.json({
      chartData: ownerChartData
    });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
