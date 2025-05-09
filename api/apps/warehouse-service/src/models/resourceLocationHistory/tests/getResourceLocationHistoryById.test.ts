import request from 'supertest';
import prisma from '../../../prismaClient';
import app from '../../../app';
import { v4 as uuid } from 'uuid';
import { createTestUser, mockAccessToken } from '@libs/tests/setup';

const baseUrl = (id: string) => `/api/warehouse/resourceLocationHistories/${id}`;
const testEmail = 'getuser@example.com';
const testPassword = 'Test1234!';

describe('GET /resourceLocationHistories/:id', () => {
  let historyId: string;
  let fromLocationId: string;
  let toLocationId: string;
  let resourceId: string;
  let testUserId: string;
  let accessToken: string;

  const getRequest = (id: string) =>
    request(app).get(baseUrl(id)).set('Authorization', `Bearer ${accessToken}`);

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

    const history = await prisma.resourceLocationHistory.create({
      data: {
        resourceId,
        fromLocationId,
        toLocationId,
      },
    });

    historyId = history.id;
  });

  afterEach(async () => {
    await prisma.resourceLocationHistory.deleteMany({
      where: { id: historyId },
    });

    await prisma.resourceLocation.deleteMany({
      where: { id: { in: [fromLocationId, toLocationId] } },
    });
  });

  it('returns 200 and history record with relations', async () => {
    const res = await getRequest(historyId);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', historyId);
    expect(res.body.fromLocation).toBeDefined();
    expect(res.body.toLocation).toBeDefined();
  });

  it('returns 404 if record not found', async () => {
    const res = await getRequest('non-existent-id');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('History record not found');
  });

  it('returns 500 on internal error', async () => {
    const spy = jest
      .spyOn(prisma.resourceLocationHistory, 'findUnique')
      .mockRejectedValueOnce(new Error('Boom'));

    const res = await getRequest(historyId);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');

    spy.mockRestore();
  });
});
