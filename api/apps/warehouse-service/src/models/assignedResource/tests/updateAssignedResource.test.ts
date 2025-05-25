import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';

jest.mock('../../../prismaClient', () => ({
  $transaction: jest.fn(),
}));

const baseUrl = '/api/warehouse/assignedResources';

describe('PATCH /api/warehouse/assignedResources/:id (mocked)', () => {
  const assignedId = 'assign-123';
  const endpoint = `${baseUrl}/${assignedId}`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update location and create history record', async () => {
    const newLocationId = 'loc-999';

    const mockAssignedBefore = {
      id: assignedId,
      resourceId: 'res-1',
      locationId: 'loc-123',
    };

    const mockUpdated = {
      ...mockAssignedBefore,
      locationId: newLocationId,
    };

    (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => {
      const tx = {
        assignedResource: {
          findUnique: jest.fn().mockResolvedValue(mockAssignedBefore),
          update: jest.fn().mockResolvedValue(mockUpdated),
        },
        resourceLocationHistory: {
          create: jest.fn().mockResolvedValue({}),
        },
      };
      return await cb(tx);
    });

    const res = await request(app).patch(endpoint).send({ locationId: newLocationId });

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: assignedId,
      locationId: newLocationId,
    });
  });

  it('should return 400 if locationId is missing', async () => {
    const res = await request(app).patch(endpoint).send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Missing locationId in request body' });
  });

  it('should return 404 if assigned resource not found', async () => {
    (prisma.$transaction as jest.Mock).mockImplementation(async (cb) => {
      const tx = {
        assignedResource: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      };
      return await cb(tx);
    });

    const res = await request(app).patch(endpoint).send({ locationId: 'loc-new' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Assigned resource not found' });
  });

  it('should return 500 on internal error', async () => {
    (prisma.$transaction as jest.Mock).mockRejectedValue(new Error('Unexpected failure'));

    const res = await request(app).patch(endpoint).send({ locationId: 'loc-crash' });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
