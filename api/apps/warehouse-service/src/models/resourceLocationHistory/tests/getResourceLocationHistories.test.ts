import request from 'supertest';
import prisma from '../../../prismaClient';
import app from '../../../app';
import { v4 as uuid } from 'uuid';

const baseUrl = '/api/warehouse/resourceLocationHistories';

describe('GET /resourceLocationHistories', () => {
  let fromLocationId: string;
  let toLocationId: string;
  let resourceId: string;

  beforeEach(async () => {
    fromLocationId = uuid();
    toLocationId = uuid();
    resourceId = uuid();

    await prisma.resourceLocation.createMany({
      data: [
        { id: fromLocationId, name: `From-${fromLocationId}` },
        { id: toLocationId, name: `To-${toLocationId}` },
      ],
    });

    await prisma.resourceLocationHistory.create({
      data: {
        resourceId,
        fromLocationId,
        toLocationId,
      },
    });
  });

  afterEach(async () => {
    await prisma.resourceLocationHistory.deleteMany({
      where: { resourceId },
    });

    await prisma.resourceLocation.deleteMany({
      where: { id: { in: [fromLocationId, toLocationId] } },
    });
  });

  it('returns 200 and paginated history with locations', async () => {
    const res = await request(app).get(baseUrl);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toHaveProperty('fromLocation');
    expect(res.body.data[0]).toHaveProperty('toLocation');
  });

  it('filters by resourceId', async () => {
    const res = await request(app).get(`${baseUrl}?resourceId=${resourceId}`);

    expect(res.status).toBe(200);
    expect(res.body.data[0].resourceId).toBe(resourceId);
  });

  it('returns empty array for unmatched filter', async () => {
    const res = await request(app).get(`${baseUrl}?resourceId=nonexistent`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('returns 500 on internal error', async () => {
    const spy = jest
      .spyOn(prisma.resourceLocationHistory, 'findMany')
      .mockRejectedValueOnce(new Error('Fail'));

    const res = await request(app).get(baseUrl);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');

    spy.mockRestore();
  });
});
