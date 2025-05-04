import request from 'supertest';
import prisma from '../../../prismaClient';
import app from '../../../app';
import { v4 as uuid } from 'uuid';
import { createTestUser, mockAccessToken } from '@libs/tests/setup';

const baseUrl = '/api/warehouse/resourceLocationHistories';
const testEmail = 'getuser@example.com';
const testPassword = 'Test1234!';

describe('GET /resourceLocationHistories', () => {
  let fromLocationId: string;
  let toLocationId: string;
  let resourceId: string;
  let testUserId: string;
  let accessToken: string;

  const getRequest = ({ params }: { params?: string }) =>
    request(app).get(`${baseUrl}?${params}`).set('Authorization', `Bearer ${accessToken}`);

  beforeAll(async () => {
    const user = await createTestUser(prisma, {
      email: testEmail,
      password: testPassword,
      firstName: 'Get',
      lastName: 'User',
    });

    testUserId = user.id;
    accessToken = mockAccessToken(testUserId);
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: testUserId } });
  });

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
    const res = await getRequest({});

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toHaveProperty('fromLocation');
    expect(res.body.data[0]).toHaveProperty('toLocation');
  });

  it('filters by resourceId', async () => {
    const res = await getRequest({ params: `resourceId=${resourceId}` });

    expect(res.status).toBe(200);
    expect(res.body.data[0].resourceId).toBe(resourceId);
  });

  it('returns empty array for unmatched filter', async () => {
    const res = await getRequest({ params: `resourceId=non-existent` });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('returns 500 on internal error', async () => {
    const spy = jest
      .spyOn(prisma.resourceLocationHistory, 'findMany')
      .mockRejectedValueOnce(new Error('Fail'));

    const res = await getRequest({});

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');

    spy.mockRestore();
  });
});
