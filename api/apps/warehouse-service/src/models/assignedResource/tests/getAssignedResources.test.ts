import request from 'supertest';
import prisma from '../../../prismaClient';
import app from '../../../app';
import { v4 as uuid } from 'uuid';
import { createTestUser, mockAccessToken } from '@libs/tests/setup';

const baseUrl = '/api/warehouse/assignedResources';
const testEmail = 'getuser@example.com';
const testPassword = 'Test1234!';

describe('GET /assignedResources', () => {
  let locationId: string;
  let resourceId: string;
  let assignedId: string;
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
    locationId = uuid();
    resourceId = uuid();

    await prisma.resourceLocation.create({
      data: { id: locationId, name: `Location-${locationId}` },
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

  it('returns list of assigned resources with location', async () => {
    const res = await getRequest({});

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toHaveProperty('location');
  });

  it('filters by resourceId', async () => {
    const res = await getRequest({ params: `resourceId=${resourceId}` });

    expect(res.status).toBe(200);
    expect(res.body.data[0].resourceId).toBe(resourceId);
  });

  it('filters by locationId', async () => {
    const res = await getRequest({ params: `locationId=${locationId}` });

    expect(res.status).toBe(200);
    expect(res.body.data[0].locationId).toBe(locationId);
  });

  it('returns empty array for unmatched filters', async () => {
    const res = await getRequest({ params: `resourceId=nonexistent` });

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('returns 500 on internal error', async () => {
    const spy = jest
      .spyOn(prisma.assignedResource, 'findMany')
      .mockRejectedValueOnce(new Error('Boom'));

    const res = await getRequest({});

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');

    spy.mockRestore();
  });
});
