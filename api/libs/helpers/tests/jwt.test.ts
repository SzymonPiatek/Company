jest.mock('jsonwebtoken');

process.env.ACCESS_TOKEN_SECRET = 'test-access-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';
process.env.ACCESS_TOKEN_EXP = '15m';
process.env.REFRESH_TOKEN_EXP = '7d';

import { sign } from 'jsonwebtoken';
import { generateAccessToken, generateRefreshToken } from '../jwt';

describe('JWT token generation', () => {
  const mockSign = sign as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate access token with correct params', () => {
    mockSign.mockReturnValue('access-token');

    const result = generateAccessToken({ userId: '123' });

    expect(mockSign).toHaveBeenCalledWith({ sub: '123' }, 'test-access-secret', {
      expiresIn: '15m',
    });
    expect(result).toBe('access-token');
  });

  it('should generate refresh token with correct params', () => {
    mockSign.mockReturnValue('refresh-token');

    const result = generateRefreshToken({ userId: '456' });

    expect(mockSign).toHaveBeenCalledWith({ sub: '456' }, 'test-refresh-secret', {
      expiresIn: '7d',
    });
    expect(result).toBe('refresh-token');
  });

  it('should throw if access token secret is undefined at runtime', () => {
    const originalSecret = process.env.ACCESS_TOKEN_SECRET;
    const originalExp = process.env.ACCESS_TOKEN_EXP;

    delete process.env.ACCESS_TOKEN_SECRET;

    jest.resetModules();
    const { generateAccessToken } = require('../jwt');

    expect(() => {
      generateAccessToken({ userId: 'xyz' });
    }).toThrow('Missing ACCESS_TOKEN_SECRET or EXP');

    process.env.ACCESS_TOKEN_SECRET = originalSecret;
    process.env.ACCESS_TOKEN_EXP = originalExp;
  });

  it('should throw if refresh token secret is undefined at runtime', () => {
    const originalSecret = process.env.REFRESH_TOKEN_SECRET;
    const originalExp = process.env.REFRESH_TOKEN_EXP;

    delete process.env.REFRESH_TOKEN_SECRET;

    jest.resetModules();
    const { generateRefreshToken } = require('../jwt');

    expect(() => {
      generateRefreshToken({ userId: 'xyz' });
    }).toThrow('Missing REFRESH_TOKEN_SECRET or EXP');

    process.env.REFRESH_TOKEN_SECRET = originalSecret;
    process.env.REFRESH_TOKEN_EXP = originalExp;
  });
});
