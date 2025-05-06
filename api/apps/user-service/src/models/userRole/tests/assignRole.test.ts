import request from 'supertest';
import app from '../../../app';
import prisma from '@apps/user-service/src/prismaClient';

jest.mock('@apps/user-service/src/prismaClient', () => ({
  user: { findUnique: jest.fn() },
  role: { findUnique: jest.fn() },
  userRole: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

const baseUrl = '/api/user/userRoles';

describe('POST /api/user/roles/user/:userId/role/:roleId (mocked)', () => {
  const userId = 'user-123';
  const roleId = 'role-456';
  const endpoint = `${baseUrl}/user/${userId}/role/${roleId}`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should assign role to user and return 201', async () => {
    const mockAssignment = {
      id: 'assign-1',
      userId,
      roleId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: userId });
    (prisma.role.findUnique as jest.Mock).mockResolvedValue({ id: roleId });
    (prisma.userRole.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.userRole.create as jest.Mock).mockResolvedValue(mockAssignment);

    const res = await request(app).post(endpoint);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ userId, roleId });
  });

  it('should return 400 if user already has role', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: userId });
    (prisma.role.findUnique as jest.Mock).mockResolvedValue({ id: roleId });
    (prisma.userRole.findUnique as jest.Mock).mockResolvedValue({ id: 'exists' });

    const res = await request(app).post(endpoint);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'User already has this role' });
  });

  it('should return 404 if user not found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).post(endpoint);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'User not found' });
  });

  it('should return 404 if role not found', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: userId });
    (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).post(endpoint);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Role not found' });
  });

  it('should return 500 on prisma error', async () => {
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).post(endpoint);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
