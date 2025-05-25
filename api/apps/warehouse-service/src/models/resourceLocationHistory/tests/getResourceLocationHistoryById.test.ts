import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';

jest.mock('../../../prismaClient', () => ({
  resourceLocationHistory: {
    findUnique: jest.fn(),
  },
}));

const baseUrl = '/api/warehouse/resourceLocationHistories';

describe('GET /api/warehouse/resourceLocationHistories/:id (mocked)', () => {
  const historyId = 'hist-123';
  const endpoint = `${baseUrl}/${historyId}`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a single history record with locations and status 200', async () => {
    const mockHistory = {
      id: historyId,
      resourceId: 'res-1',
      fromLocation: { id: 'loc-a', name: 'Old Loc' },
      toLocation: { id: 'loc-b', name: 'New Loc' },
    };

    (prisma.resourceLocationHistory.findUnique as jest.Mock).mockResolvedValue(mockHistory);

    const res = await request(app).get(endpoint);

    expect(prisma.resourceLocationHistory.findUnique).toHaveBeenCalledWith({
      where: { id: historyId },
      include: {
        fromLocation: true,
        toLocation: true,
      },
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: historyId,
      fromLocation: { name: 'Old Loc' },
      toLocation: { name: 'New Loc' },
    });
  });

  it('should return 404 if record is not found', async () => {
    (prisma.resourceLocationHistory.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get(endpoint);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'History record not found' });
  });

  it('should return 500 on internal error', async () => {
    (prisma.resourceLocationHistory.findUnique as jest.Mock).mockRejectedValue(
      new Error('Something went wrong'),
    );

    const res = await request(app).get(endpoint);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
