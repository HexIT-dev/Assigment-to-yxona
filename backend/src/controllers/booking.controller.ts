import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const createBooking = async (req: Request, res: Response) => {
  try {
    const { 
      hallId, date, seats, serviceIds 
    } = req.body;

    const hall = await prisma.toyxona.findUnique({
      where: { id: hallId },
      include: { services: true }
    });

    if (!hall) {
       res.status(404).json({ message: 'Hall not found' });
       return;
    }

    // Sig'im tekshiruvi
    if (seats > hall.capacity) {
       res.status(400).json({ message: 'Odamlar soni to\'yxona sig\'imidan oshib ketdi' });
       return;
    }

    // Bir kunga maksimal 2 ta bron (nahorgi osh + oqshomgi to'y)
    const sameDayCount = await prisma.booking.count({
      where: {
        hallId,
        date: new Date(date),
        status: { notIn: ['CANCELLED', 'REJECTED'] }
      }
    });

    if (sameDayCount >= 2) {
       res.status(400).json({ message: 'Bu kun to\'liq band (kuniga 2 tadan ortiq bron mumkin emas)' });
       return;
    }

    // Umumiy narxni hisoblash
    let totalPrice = hall.pricePerSeat * seats;
    const selectedServices = hall.services.filter(s => serviceIds.includes(s.id));
    selectedServices.forEach(s => totalPrice += s.price);

    const advancePayment = totalPrice * 0.2; // 20% avans (faqat ko'rsatkich uchun)

    // To'lov mock — balans tekshiruvi yo'q (spec bo'yicha shunchaki muvaffaqiyatli)
    const booking = await prisma.booking.create({
      data: {
        date: new Date(date),
        seats,
        totalPrice,
        advancePayment,
        hallId,
        userId: req.user.id,
        services: {
          create: selectedServices.map(s => ({
            serviceId: s.id
          }))
        }
      },
      include: {
        hall: true,
        services: {
          include: { service: true }
        }
      }
    });

    res.status(201).json(booking);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getBookings = async (req: Request, res: Response) => {
  try {
    const { hallId, status, sortBy, order } = req.query;

    const where: any = {};
    
    if (req.user.role === 'USER') {
      where.userId = req.user.id;
    } else if (req.user.role === 'OWNER') {
      where.hall = { ownerId: req.user.id };
    }

    if (hallId) where.hallId = hallId;
    if (status) where.status = status;

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        hall: {
          include: {
            owner: {
              select: { id: true, firstName: true, lastName: true, phone: true, avatarUrl: true }
            }
          }
        },
        user: {
          select: { id: true, firstName: true, lastName: true, phone: true, avatarUrl: true }
        },
        services: {
          include: { service: true }
        }
      },
      orderBy: {
        [sortBy as string || 'date']: order === 'desc' ? 'desc' : 'asc'
      }
    });

    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: id as string },
      include: { hall: true }
    });

    if (!booking) {
       res.status(404).json({ message: 'Booking not found' });
       return;
    }

    // Check authorization
    const isOwner = req.user.role === 'OWNER' && booking.hall.ownerId === req.user.id;
    const isUser = req.user.role === 'USER' && booking.userId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isUser && !isAdmin) {
       res.status(403).json({ message: 'Not authorized to cancel this booking' });
       return;
    }

    // Foydalanuvchi o'zining o'tib ketmagan istalgan bronini bekor qila oladi
    if (isUser) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const d = new Date(booking.date);
      d.setHours(0, 0, 0, 0);
      if (d < today) {
        res.status(400).json({ message: "O'tib ketgan bronni bekor qilib bo'lmaydi" });
        return;
      }
    }

    const { reason } = req.body;
    await prisma.$transaction([
      prisma.booking.update({
        where: { id: id as string },
        data: { 
          status: 'CANCELLED',
          rejectReason: reason || 'Bekor qilindi'
        }
      }),
      prisma.user.update({
        where: { id: booking.userId },
        data: { balance: { increment: booking.advancePayment } }
      })
    ]);

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const approveBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({
      where: { id: id as string },
      include: { hall: true }
    });

    if (!booking) {
       res.status(404).json({ message: 'Booking not found' });
       return;
    }

    const isOwner = req.user.role === 'OWNER' && booking.hall.ownerId === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
       res.status(403).json({ message: 'Only hall owner or admin can approve' });
       return;
    }

    // Check if there is already an APPROVED booking for this date
    const existingApproved = await prisma.booking.findFirst({
      where: {
        hallId: booking.hallId,
        date: booking.date,
        status: 'APPROVED'
      }
    });

    if (existingApproved) {
       res.status(400).json({ message: 'Bu sanada allaqachon tasdiqlangan bron mavjud' });
       return;
    }

    await prisma.booking.update({
      where: { id: id as string },
      data: { status: 'APPROVED' }
    });

    // Optionally auto-reject other pending bookings for the same date?
    await prisma.booking.updateMany({
      where: {
        hallId: booking.hallId,
        date: booking.date,
        status: 'PENDING',
        id: { not: id as string }
      },
      data: { status: 'REJECTED', rejectReason: 'Boshqa mijoz band qildi' }
    });

    res.json({ message: 'Booking approved successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const booking = await prisma.booking.findUnique({
      where: { id: id as string },
      include: { hall: true }
    });

    if (!booking) {
       res.status(404).json({ message: 'Booking not found' });
       return;
    }

    if (req.user.role !== 'OWNER' || booking.hall.ownerId !== req.user.id) {
       res.status(403).json({ message: 'Only hall owner can reject' });
       return;
    }

    await prisma.$transaction([
      prisma.booking.update({
        where: { id: id as string },
        data: { status: 'REJECTED', rejectReason: reason || 'Owner rejected' }
      }),
      prisma.user.update({
        where: { id: booking.userId },
        data: { balance: { increment: booking.advancePayment } }
      })
    ]);

    res.json({ message: 'Booking rejected successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { seats, date, serviceIds } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: id as string },
      include: { 
        hall: { include: { services: true } },
        user: true,
        services: true
      }
    });

    if (!booking) {
      res.status(404).json({ message: 'Booking not found' });
      return;
    }

    if (booking.status !== 'PENDING') {
      res.status(400).json({ message: 'Siz faqat kutilayotgan bronlarni o\'zgartira olasiz' });
      return;
    }

    const isUser = req.user.role === 'USER' && booking.userId === req.user.id;
    const isOwner = req.user.role === 'OWNER' && booking.hall.ownerId === req.user.id;

    if (!isUser && !isOwner) {
      res.status(403).json({ message: 'Ushbu bronni tahrirlashga ruxsatingiz yo\'q' });
      return;
    }

    const finalSeats = seats !== undefined ? parseInt(seats) : booking.seats;
    const finalDate = date ? new Date(date) : booking.date;

    let totalPrice = booking.hall.pricePerSeat * finalSeats;
    
    let selectedServices: any[] = [];
    if (serviceIds) {
      selectedServices = booking.hall.services.filter(s => serviceIds.includes(s.id));
      selectedServices.forEach(s => totalPrice += s.price);
    } else {
      const existingServiceIds = booking.services.map(bs => bs.serviceId);
      selectedServices = booking.hall.services.filter(s => existingServiceIds.includes(s.id));
      selectedServices.forEach(s => totalPrice += s.price);
    }

    const newAdvancePayment = totalPrice * 0.2;
    const diff = newAdvancePayment - booking.advancePayment;

    const userToCharge = await prisma.user.findUnique({ where: { id: booking.userId } });
    if (!userToCharge) {
      res.status(404).json({ message: 'Foydalanuvchi topilmadi' });
      return;
    }

    if (diff > 0 && userToCharge.balance < diff) {
      res.status(400).json({ message: 'Foydalanuvchi hisobida yetarli mablag\' mavjud emas' });
      return;
    }

    const [updatedBooking] = await prisma.$transaction([
      prisma.booking.update({
        where: { id: id as string },
        data: {
          date: finalDate,
          seats: finalSeats,
          totalPrice,
          advancePayment: newAdvancePayment,
          services: serviceIds ? {
            deleteMany: {},
            create: selectedServices.map(s => ({
              serviceId: s.id
            }))
          } : undefined
        },
        include: {
          hall: true,
          services: {
            include: { service: true }
          },
          user: {
            select: { firstName: true, lastName: true, phone: true }
          }
        }
      }),
      prisma.user.update({
        where: { id: booking.userId },
        data: diff >= 0
          ? { balance: { decrement: diff } }
          : { balance: { increment: -diff } }
      })
    ]);

    res.json(updatedBooking);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
