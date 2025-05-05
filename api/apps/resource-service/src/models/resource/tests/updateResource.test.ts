import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';

jest.mock('../../../prismaClient', () => ({
  resource: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  resourceType: {
    findUnique: jest.fn(),
  },
}));

const baseUrl = '/api/resource/resources';

describe('PATCH /api/resource/resources/:id (mocked)', () => {
  const resourceId = 'res-123';
  const resourceTypeId = 'type-abc';
  const endpoint = `${baseUrl}/${resourceId}`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update a resource and return 200', async () => {
    const mockResource = {
      id: resourceId,
      name: 'Old Name',
      description: 'Old Description',
      isActive: true,
      typeId: resourceTypeId,
    };

    const updateData = {
      name: 'New Name',
      description: 'Updated description',
      isActive: false,
      typeId: resourceTypeId,
    };

    const updatedResource = {
      ...mockResource,
      ...updateData,
      updatedAt: new Date(),
    };

    (prisma.resource.findUnique as jest.Mock).mockResolvedValue(mockResource);
    (prisma.resourceType.findUnique as jest.Mock).mockResolvedValue({ id: resourceTypeId });
    (prisma.resource.update as jest.Mock).mockResolvedValue(updatedResource);

    const res = await request(app).patch(endpoint).send(updateData);

    expect(prisma.resource.findUnique).toHaveBeenCalledWith({ where: { id: resourceId } });
    expect(prisma.resourceType.findUnique).toHaveBeenCalledWith({ where: { id: resourceTypeId } });
    expect(prisma.resource.update).toHaveBeenCalledWith({
      where: { id: resourceId },
      data: updateData,
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(updateData);
  });

  it('should return 404 if resource not found', async () => {
    (prisma.resource.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).patch(endpoint).send({ name: 'Test' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Resource not found' });
  });

  it('should return 404 if resource type not found', async () => {
    (prisma.resource.findUnique as jest.Mock).mockResolvedValue({ id: resourceId });
    (prisma.resourceType.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).patch(endpoint).send({ typeId: resourceTypeId });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Resource type not found' });
  });

  it('should return 500 on internal error', async () => {
    (prisma.resource.findUnique as jest.Mock).mockRejectedValue(new Error('DB Error'));

    const res = await request(app).patch(endpoint).send({ name: 'Something' });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
