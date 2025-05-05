import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';

jest.mock('../../../prismaClient', () => ({
  resourceType: {
    findUnique: jest.fn(),
  },
  resource: {
    count: jest.fn(),
    create: jest.fn(),
  },
}));

const baseUrl = '/api/resource/resources';

describe('POST /api/resource/resources (mocked)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const resourceInput = {
    name: 'Test Resource',
    description: 'Some description',
    isActive: true,
    typeId: 'type-123',
  };

  it('should create a resource and return 201 with generated code', async () => {
    const resourceType = {
      id: 'type-123',
      code: 'RES',
      name: 'Test Type',
    };

    const mockCreatedResource = {
      id: 'res-1',
      code: 'RES-000005',
      ...resourceInput,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.resourceType.findUnique as jest.Mock).mockResolvedValue(resourceType);
    (prisma.resource.count as jest.Mock).mockResolvedValue(4); // to generate RES-000005
    (prisma.resource.create as jest.Mock).mockResolvedValue(mockCreatedResource);

    const res = await request(app).post(baseUrl).send(resourceInput);

    expect(prisma.resourceType.findUnique).toHaveBeenCalledWith({
      where: { id: resourceInput.typeId },
    });
    expect(prisma.resource.count).toHaveBeenCalledWith({ where: { typeId: resourceInput.typeId } });
    expect(prisma.resource.create).toHaveBeenCalledWith({
      data: {
        ...resourceInput,
        code: 'RES-000005',
      },
    });

    expect(res.status).toBe(201);
    expect(res.body.code).toBe('RES-000005');
    expect(res.body.name).toBe(resourceInput.name);
  });

  it('should return 404 if resource type not found', async () => {
    (prisma.resourceType.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).post(baseUrl).send(resourceInput);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Resource type not found' });
  });

  it('should return 500 on internal error', async () => {
    (prisma.resourceType.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).post(baseUrl).send(resourceInput);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
