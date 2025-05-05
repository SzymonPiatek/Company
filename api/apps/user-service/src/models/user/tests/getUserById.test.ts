import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';

jest.mock('../../../prismaClient', () => ({
  user: {
    findUnique: jest.fn(),
  },
}));

const baseUrl = '/api/user/users';

describe('GET /api/user/users/:id (mocked)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a user by ID with status 200', async () => {
    const userId = 'user-123';
    const mockUser = {
      id: userId,
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const res = await request(app).get(`${baseUrl}/${userId}`);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
      omit: { password: true },
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: userId,
      email: mockUser.email,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
    });
    expect(res.body).not.toHaveProperty('password');
  });

  it('should return 404 if user is not found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get(`${baseUrl}/nonexistent-id`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'User not found' });
  });

  it('should return 500 on internal error', async () => {
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('DB Error'));

    const res = await request(app).get(`${baseUrl}/error-id`);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
