import type { Request, Response, NextFunction } from 'express';
import { verify, TokenExpiredError } from 'jsonwebtoken';
import { generateAccessToken, generateRefreshToken } from '@libs/helpers/jwt';

type VerifiedTokenPayload = { userId: string; iat?: number; exp?: number };

export interface AuthenticatedRequest extends Request {
  user?: VerifiedTokenPayload;
}

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  try {
    if (!accessToken) throw new Error('No access token');

    (req as AuthenticatedRequest).user = verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET!,
    ) as VerifiedTokenPayload;
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
      ) as VerifiedTokenPayload;

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
      (req as AuthenticatedRequest).user = { userId: refreshPayload.userId };
      return next();
    } catch {
      res.status(403).json({ message: 'Invalid refresh token' });
      return;
    }
  }
};

export default authMiddleware;
