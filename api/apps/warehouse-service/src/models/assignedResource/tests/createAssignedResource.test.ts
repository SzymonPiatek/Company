import request from 'supertest';
import prisma from '../../../prismaClient';
import app from '../../../app';
import { v4 as uuid } from 'uuid';
import axios from 'axios';
import { createTestUser, mockAccessToken } from '@libs/tests/setup';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const baseUrl = '/api/warehouse/assignedResources';
const testEmail = 'getuser@example.com';
const testPassword = 'Test1234!';

describe('POST /assignedResources', () => {
  let locationId: string;
  let resourceId: string;
  let assignedResourceId: string | undefined;
  let historyId: string | undefined;
  let testUserId: string;
  let accessToken: string;

  const postRequest = (body: object) =>
    request(app).post(baseUrl).set('Authorization', `Bearer ${accessToken}`).send(body);

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
  });

  afterEach(async () => {
    if (assignedResourceId) {
      await prisma.assignedResource.delete({ where: { id: assignedResourceId } }).catch(() => {});
    }

    if (historyId) {
      await prisma.resourceLocationHistory.delete({ where: { id: historyId } }).catch(() => {});
    }

    await prisma.resourceLocation.delete({ where: { id: locationId } }).catch(() => {});
  });

  it('returns 201 and created assigned resource on success', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { id: resourceId } });

    const res = await postRequest({ resourceId, locationId });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.resourceId).toBe(resourceId);
    expect(res.body.locationId).toBe(locationId);

    assignedResourceId = res.body.id;

    const history = await prisma.resourceLocationHistory.findFirst({
      where: { resourceId },
    });

    if (history) historyId = history.id;
  });

  it('returns 400 if body is incomplete', async () => {
    const res = await postRequest({});
    expect(res.status).toBe(400);
  });

  it('returns 404 if resource not found', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: null });

    const res = await postRequest({ resourceId, locationId });

    expect(res.status).toBe(404);
  });

  it('returns 404 if axios throws error', async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error('Axios error'));

    const res = await postRequest({ resourceId, locationId });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Resource not found');
  });

  it('returns 500 on internal error', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { id: resourceId } });

    const spy = jest
      .spyOn(prisma, '$transaction')
      .mockRejectedValueOnce(new Error('Simulated failure'));

    const res = await postRequest({ resourceId, locationId });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');

    spy.mockRestore();
  });
});
