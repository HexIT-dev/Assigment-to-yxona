import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    const sender = await prisma.user.findUnique({ where: { id: senderId } });
    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });

    if (!sender || !receiver) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Role restrictions
    if (sender.role === 'USER' && receiver.role === 'ADMIN') {
      res.status(403).json({ message: 'Siz adminga xabar yubora olmaysiz' });
      return;
    }
    if (sender.role === 'ADMIN' && receiver.role === 'USER') {
      res.status(403).json({ message: 'Admin faqat to\'yxona egalari bilan chat qila oladi' });
      return;
    }

    // Check if sender is blocked by receiver (owner blocking user)
    const isBlocked = await prisma.blockedUser.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: receiverId,
          blockedId: senderId
        }
      }
    });

    if (isBlocked) {
      res.status(403).json({ message: 'Siz bu foydalanuvchi tomonidan bloklangansiz' });
      return;
    }

    const message = await prisma.message.create({
      data: { content, senderId, receiverId },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: true, avatarUrl: true } },
        receiver: { select: { id: true, firstName: true, lastName: true, role: true, avatarUrl: true } }
      }
    });

    res.status(201).json(message);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.query;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId as string },
          { senderId: otherUserId as string, receiverId: userId }
        ]
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: true, avatarUrl: true } },
        receiver: { select: { id: true, firstName: true, lastName: true, role: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: { senderId: otherUserId as string, receiverId: userId, isRead: false },
      data: { isRead: true }
    });

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { search, district } = req.query;

    const sentMessages = await prisma.message.findMany({
      where: { senderId: userId },
      select: { receiverId: true }
    });

    const receivedMessages = await prisma.message.findMany({
      where: { receiverId: userId },
      select: { senderId: true }
    });

    const participantIds = Array.from(new Set([
      ...sentMessages.map(m => m.receiverId),
      ...receivedMessages.map(m => m.senderId)
    ]));

    const whereClause: any = { id: { in: participantIds } };
    if (search) {
      whereClause.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const conversations = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true, firstName: true, lastName: true,
        role: true, avatarUrl: true,
        halls: {
          select: { district: true }
        }
      }
    });

    // Filter by district if provided
    let results = conversations;
    if (district) {
      results = conversations.filter(u =>
        u.halls.some(h => h.district === district)
      );
    }

    // Add unread count
    const withUnread = await Promise.all(results.map(async (u) => {
      const unread = await prisma.message.count({
        where: { senderId: u.id, receiverId: userId, isRead: false }
      });
      return { ...u, unreadCount: unread };
    }));

    res.json(withUnread);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getAvailableContacts = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const currentUser = req.user;

    const selectFields = {
      id: true, firstName: true, lastName: true,
      role: true, avatarUrl: true, phone: true,
      halls: { select: { id: true, name: true, district: true } }
    };

    let results: any[] = [];

    if (currentUser.role === 'ADMIN') {
      // Admin sees all owners
      results = await prisma.user.findMany({
        where: { role: 'OWNER' },
        select: selectFields
      });

    } else if (currentUser.role === 'USER') {
      // User only sees owners of halls they have non-cancelled bookings for
      const bookings = await prisma.booking.findMany({
        where: {
          userId: currentUser.id,
          status: { notIn: ['CANCELLED', 'REJECTED'] }
        },
        include: {
          hall: {
            include: {
              owner: { select: selectFields }
            }
          }
        }
      });
      const ownerMap = new Map<string, any>();
      for (const b of bookings) {
        if (b.hall?.owner) ownerMap.set(b.hall.owner.id, b.hall.owner);
      }
      results = Array.from(ownerMap.values());

    } else if (currentUser.role === 'OWNER') {
      // Owner only sees users who have active bookings in their halls
      const myHalls = await prisma.toyxona.findMany({
        where: { ownerId: currentUser.id },
        select: { id: true }
      });
      const hallIds = myHalls.map((h: any) => h.id);

      const bookings = await prisma.booking.findMany({
        where: {
          hallId: { in: hallIds },
          status: { notIn: ['CANCELLED', 'REJECTED'] }
        },
        include: {
          user: { select: selectFields }
        }
      });
      const userMap = new Map<string, any>();
      for (const b of bookings) {
        if (b.user) userMap.set(b.user.id, b.user);
      }
      results = Array.from(userMap.values());
    }

    // Apply search filter
    if (search) {
      const q = (search as string).toLowerCase();
      results = results.filter(u =>
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q)
      );
    }

    // Add unread message count
    const withUnread = await Promise.all(results.map(async (u) => {
      const unread = await prisma.message.count({
        where: { senderId: u.id, receiverId: currentUser.id, isRead: false }
      });
      return { ...u, unreadCount: unread };
    }));

    res.json(withUnread);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const blockUser = async (req: Request, res: Response) => {
  try {
    if (req.user.role !== 'OWNER') {
      res.status(403).json({ message: 'Faqat to\'yxona egasi bloklashi mumkin' });
      return;
    }

    const userId = req.params.userId as string;

    await prisma.blockedUser.upsert({
      where: {
        blockerId_blockedId: {
          blockerId: req.user.id,
          blockedId: userId
        }
      },
      update: {},
      create: {
        blockerId: req.user.id,
        blockedId: userId
      }
    });

    res.json({ message: 'User blocked successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const unblockUser = async (req: Request, res: Response) => {
  try {
    if (req.user.role !== 'OWNER') {
      res.status(403).json({ message: 'Faqat to\'yxona egasi blokni ochishi mumkin' });
      return;
    }

    const userId = req.params.userId as string;

    await prisma.blockedUser.delete({
      where: {
        blockerId_blockedId: {
          blockerId: req.user.id,
          blockedId: userId
        }
      }
    });

    res.json({ message: 'User unblocked successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
