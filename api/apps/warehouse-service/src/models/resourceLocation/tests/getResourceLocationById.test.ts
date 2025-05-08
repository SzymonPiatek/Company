import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';
import axios from 'axios';

jest.mock('../../../prismaClient', () => ({
  resourceLocation: {
    findUnique: jest.fn(),
  },
  assignedResource: {
    findMany: jest.fn(),
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

const baseUrl = '/api/warehouse/resourceLocations';

describe('GET /api/warehouse/resourceLocations/:id (mocked)', () => {
  const locationId = 'loc-123';
  const endpoint = `${baseUrl}/${locationId}`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return location with enriched assigned resources', async () => {
    const mockLocation = {
      id: locationId,
      name: 'Main Warehouse',
      description: 'Main',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const assignedResources = [
      { id: 'ar-1', resourceId: 'res-1', locationId },
      { id: 'ar-2', resourceId: 'res-2', locationId },
    ];

    const mockResource1 = { id: 'res-1', name: 'Resource 1' };
    const mockResource2 = { id: 'res-2', name: 'Resource 2' };

    (prisma.resourceLocation.findUnique as jest.Mock).mockResolvedValue(mockLocation);
    (prisma.assignedResource.findMany as jest.Mock).mockResolvedValue(assignedResources);

    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('res-1')) return Promise.resolve({ data: mockResource1 });
      if (url.includes('res-2')) return Promise.resolve({ data: mockResource2 });
      return Promise.reject(new Error('Not found'));
    });

    const res = await request(app).get(endpoint);

    expect(prisma.resourceLocation.findUnique).toHaveBeenCalledWith({ where: { id: locationId } });
    expect(prisma.assignedResource.findMany).toHaveBeenCalledWith({ where: { locationId } });

    expect(mockedAxios.get).toHaveBeenCalledTimes(2);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', locationId);
    expect(res.body.assignedResources).toHaveLength(2);
    expect(res.body.assignedResources[0]).toHaveProperty('resource.name', 'Resource 1');
    expect(res.body.assignedResources[1]).toHaveProperty('resource.name', 'Resource 2');
  });

  it('should handle missing resource enrichment gracefully', async () => {
    const mockLocation = {
      id: locationId,
      name: 'Backup Warehouse',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const assignedResources = [{ id: 'ar-1', resourceId: 'missing-res', locationId }];

    (prisma.resourceLocation.findUnique as jest.Mock).mockResolvedValue(mockLocation);
    (prisma.assignedResource.findMany as jest.Mock).mockResolvedValue(assignedResources);

    mockedAxios.get.mockRejectedValueOnce(new Error('404 Not Found'));

    const res = await request(app).get(endpoint);

    expect(res.status).toBe(200);
    expect(res.body.assignedResources[0]).toHaveProperty('resource', null);
  });

  it('should return 404 if location not found', async () => {
    (prisma.resourceLocation.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get(endpoint);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Resource location not found' });
  });

  it('should return 500 on internal error', async () => {
    (prisma.resourceLocation.findUnique as jest.Mock).mockRejectedValue(new Error('DB failure'));

    const res = await request(app).get(endpoint);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
