import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const createHall = async (req: Request, res: Response) => {
  try {
    const { 
      name, district, address, capacity, pricePerSeat, phone, 
      images, services, ownerId
    } = req.body;

    const hall = await prisma.toyxona.create({
      data: {
        name,
        district,
        address,
        capacity: parseInt(capacity),
        pricePerSeat: parseFloat(pricePerSeat),
        phone,
        ownerId: req.user.role === 'OWNER' ? req.user.id : (ownerId || null),
        status: req.user.role === 'ADMIN' ? 'APPROVED' : 'PENDING',
        images: {
          create: images.map((img: any) => ({ 
            url: typeof img === 'string' ? img : img.url,
            is360: typeof img === 'string' ? false : !!img.is360
          }))
        },
        services: {
          create: services.map((service: any) => ({
            type: service.type,
            name: service.name,
            price: parseFloat(service.price || 0),
            imageUrl: service.imageUrl,
            description: service.description
          }))
        }
      },
      include: {
        images: true,
        services: true
      }
    });

    res.status(201).json(hall);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getHalls = async (req: Request, res: Response) => {
  try {
    const { 
      search, district, status, sortBy, order, 
      minCapacity, maxPrice, ownerId
    } = req.query;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { address: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (district) where.district = district;
    if (ownerId) where.ownerId = ownerId as string;

    if (status) {
      if (status !== 'all') {
        where.status = status;
      }
    } else if (!ownerId) {
      where.status = 'APPROVED'; // Default for public
    }

    const queryOptions: any = {
      where,
      include: {
        images: true,
        services: true
      }
    };

    if (sortBy) {
      queryOptions.orderBy = {
        [sortBy as string]: order === 'desc' ? 'desc' : 'asc'
      };
    }

    const halls = await prisma.toyxona.findMany(queryOptions);
    res.json(halls);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getHallById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const hall = await prisma.toyxona.findUnique({
      where: { id: id as string },
      include: {
        images: true,
        services: true,
        bookings: {
          include: {
            user: {
              select: { firstName: true, lastName: true, phone: true }
            }
          }
        }
      }
    });

    if (!hall) {
       res.status(404).json({ message: 'Hall not found' });
       return;
    }

    res.json(hall);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const updateHall = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      name, district, address, capacity, pricePerSeat, phone, 
      status, images, services, ownerId 
    } = req.body;

    let finalStatus = status;
    if (req.user.role !== 'ADMIN') {
      const existingHall = await prisma.toyxona.findUnique({ where: { id: id as string } });
      if (existingHall?.ownerId !== req.user.id) {
         res.status(403).json({ message: 'Not authorized to update this hall' });
         return;
      }
      finalStatus = 'PENDING';
    }

    // Delete existing images and services if provided in update
    if (images) {
      await prisma.hallImage.deleteMany({ where: { hallId: id as string } });
    }
    if (services) {
      await prisma.hallService.deleteMany({ where: { hallId: id as string } });
    }

    const hall = await prisma.toyxona.update({
      where: { id: id as string },
      data: {
        name,
        district,
        address,
        capacity: capacity ? parseInt(capacity) : undefined,
        pricePerSeat: pricePerSeat ? parseFloat(pricePerSeat) : undefined,
        phone,
        status: finalStatus,
        ownerId: req.user.role === 'ADMIN' ? (ownerId || null) : undefined,
        images: images ? {
          create: images.map((img: any) => ({ 
            url: typeof img === 'string' ? img : img.url,
            is360: typeof img === 'string' ? false : !!img.is360
          }))
        } : undefined,
        services: services ? {
          create: services.map((service: any) => ({
            type: service.type,
            name: service.name,
            price: parseFloat(service.price || 0),
            imageUrl: service.imageUrl,
            description: service.description
          }))
        } : undefined
      },
      include: {
        images: true,
        services: true
      }
    });

    res.json(hall);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteHall = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'ADMIN') {
       res.status(403).json({ message: 'Only admin can delete halls' });
       return;
    }

    // Avval shu to'yxonaga tegishli bronlarni o'chiramiz (BookingService cascade bilan ketadi),
    // shundan keyingina to'yxonani (rasm/xizmatlar cascade bilan) o'chirish mumkin bo'ladi.
    await prisma.$transaction([
      prisma.booking.deleteMany({ where: { hallId: id as string } }),
      prisma.toyxona.delete({ where: { id: id as string } }),
    ]);
    res.json({ message: 'Hall deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const approveHall = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.toyxona.update({
      where: { id: id as string },
      data: { status: 'APPROVED' }
    });
    res.json({ message: 'Hall approved successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
