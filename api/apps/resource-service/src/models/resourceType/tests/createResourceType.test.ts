import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';

jest.mock('../../../prismaClient', () => ({
  resourceType: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

const baseUrl = '/api/resource/resourceTypes';

describe('POST /api/resource/resourceTypes (mocked)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const payload = {
    name: 'Test Type',
    code: 'TEST',
  };

  it('should create a resource type and return 201', async () => {
    (prisma.resourceType.findUnique as jest.Mock).mockResolvedValueOnce(null); // name
    (prisma.resourceType.findUnique as jest.Mock).mockResolvedValueOnce(null); // code

    const mockType = {
      id: 'type-123',
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.resourceType.create as jest.Mock).mockResolvedValue(mockType);

    const res = await request(app).post(baseUrl).send(payload);

    expect(prisma.resourceType.findUnique).toHaveBeenNthCalledWith(1, {
      where: { name: payload.name },
    });
    expect(prisma.resourceType.findUnique).toHaveBeenNthCalledWith(2, {
      where: { code: payload.code },
    });
    expect(prisma.resourceType.create).toHaveBeenCalledWith({ data: payload });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(payload);
  });

  it('should return 404 if resource name already exists', async () => {
    (prisma.resourceType.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'existing-id' });

    const res = await request(app).post(baseUrl).send(payload);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Resource name already exists' });
  });

  it('should return 404 if resource code already exists', async () => {
    (prisma.resourceType.findUnique as jest.Mock).mockResolvedValueOnce(null);
    (prisma.resourceType.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'existing-id' });

    const res = await request(app).post(baseUrl).send(payload);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Resource code already exists' });
  });

  it('should return 500 on internal error', async () => {
    (prisma.resourceType.findUnique as jest.Mock).mockRejectedValue(new Error('DB Error'));

    const res = await request(app).post(baseUrl).send(payload);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
