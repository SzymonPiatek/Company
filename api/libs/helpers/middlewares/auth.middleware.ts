import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

type VerifiedTokenPayload = { sub: string; [key: string]: any };

export interface AuthenticatedRequest extends Request {
  user?: VerifiedTokenPayload;
}

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Missing or invalid token' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!) as VerifiedTokenPayload;

    if (!payload.sub) {
      res.status(403).json({ message: 'Invalid token: missing subject' });
      return;
    }

    (req as AuthenticatedRequest).user = payload;
    next();
  } catch {
    res.status(403).json({ message: 'Token verification failed' });
  }
};

export default authMiddleware;
