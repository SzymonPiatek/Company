import { sign } from 'jsonwebtoken';
import { generateAccessToken, generateRefreshToken } from '../jwt';

jest.mock('jsonwebtoken');

describe('JWT token generation', () => {
  const mockSign = sign as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ACCESS_TOKEN_SECRET = 'test-access-secret';
    process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';
    process.env.ACCESS_TOKEN_EXP = '15m';
    process.env.REFRESH_TOKEN_EXP = '7d';
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

  it('should throw if secret is undefined', () => {
    delete process.env.ACCESS_TOKEN_SECRET;

    expect(() => generateAccessToken({ userId: '789' })).toThrow();
  });
});
