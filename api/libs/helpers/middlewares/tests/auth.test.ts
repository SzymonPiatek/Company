import { Request, Response, NextFunction } from 'express';
import { TokenExpiredError, verify } from 'jsonwebtoken';
import authMiddleware, { AuthenticatedRequest } from '../auth.middleware';
import { generateAccessToken, generateRefreshToken } from '../../jwt';

jest.mock('@libs/helpers/jwt');
jest.mock('jsonwebtoken');

const mockGenerateAccessToken = generateAccessToken as jest.Mock<string, [object]>;
const mockGenerateRefreshToken = generateRefreshToken as jest.Mock<string, [object]>;
const mockVerify = verify as jest.Mock<unknown, [string, string]>;

interface SetupOptions {
  accessToken?: string;
  refreshToken?: string;
  accessTokenThrows?: unknown;
  refreshTokenThrows?: unknown;
}

const setup = (opts: SetupOptions) => {
  const req = {
    headers: opts.accessToken ? { authorization: `Bearer ${opts.accessToken}` } : {},
    cookies: opts.refreshToken ? { refreshToken: opts.refreshToken } : {},
  } as unknown as AuthenticatedRequest;

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    setHeader: jest.fn(),
    cookie: jest.fn(),
  } as unknown as Response;

  const next = jest.fn() as NextFunction;

  if (opts.accessTokenThrows !== undefined) {
    mockVerify.mockImplementationOnce(() => {
      throw opts.accessTokenThrows;
    });
  } else if (opts.accessToken) {
    mockVerify.mockReturnValueOnce({ userId: 'user123' });
  }

  if (opts.refreshTokenThrows !== undefined) {
    mockVerify.mockImplementationOnce(() => {
      throw opts.refreshTokenThrows;
    });
  } else if (opts.refreshToken) {
    mockVerify.mockReturnValueOnce({ userId: 'user123' });
  }

  return { req, res, next };
};

describe('authMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ACCESS_TOKEN_SECRET = 'secret1';
    process.env.REFRESH_TOKEN_SECRET = 'secret2';
    process.env.NODE_ENV = 'test';
  });

  it('should reject when access token is missing', () => {
    const { req, res, next } = setup({});
    authMiddleware(req as Request, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid access token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject when access token is invalid', () => {
    const { req, res, next } = setup({
      accessToken: 'invalid',
      accessTokenThrows: new Error('invalid'),
    });

    authMiddleware(req as Request, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid access token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next when access token is valid', () => {
    const { req, res, next } = setup({
      accessToken: 'valid',
    });

    authMiddleware(req as Request, res, next);

    expect(req.user).toEqual({ userId: 'user123' });
    expect(next).toHaveBeenCalled();
  });

  it('should reject if refresh token is missing when access token expired', () => {
    const { req, res, next } = setup({
      accessToken: 'expired',
      accessTokenThrows: new TokenExpiredError('jwt expired', new Date()),
    });

    authMiddleware(req as Request, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Missing refresh token' });
  });

  it('should reject if refresh token is invalid', () => {
    const { req, res, next } = setup({
      accessToken: 'expired',
      refreshToken: 'bad-refresh',
      accessTokenThrows: new TokenExpiredError('jwt expired', new Date()),
      refreshTokenThrows: new Error('invalid refresh'),
    });

    authMiddleware(req as Request, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid refresh token' });
  });

  it('should generate new tokens if refresh token is valid', () => {
    mockGenerateAccessToken.mockReturnValue('newAccessToken');
    mockGenerateRefreshToken.mockReturnValue('newRefreshToken');

    const { req, res, next } = setup({
      accessToken: 'expired',
      refreshToken: 'valid-refresh',
      accessTokenThrows: new TokenExpiredError('jwt expired', new Date()),
    });

    authMiddleware(req as Request, res, next);

    expect(mockGenerateAccessToken).toHaveBeenCalled();
    expect(mockGenerateRefreshToken).toHaveBeenCalled();

    expect(res.setHeader).toHaveBeenCalledWith('Authorization', 'Bearer newAccessToken');
    expect(res.cookie).toHaveBeenCalledWith(
      'refreshToken',
      'newRefreshToken',
      expect.objectContaining({
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        path: '/api/auth/refresh',
      }),
    );

    expect(req.user).toEqual({ userId: 'user123' });
    expect(next).toHaveBeenCalled();
  });
});
