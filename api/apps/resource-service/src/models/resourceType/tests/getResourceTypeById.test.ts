import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';

jest.mock('../../../prismaClient', () => ({
  resourceType: {
    findUnique: jest.fn(),
  },
}));

const baseUrl = '/api/resource/resourceTypes';

describe('GET /api/resource/resourceTypes/:id (mocked)', () => {
  const resourceTypeId = 'type-123';
  const endpoint = `${baseUrl}/${resourceTypeId}`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return resource type with resources and status 200', async () => {
    const mockResourceType = {
      id: resourceTypeId,
      name: 'Test Type',
      code: 'RES',
      resources: [
        {
          id: 'res-1',
          name: 'Resource A',
          typeId: resourceTypeId,
          code: 'RES-000001',
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.resourceType.findUnique as jest.Mock).mockResolvedValue(mockResourceType);

    const res = await request(app).get(endpoint);

    expect(prisma.resourceType.findUnique).toHaveBeenCalledWith({
      where: { id: resourceTypeId },
      include: { resources: true },
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: resourceTypeId,
      name: 'Test Type',
      resources: [
        {
          name: 'Resource A',
          code: 'RES-000001',
        },
      ],
    });
  });

  it('should return 404 if resource type not found', async () => {
    (prisma.resourceType.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get(endpoint);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Resource not found' });
  });

  it('should return 500 on internal error', async () => {
    (prisma.resourceType.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).get(endpoint);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
