import request from 'supertest';
import prisma from '../../../prismaClient';
import app from '../../../app';
import { v4 as uuid } from 'uuid';
import { createTestUser, mockAccessToken } from '@libs/tests/setup';

const baseUrl = (id: string) => `/api/warehouse/resourceLocations/${id}`;
const testEmail = 'getuser@example.com';
const testPassword = 'Test1234!';

describe('PATCH /resourceLocations/:id', () => {
  let locationAId: string;
  let locationBId: string;
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

    await prisma.resourceLocation.createMany({
      data: [
        { id: locationAId, name: 'Main A' },
        { id: locationBId, name: 'Main B' },
      ],
    });
  });

  afterEach(async () => {
    await prisma.assignedResource.deleteMany({
      where: { locationId: { in: [locationAId, locationBId] } },
    });
    await prisma.resourceLocationHistory.deleteMany({
      where: {
        OR: [
          { fromLocationId: { in: [locationAId, locationBId] } },
          { toLocationId: { in: [locationAId, locationBId] } },
        ],
      },
    });
    await prisma.resourceLocation.deleteMany({
      where: { id: { in: [locationAId, locationBId] } },
    });
  });

  it('should update the location name and return 200', async () => {
    const res = await patchRequest({ id: locationAId, body: { name: 'Updated A' } });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated A');
  });

  it('should return 409 if name is already taken', async () => {
    const res = await patchRequest({ id: locationAId, body: { name: 'Main B' } });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Resource location with this name already exists.');
  });

  it('should return 404 if resource location not found', async () => {
    const res = await patchRequest({ id: 'non-existent-id', body: { name: 'Whatever' } });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Resource location not found');
  });

  it('should return 500 on internal error', async () => {
    const spy = jest
      .spyOn(prisma.resourceLocation, 'update')
      .mockRejectedValueOnce(new Error('Simulated fail'));

    const res = await patchRequest({ id: locationAId, body: { description: 'Whatever' } });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');

    spy.mockRestore();
  });
});
