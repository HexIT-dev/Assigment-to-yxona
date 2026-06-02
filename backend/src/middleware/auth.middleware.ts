import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET as string;

interface DecodedToken {
  id: string;
  role: Role;
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
     res.status(401).json({ message: 'No token, authorization denied' });
     return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
     res.status(403).json({ message: 'Access denied, admin only' });
     return;
  }
  next();
};

export const ownerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'OWNER' && req.user?.role !== 'ADMIN') {
     res.status(403).json({ message: 'Access denied' });
     return;
  }
  next();
};
