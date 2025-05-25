import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';

jest.mock('../../../prismaClient', () => ({
  resourceLocation: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

const baseUrl = '/api/warehouse/resourceLocations';

describe('POST /api/warehouse/resourceLocations (mocked)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new resource location and return 201', async () => {
    const payload = { name: 'Main Warehouse', description: 'Main site storage' };
    const mockCreated = { id: 'loc-123', ...payload, createdAt: new Date(), updatedAt: new Date() };

    (prisma.resourceLocation.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.resourceLocation.create as jest.Mock).mockResolvedValue(mockCreated);

    const res = await request(app).post(baseUrl).send(payload);

    expect(prisma.resourceLocation.findUnique).toHaveBeenCalledWith({
      where: { name: payload.name },
    });
    expect(prisma.resourceLocation.create).toHaveBeenCalledWith({ data: payload });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(payload);
  });

  it('should return 409 if location with same name exists', async () => {
    const payload = { name: 'Duplicate Location' };
    (prisma.resourceLocation.findUnique as jest.Mock).mockResolvedValue({ id: 'existing' });

    const res = await request(app).post(baseUrl).send(payload);

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      error: 'Resource location with this name already exists.',
    });
  });

  it('should return 500 on internal error', async () => {
    const payload = { name: 'Broken' };
    (prisma.resourceLocation.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).post(baseUrl).send(payload);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
