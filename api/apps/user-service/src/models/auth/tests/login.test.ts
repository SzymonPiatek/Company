import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';
import { comparePassword } from '@libs/helpers/bcrypt';
import { generateAccessToken, generateRefreshToken } from '@libs/helpers/jwt';

jest.mock('../../../prismaClient', () => ({
  user: {
    findUnique: jest.fn(),
  },
}));

const baseUrl = '/api/user/auth/login';

describe('POST /api/auth/login (mocked)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const validCredentials = {
    email: 'test@example.com',
    password: 'Test123!',
  };

  const mockUser = {
    id: 'user-123',
    email: validCredentials.email,
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashed-pass',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should return 200 and access token when login is successful', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (comparePassword as jest.Mock).mockResolvedValue(true);
    (generateAccessToken as jest.Mock).mockReturnValue('access-token');
    (generateRefreshToken as jest.Mock).mockReturnValue('refresh-token');

    const res = await request(app).post(baseUrl).send(validCredentials);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken', 'access-token');
    expect(res.body.user).toMatchObject({
      id: mockUser.id,
      email: mockUser.email,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
    });
    expect(res.body.user).not.toHaveProperty('password');

    expect(res.headers['set-cookie'][0]).toMatch(/refreshToken=refresh-token/);
  });

  it('should return 400 if email or password is missing', async () => {
    const res = await request(app).post(baseUrl).send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Email and password are required' });
  });

  it('should return 401 if user not found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).post(baseUrl).send(validCredentials);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Invalid email or password' });
  });

  it('should return 401 if password is invalid', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (comparePassword as jest.Mock).mockResolvedValue(false);

    const res = await request(app).post(baseUrl).send(validCredentials);

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Invalid email or password' });
  });

  it('should return 500 on internal error', async () => {
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).post(baseUrl).send(validCredentials);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
