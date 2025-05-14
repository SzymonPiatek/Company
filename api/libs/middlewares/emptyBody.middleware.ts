import type { RequestHandler } from 'express';

const emptyBodyMiddleware: RequestHandler = (req, res, next): void => {
  if (!req.body || typeof req.body !== 'object') {
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }

  next();
};

export default emptyBodyMiddleware;
