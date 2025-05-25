import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';

jest.mock('../../../prismaClient', () => ({
  assignedResource: {
    findUnique: jest.fn(),
  },
}));

const baseUrl = '/api/warehouse/assignedResources';

describe('GET /api/warehouse/assignedResources/:id (mocked)', () => {
  const assignedId = 'assigned-123';
  const endpoint = `${baseUrl}/${assignedId}`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return assigned resource with location and status 200', async () => {
    const mockAssigned = {
      id: assignedId,
      resourceId: 'res-1',
      locationId: 'loc-1',
      location: {
        id: 'loc-1',
        name: 'Main Warehouse',
      },
      createdAt: new Date(),
    };

    (prisma.assignedResource.findUnique as jest.Mock).mockResolvedValue(mockAssigned);

    const res = await request(app).get(endpoint);

    expect(prisma.assignedResource.findUnique).toHaveBeenCalledWith({
      where: { id: assignedId },
      include: { location: true },
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: assignedId,
      location: { name: 'Main Warehouse' },
    });
  });

  it('should return 404 if assigned resource not found', async () => {
    (prisma.assignedResource.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get(endpoint);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Assigned resource not found' });
  });

  it('should return 500 on internal error', async () => {
    (prisma.assignedResource.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).get(endpoint);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
