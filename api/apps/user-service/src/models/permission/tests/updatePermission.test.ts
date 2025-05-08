import request from 'supertest';
import app from '../../../app';
import prisma from '@apps/user-service/src/prismaClient';

jest.mock('@apps/user-service/src/prismaClient', () => ({
  permission: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}));

const baseUrl = '/api/user/permissions';

describe('PATCH /api/user/permissions/:id (mocked)', () => {
  const permissionId = 'perm-123';
  const endpoint = `${baseUrl}/${permissionId}`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update a permission and return 200', async () => {
    const updatedData = {
      name: 'update_user',
      description: 'Updated description',
    };

    const mockUpdatedPermission = {
      id: permissionId,
      ...updatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.permission.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.permission.update as jest.Mock).mockResolvedValue(mockUpdatedPermission);

    const res = await request(app).patch(endpoint).send(updatedData);

    expect(prisma.permission.findUnique).toHaveBeenCalledWith({
      where: { name: updatedData.name, NOT: { id: permissionId } },
    });
    expect(prisma.permission.update).toHaveBeenCalledWith({
      where: { id: permissionId },
      data: updatedData,
    });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(updatedData);
  });

  it('should return 409 if permission name already exists', async () => {
    const duplicateName = 'existing_name';

    (prisma.permission.findUnique as jest.Mock).mockResolvedValue({
      id: 'other-id',
      name: duplicateName,
    });

    const res = await request(app).patch(endpoint).send({ name: duplicateName });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'Role with this name already exists' });
  });

  it('should skip name uniqueness check if name is not provided', async () => {
    const updatedData = { description: 'Only description changed' };

    (prisma.permission.update as jest.Mock).mockResolvedValue({
      id: permissionId,
      name: 'existing',
      description: updatedData.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app).patch(endpoint).send(updatedData);

    expect(prisma.permission.findUnique).not.toHaveBeenCalled();
    expect(prisma.permission.update).toHaveBeenCalledWith({
      where: { id: permissionId },
      data: updatedData,
    });
    expect(res.status).toBe(200);
  });

  it('should return 500 on internal error', async () => {
    (prisma.permission.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).patch(endpoint).send({ name: 'test' });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
