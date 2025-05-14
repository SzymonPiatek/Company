import type { Request, Response, NextFunction } from 'express';
import { verify, TokenExpiredError } from 'jsonwebtoken';
import { generateAccessToken, generateRefreshToken } from '../helpers/jwt';
import prisma from '@apps/user-service/src/prismaClient';

type BasicTokenPayload = { userId: string; iat?: number; exp?: number };

type FullUserPayload = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  roles: { name: string }[];
  permissions: { action: string; subject: string }[];
};

export interface AuthenticatedRequest extends Request {
  user?: FullUserPayload;
}

const getFullUserData = async (userId: string): Promise<FullUserPayload | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isActive: true,
      roles: {
        select: {
          role: {
            select: {
              name: true,
              permissions: {
                select: {
                  permission: {
                    select: {
                      action: true,
                      subject: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  const roles = user.roles.map((r) => ({ name: r.role.name }));
  const permissions = user.roles.flatMap((r) => r.role.permissions.map((p) => p.permission));

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isActive: user.isActive,
    roles,
    permissions,
  };
};

const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  try {
    if (!accessToken) throw new Error('No access token');

    const payload = verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as BasicTokenPayload;
    const user = await getFullUserData(payload.userId);

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    (req as AuthenticatedRequest).user = user;
    return next();
  } catch (err) {
    if (!(err instanceof TokenExpiredError)) {
      res.status(403).json({ message: 'Invalid access token' });
      return;
    }

    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      res.status(401).json({ message: 'Missing refresh token' });
      return;
    }

    try {
      const refreshPayload = verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET!,
      ) as BasicTokenPayload;

      const newAccessToken = generateAccessToken({ userId: refreshPayload.userId });
      const newRefreshToken = generateRefreshToken({ userId: refreshPayload.userId });

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 1000 * 60 * 60 * 24,
      });

      res.setHeader('Authorization', `Bearer ${newAccessToken}`);

      const user = await getFullUserData(refreshPayload.userId);
      if (!user) {
        res.status(401).json({ message: 'User not found after refresh' });
        return;
      }

      (req as AuthenticatedRequest).user = user;
      return next();
    } catch {
      res.status(403).json({ message: 'Invalid refresh token' });
    }
  }
};

export default authMiddleware;
