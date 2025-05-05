import { Request, Response, NextFunction } from 'express';
import emptyBodyMiddleware from '../emptyBody.middleware';

describe('emptyBodyMiddleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should return 400 if req.body is undefined', () => {
    req.body = undefined;

    emptyBodyMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid request body' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 400 if req.body is null', () => {
    req.body = null;

    emptyBodyMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid request body' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 400 if req.body is not an object', () => {
    req.body = 'string' as any;

    emptyBodyMiddleware(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid request body' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if req.body is a valid object', () => {
    req.body = { key: 'value' };

    emptyBodyMiddleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should allow empty object as valid body', () => {
    req.body = {};

    emptyBodyMiddleware(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
