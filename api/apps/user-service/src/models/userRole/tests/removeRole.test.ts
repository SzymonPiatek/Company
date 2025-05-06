import request from 'supertest';
import app from '../../../app';
import prisma from '@apps/user-service/src/prismaClient';

jest.mock('@apps/user-service/src/prismaClient', () => ({
  userRole: {
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
}));

const baseUrl = '/api/user/userRoles';
const userId = 'user-123';
const roleId = 'role-456';
const endpoint = `${baseUrl}/user/${userId}/role/${roleId}`;

describe('DELETE /api/user/userRoles/user/:userId/role/:roleId (mocked)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 204 if role is removed successfully', async () => {
    (prisma.userRole.findUnique as jest.Mock).mockResolvedValue({ userId, roleId });
    (prisma.userRole.delete as jest.Mock).mockResolvedValue({});

    const res = await request(app).delete(endpoint);

    expect(prisma.userRole.findUnique).toHaveBeenCalledWith({
      where: { userId_roleId: { userId, roleId } },
    });

    expect(prisma.userRole.delete).toHaveBeenCalledWith({
      where: { userId_roleId: { userId, roleId } },
    });

    expect(res.status).toBe(204);
  });

  it('should return 400 if user does not have the role', async () => {
    (prisma.userRole.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete(endpoint);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'User have not this role' });
  });

  it('should return 500 on internal error', async () => {
    (prisma.userRole.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete(endpoint);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
