import request from 'supertest';
import prisma from '../../../prismaClient';
import app from '../../../app';
import { v4 as uuid } from 'uuid';
import { createTestUser, mockAccessToken } from '@libs/tests/setup';

const baseUrl = (id: string) => `/api/warehouse/assignedResources/${id}`;
const testEmail = 'getuser@example.com';
const testPassword = 'Test1234!';

describe('PATCH /assignedResources/:id', () => {
  let locationAId: string;
  let locationBId: string;
  let assignedId: string;
  let resourceId: string;
  let testUserId: string;
  let accessToken: string;

  const patchRequest = ({ id, body }: { id: string; body: object }) =>
    request(app).patch(baseUrl(id)).set('Authorization', `Bearer ${accessToken}`).send(body);

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
    locationAId = uuid();
    locationBId = uuid();
    resourceId = uuid();

    await prisma.resourceLocation.createMany({
      data: [
        { id: locationAId, name: `LocA-${locationAId}` },
        { id: locationBId, name: `LocB-${locationBId}` },
      ],
    });

    const assigned = await prisma.assignedResource.create({
      data: { resourceId, locationId: locationAId },
    });

    assignedId = assigned.id;
  });

  afterEach(async () => {
    await prisma.resourceLocationHistory.deleteMany({ where: { resourceId } });
    await prisma.assignedResource.delete({ where: { id: assignedId } }).catch(() => {});
    await prisma.resourceLocation.deleteMany({
      where: {
        id: { in: [locationAId, locationBId] },
      },
    });
  });

  it('updates locationId and returns updated object', async () => {
    const res = await patchRequest({ id: assignedId, body: { locationId: locationBId } });

    expect(res.status).toBe(200);
    expect(res.body.locationId).toBe(locationBId);
  });

  it('returns 400 if locationId missing', async () => {
    const res = await patchRequest({ id: assignedId, body: {} });

    expect(res.status).toBe(400);
  });

  it('returns 404 if resource not found', async () => {
    const res = await patchRequest({ id: 'nonexistent-id', body: { locationId: locationBId } });

    expect(res.status).toBe(404);
  });

  it('returns 500 on internal error', async () => {
    const spy = jest.spyOn(prisma, '$transaction').mockRejectedValueOnce(new Error('fail'));

    const res = await patchRequest({ id: assignedId, body: { locationId: locationBId } });

    expect(res.status).toBe(500);
    spy.mockRestore();
  });
});
