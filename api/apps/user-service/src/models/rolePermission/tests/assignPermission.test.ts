import request from 'supertest';
import app from '../../../app';
import prisma from '@apps/user-service/src/prismaClient';

jest.mock('@apps/user-service/src/prismaClient', () => ({
  role: { findUnique: jest.fn() },
  permission: { findUnique: jest.fn() },
  rolePermission: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

const baseUrl = '/api/user/rolePermissions';

describe('POST /api/user/rolePermissions/role/:roleId/permission/:permissionId', () => {
  const roleId = 'role-123';
  const permissionId = 'perm-456';
  const endpoint = `${baseUrl}/role/${roleId}/permission/${permissionId}`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should assign permission to role and return 201', async () => {
    const mockAssignment = {
      id: 'assign-1',
      roleId,
      permissionId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.role.findUnique as jest.Mock).mockResolvedValue({ id: roleId });
    (prisma.permission.findUnique as jest.Mock).mockResolvedValue({ id: permissionId });
    (prisma.rolePermission.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.rolePermission.create as jest.Mock).mockResolvedValue(mockAssignment);

    const res = await request(app).post(endpoint);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ roleId, permissionId });
  });

  it('should return 400 if permission already assigned', async () => {
    (prisma.role.findUnique as jest.Mock).mockResolvedValue({ id: roleId });
    (prisma.permission.findUnique as jest.Mock).mockResolvedValue({ id: permissionId });
    (prisma.rolePermission.findUnique as jest.Mock).mockResolvedValue({ id: 'exists' });

    const res = await request(app).post(endpoint);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Permission already assigned to role' });
  });

  it('should return 404 if role not found', async () => {
    (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).post(endpoint);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Role not found' });
  });

  it('should return 404 if permission not found', async () => {
    (prisma.role.findUnique as jest.Mock).mockResolvedValue({ id: roleId });
    (prisma.permission.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).post(endpoint);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Permission not found' });
  });

  it('should return 500 on internal error', async () => {
    (prisma.role.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).post(endpoint);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
