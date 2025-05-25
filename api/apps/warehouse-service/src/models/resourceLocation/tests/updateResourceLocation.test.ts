import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';

jest.mock('../../../prismaClient', () => ({
  resourceLocation: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
}));

const baseUrl = '/api/warehouse/resourceLocations';

describe('PATCH /api/warehouse/resourceLocations/:id (mocked)', () => {
  const locationId = 'loc-123';
  const endpoint = `${baseUrl}/${locationId}`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update resource location and return 200', async () => {
    const updateData = { name: 'New Name', description: 'Updated desc' };
    const existing = { id: locationId, name: 'Old Name' };
    const updated = { id: locationId, ...updateData };

    (prisma.resourceLocation.findUnique as jest.Mock).mockResolvedValue(existing);
    (prisma.resourceLocation.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.resourceLocation.update as jest.Mock).mockResolvedValue(updated);

    const res = await request(app).patch(endpoint).send(updateData);

    expect(prisma.resourceLocation.findUnique).toHaveBeenCalledWith({ where: { id: locationId } });
    expect(prisma.resourceLocation.findFirst).toHaveBeenCalledWith({
      where: { name: updateData.name, NOT: { id: locationId } },
    });
    expect(prisma.resourceLocation.update).toHaveBeenCalledWith({
      where: { id: locationId },
      data: updateData,
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(updateData);
  });

  it('should return 404 if location not found', async () => {
    (prisma.resourceLocation.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).patch(endpoint).send({ name: 'Name' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Resource location not found' });
  });

  it('should return 409 if name is already taken by another location', async () => {
    (prisma.resourceLocation.findUnique as jest.Mock).mockResolvedValue({ id: locationId });
    (prisma.resourceLocation.findFirst as jest.Mock).mockResolvedValue({ id: 'other-id' });

    const res = await request(app).patch(endpoint).send({ name: 'Duplicate Name' });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      error: 'Resource location with this name already exists.',
    });
  });

  it('should return 500 on internal error', async () => {
    (prisma.resourceLocation.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).patch(endpoint).send({ name: 'Any' });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
