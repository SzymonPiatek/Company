import request from 'supertest';
import prisma from '../../../prismaClient';
import app from '../../../app';
import { v4 as uuid } from 'uuid';
import axios from 'axios';
import { createTestUser, mockAccessToken } from '@libs/tests/setup';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const baseUrl = (id: string) => `/api/warehouse/resourceLocations/${id}`;
const testEmail = 'getuser@example.com';
const testPassword = 'Test1234!';

describe('GET /resourceLocations/:id', () => {
  let locationId: string;
  let resourceId: string;
  let assignedId: string;
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
      data: {
        id: locationId,
        name: `Loc-${locationId}`,
      },
    });

    const assigned = await prisma.assignedResource.create({
      data: {
        resourceId,
        locationId,
      },
    });

    assignedId = assigned.id;

    mockedAxios.get.mockResolvedValue({
      data: {
        id: resourceId,
        name: 'Sample Resource',
      },
    });
  });

  afterEach(async () => {
    await prisma.resourceLocationHistory.deleteMany({ where: { resourceId } });
    await prisma.assignedResource.delete({ where: { id: assignedId } }).catch(() => {});
    await prisma.resourceLocation.delete({ where: { id: locationId } }).catch(() => {});
    jest.clearAllMocks();
  });

  it('should return 200 and resource location with enriched assignedResources', async () => {
    const res = await getRequest(locationId);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', locationId);
    expect(res.body.assignedResources).toBeInstanceOf(Array);
    expect(res.body.assignedResources[0]).toHaveProperty('resource');
    expect(res.body.assignedResources[0].resource).toMatchObject({
      id: resourceId,
      name: 'Sample Resource',
    });
  });

  it('should return 404 if resource location not found', async () => {
    const res = await getRequest('non-existent-id');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Resource location not found');
  });

  it('should return 200 and null resource if resource fetch fails', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Not found'));

    const res = await getRequest(locationId);

    expect(res.status).toBe(200);
    expect(res.body.assignedResources[0]).toHaveProperty('resource', null);
  });

  it('should return 500 on internal error', async () => {
    const spy = jest
      .spyOn(prisma.resourceLocation, 'findUnique')
      .mockRejectedValueOnce(new Error('DB Crash'));

    const res = await getRequest(locationId);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');

    spy.mockRestore();
  });
});
