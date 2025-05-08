import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';
import { hashPassword } from '@libs/helpers/bcrypt';

jest.mock('../../../prismaClient', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

const baseUrl = '/api/user/users';

describe('POST /api/user/users (mocked)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const userInput = {
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'Secret123!',
  };

  it('should create a user and return 201', async () => {
    const mockHashed = 'hashed-password-123';
    const mockUser = {
      id: 'user-id-123',
      email: userInput.email,
      firstName: userInput.firstName,
      lastName: userInput.lastName,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (hashPassword as jest.Mock).mockResolvedValue(mockHashed);
    (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

    const res = await request(app).post(baseUrl).send(userInput);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: userInput.email } });
    expect(hashPassword).toHaveBeenCalledWith(userInput.password);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: { ...userInput, password: mockHashed },
      omit: { password: true },
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      email: userInput.email,
      firstName: userInput.firstName,
      lastName: userInput.lastName,
    });
    expect(res.body).not.toHaveProperty('password');
  });

  it('should return 409 if user already exists', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'existing-user' });

    const res = await request(app).post(baseUrl).send(userInput);

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'User with this email already exists' });
  });

  it('should return 500 on internal error', async () => {
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).post(baseUrl).send(userInput);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
