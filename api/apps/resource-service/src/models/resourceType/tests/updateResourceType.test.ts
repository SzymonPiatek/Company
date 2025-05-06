import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';

jest.mock('../../../prismaClient', () => ({
  $transaction: jest.fn(),
  resourceType: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  resource: {
    findMany: jest.fn(),
    update: jest.fn(),
  },
}));

const baseUrl = '/api/resource/resourceTypes';

describe('PATCH /api/resource/resourceTypes/:id (mocked)', () => {
  const typeId = 'type-123';
  const endpoint = `${baseUrl}/${typeId}`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should update resource type and update codes if code changed', async () => {
    const existingType = {
      id: typeId,
      name: 'Old Name',
      code: 'OLD',
    };

    const newData = {
      name: 'New Name',
      code: 'NEW',
    };

    const updatedType = { ...existingType, ...newData };

    const associatedResources = [
      { id: 'res-1', code: 'OLD-000001', typeId },
      { id: 'res-2', code: 'OLD-000002', typeId },
    ];

    (prisma.resourceType.findUnique as jest.Mock).mockResolvedValue(existingType);
    (prisma.resourceType.findFirst as jest.Mock).mockResolvedValue(null); // no conflict

    (prisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => {
      const tx = {
        resourceType: {
          update: jest.fn().mockResolvedValue(updatedType),
        },
        resource: {
          findMany: jest.fn().mockResolvedValue(associatedResources),
          update: jest.fn().mockImplementation(({ where, data }) => ({
            ...associatedResources.find((r) => r.id === where.id),
            ...data,
          })),
        },
      };
      return await cb(tx);
    });

    const res = await request(app).patch(endpoint).send(newData);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(updatedType);
  });

  it('should return 404 if resource type not found', async () => {
    (prisma.resourceType.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).patch(endpoint).send({ name: 'Any', code: 'ANY' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'ResourceType not found' });
  });

  it('should return 409 if name already exists', async () => {
    (prisma.resourceType.findUnique as jest.Mock).mockResolvedValue({
      id: typeId,
      name: 'Old',
      code: 'RES',
    });

    (prisma.resourceType.findFirst as jest.Mock).mockResolvedValueOnce({ id: 'other-id' });

    const res = await request(app).patch(endpoint).send({ name: 'Existing', code: 'RES' });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'Resource name already exists' });
  });

  it('should return 500 on prisma error', async () => {
    (prisma.resourceType.findUnique as jest.Mock).mockRejectedValue(new Error('DB fail'));

    const res = await request(app).patch(endpoint).send({ name: 'Test', code: 'TST' });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
