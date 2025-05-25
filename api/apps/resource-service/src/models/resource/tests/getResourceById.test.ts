import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';

jest.mock('../../../prismaClient', () => ({
  resource: {
    findUnique: jest.fn(),
  },
}));

const baseUrl = '/api/resource/resources';

describe('GET /api/resource/resources/:id (mocked)', () => {
  const resourceId = 'res-123';
  const endpoint = `${baseUrl}/${resourceId}`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return resource with type and status 200', async () => {
    const mockResource = {
      id: resourceId,
      name: 'Test Resource',
      description: 'Some description',
      isActive: true,
      typeId: 'type-1',
      code: 'RES-000001',
      type: {
        id: 'type-1',
        name: 'Test Type',
        code: 'RES',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.resource.findUnique as jest.Mock).mockResolvedValue(mockResource);

    const res = await request(app).get(endpoint);

    expect(prisma.resource.findUnique).toHaveBeenCalledWith({
      where: { id: resourceId },
      include: { type: true },
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: mockResource.id,
      name: mockResource.name,
      type: {
        id: mockResource.type.id,
        name: mockResource.type.name,
      },
    });
  });

  it('should return 404 if resource not found', async () => {
    (prisma.resource.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get(endpoint);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Resource not found' });
  });

  it('should return 500 on internal error', async () => {
    (prisma.resource.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).get(endpoint);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
