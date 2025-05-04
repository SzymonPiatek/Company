import request from 'supertest';
import prisma from '../../../prismaClient';
import app from '../../../app';
import { v4 as uuid } from 'uuid';
import { createTestUser, mockAccessToken } from '@libs/tests/setup';

const baseUrl = (id: string) => `/api/warehouse/assignedResources/${id}`;
const testEmail = 'getuser@example.com';
const testPassword = 'Test1234!';

describe('GET /assignedResources/:id', () => {
  let assignedId: string;
  let locationId: string;
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
    locationId = uuid();
    resourceId = uuid();

    await prisma.resourceLocation.create({
      data: { id: locationId, name: `Loc-${locationId}` },
    });

    const assigned = await prisma.assignedResource.create({
      data: { resourceId, locationId },
    });

    assignedId = assigned.id;
  });

  afterEach(async () => {
    await prisma.resourceLocationHistory.deleteMany({ where: { resourceId } }).catch(() => {});
    await prisma.assignedResource.delete({ where: { id: assignedId } }).catch(() => {});
    await prisma.resourceLocation.delete({ where: { id: locationId } }).catch(() => {});
  });

  it('returns 200 and assigned resource', async () => {
    const res = await getRequest(assignedId);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', assignedId);
    expect(res.body.location).toHaveProperty('id', locationId);
  });

  it('returns 404 if not found', async () => {
    const res = await getRequest('non-existent-id');

    expect(res.status).toBe(404);
  });

  it('returns 500 on internal error', async () => {
    const spy = jest
      .spyOn(prisma.assignedResource, 'findUnique')
      .mockRejectedValueOnce(new Error('Something went wrong'));

    const res = await getRequest('boom');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');

    spy.mockRestore();
  });
});
