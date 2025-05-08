jest.unmock('../emptyBody.middleware');

import emptyBodyMiddleware from '../emptyBody.middleware';
import type { Request, Response, NextFunction } from 'express';

describe('emptyBodyMiddleware', () => {
  const mockResponse = (): Response => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  const mockNext: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call next if request body is a valid object', () => {
    const req = { body: { key: 'value' } } as Partial<Request>;
    const res = mockResponse();

    emptyBodyMiddleware(req as Request, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 400 if body is missing', () => {
    const req = {} as Partial<Request>;
    const res = mockResponse();

    emptyBodyMiddleware(req as Request, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid request body' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 400 if body is not an object', () => {
    const req = { body: 'not-an-object' } as Partial<Request>;
    const res = mockResponse();

    emptyBodyMiddleware(req as Request, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid request body' });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
