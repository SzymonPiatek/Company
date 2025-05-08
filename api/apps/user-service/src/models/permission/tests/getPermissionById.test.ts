import request from 'supertest';
import app from '../../../app';
import prisma from '@apps/user-service/src/prismaClient';

jest.mock('@apps/user-service/src/prismaClient', () => ({
  permission: {
    findUnique: jest.fn(),
  },
}));

const baseUrl = '/api/user/permissions';

describe('GET /api/user/permissions/:id (mocked)', () => {
  const permissionId = 'perm-123';
  const endpoint = `${baseUrl}/${permissionId}`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return permission by ID with status 200', async () => {
    const mockPermission = {
      id: permissionId,
      name: 'create_user',
      description: 'Allows user creation',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.permission.findUnique as jest.Mock).mockResolvedValue(mockPermission);

    const res = await request(app).get(endpoint);

    expect(prisma.permission.findUnique).toHaveBeenCalledWith({ where: { id: permissionId } });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: permissionId,
      name: mockPermission.name,
      description: mockPermission.description,
    });
  });

  it('should return 404 if permission not found', async () => {
    (prisma.permission.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get(endpoint);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Permission not found' });
  });

  it('should return 500 on internal error', async () => {
    (prisma.permission.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).get(endpoint);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
