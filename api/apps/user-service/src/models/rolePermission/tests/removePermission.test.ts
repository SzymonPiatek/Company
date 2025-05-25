import request from 'supertest';
import app from '../../../app';
import prisma from '@apps/user-service/src/prismaClient';

jest.mock('@apps/user-service/src/prismaClient', () => ({
  rolePermission: {
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
}));

const baseUrl = '/api/user/rolePermissions';

describe('DELETE /api/user/rolePermissions/role/:roleId/permission/:permissionId (mocked)', () => {
  const roleId = 'role-123';
  const permissionId = 'perm-456';
  const endpoint = `${baseUrl}/role/${roleId}/permission/${permissionId}`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delete the role-permission and return 204', async () => {
    (prisma.rolePermission.findUnique as jest.Mock).mockResolvedValue({ id: 'rp-1' });
    (prisma.rolePermission.delete as jest.Mock).mockResolvedValue(undefined);

    const res = await request(app).delete(endpoint);

    expect(prisma.rolePermission.findUnique).toHaveBeenCalledWith({
      where: { roleId_permissionId: { roleId, permissionId } },
    });
    expect(prisma.rolePermission.delete).toHaveBeenCalledWith({
      where: { roleId_permissionId: { roleId, permissionId } },
    });

    expect(res.status).toBe(204);
  });

  it('should return 400 if role-permission does not exist', async () => {
    (prisma.rolePermission.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).delete(endpoint);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Role permission not found' });
  });

  it('should return 500 on internal error', async () => {
    (prisma.rolePermission.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete(endpoint);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
