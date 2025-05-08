import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';
import { hashPassword } from '@libs/helpers/bcrypt';

jest.mock('../../../prismaClient', () => ({
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}));

const baseUrl = '/api/user/users';

describe('PATCH /api/user/users/:id (mocked)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update user data and return 200', async () => {
    const userId = 'user-123';
    const updateData = {
      firstName: 'Updated',
      lastName: 'User',
    };

    const mockUser = {
      id: userId,
      email: 'user@example.com',
      ...updateData,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

    const res = await request(app).patch(`${baseUrl}/${userId}`).send(updateData);

    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: updateData,
      omit: { password: true },
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(updateData);
  });

  it('should hash password if provided', async () => {
    const userId = 'user-123';
    const newPassword = 'NewPass123!';
    const hashed = 'hashed-password';

    const mockUser = {
      id: userId,
      email: 'user@example.com',
      firstName: 'Name',
      lastName: 'Last',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (hashPassword as jest.Mock).mockResolvedValue(hashed);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

    const res = await request(app).patch(`${baseUrl}/${userId}`).send({ password: newPassword });

    expect(hashPassword).toHaveBeenCalledWith(newPassword);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: { password: hashed },
      omit: { password: true },
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', userId);
  });

  it('should return 409 if email is already taken by another user', async () => {
    const userId = 'user-123';
    const takenEmail = 'taken@example.com';

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'other-user-id' });

    const res = await request(app).patch(`${baseUrl}/${userId}`).send({ email: takenEmail });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: takenEmail, NOT: { id: userId } },
    });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'Email is already taken by another user' });
  });

  it('should return 500 on internal error', async () => {
    const userId = 'user-123';
    const email = 'fail@example.com';

    (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).patch(`${baseUrl}/${userId}`).send({ email });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email, NOT: { id: userId } },
    });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
