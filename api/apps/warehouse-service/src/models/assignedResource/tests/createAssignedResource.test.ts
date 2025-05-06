import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';
import axios from 'axios';

jest.mock('../../../prismaClient', () => ({
  $transaction: jest.fn(),
  assignedResource: { create: jest.fn() },
  resourceLocationHistory: { create: jest.fn() },
}));

const baseUrl = '/api/warehouse/assignedResources';

describe('POST /api/warehouse/assignedResources (mocked)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const validPayload = {
    resourceId: 'res-123',
    locationId: 'loc-456',
  };

  it('should create assignedResource and return 201', async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: { id: validPayload.resourceId } });

    const mockAssigned = {
      id: 'assigned-1',
      ...validPayload,
      createdAt: new Date(),
    };

    (prisma.$transaction as jest.Mock).mockResolvedValueOnce([mockAssigned]);

    const res = await request(app).post(baseUrl).send(validPayload);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(validPayload);
  });

  it('should return 400 if resourceId or locationId is missing', async () => {
    const res = await request(app).post(baseUrl).send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'ResourceId and locationId are required' });
  });

  it('should return 404 if resource not found', async () => {
    (axios.get as jest.Mock).mockRejectedValueOnce(new Error('Not found'));

    const res = await request(app).post(baseUrl).send(validPayload);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Resource not found');
  });

  it('should return 404 if resource check returns empty data', async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: null });

    const res = await request(app).post(baseUrl).send(validPayload);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Resource not found');
  });

  it('should return 500 on internal error', async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: { id: validPayload.resourceId } });
    (prisma.$transaction as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).post(baseUrl).send(validPayload);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
