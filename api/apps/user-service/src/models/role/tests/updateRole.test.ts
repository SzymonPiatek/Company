import request from 'supertest';
import app from '../../../app';
import prisma from '@apps/user-service/src/prismaClient';

jest.mock('@apps/user-service/src/prismaClient', () => ({
  role: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}));

const baseUrl = '/api/user/roles';

describe('PATCH /api/user/roles/:id (mocked)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update a role and return 200', async () => {
    const roleId = 'role-123';
    const updatedData = { name: 'Updated Role', description: 'Updated description' };

    const mockUpdatedRole = {
      id: roleId,
      ...updatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.role.update as jest.Mock).mockResolvedValue(mockUpdatedRole);

    const res = await request(app).patch(`${baseUrl}/${roleId}`).send(updatedData);

    expect(prisma.role.findUnique).toHaveBeenCalledWith({
      where: { name: updatedData.name, NOT: { id: roleId } },
    });

    expect(prisma.role.update).toHaveBeenCalledWith({
      where: { id: roleId },
      data: updatedData,
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(updatedData);
  });

  it('should return 409 if role with given name already exists', async () => {
    const roleId = 'role-123';
    const body = { name: 'Duplicate Role Name' };

    (prisma.role.findUnique as jest.Mock).mockResolvedValue({ id: 'other-role-id' });

    const res = await request(app).patch(`${baseUrl}/${roleId}`).send(body);

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'Role with this name already exists' });
  });

  it('should update role if name is not provided', async () => {
    const roleId = 'role-123';
    const updatedData = { description: 'Only description updated' };

    const mockUpdatedRole = {
      id: roleId,
      name: 'Existing Name',
      description: updatedData.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.role.update as jest.Mock).mockResolvedValue(mockUpdatedRole);

    const res = await request(app).patch(`${baseUrl}/${roleId}`).send(updatedData);

    expect(prisma.role.findUnique).not.toHaveBeenCalled();
    expect(prisma.role.update).toHaveBeenCalledWith({
      where: { id: roleId },
      data: updatedData,
    });

    expect(res.status).toBe(200);
    expect(res.body.description).toBe(updatedData.description);
  });

  it('should return 500 on internal error', async () => {
    const roleId = 'role-123';
    (prisma.role.findUnique as jest.Mock).mockRejectedValue(new Error('Unexpected error'));

    const res = await request(app).patch(`${baseUrl}/${roleId}`).send({ name: 'Any name' });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
