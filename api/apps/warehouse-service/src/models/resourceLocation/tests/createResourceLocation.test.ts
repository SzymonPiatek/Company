import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';
import { v4 as uuid } from 'uuid';
import { createTestUser, mockAccessToken } from '@libs/tests/setup';

const baseUrl = '/api/warehouse/resourceLocations';
const testEmail = 'getuser@example.com';
const testPassword = 'Test1234!';

describe('POST /resourceLocations', () => {
  let locationName: string;
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

  beforeEach(() => {
    locationName = `Loc-${uuid()}`;
  });

  afterEach(async () => {
    await prisma.resourceLocation.deleteMany({
      where: {
        name: {
          startsWith: 'Loc-',
        },
      },
    });
  });

  it('should create a new resource location and return 201', async () => {
    const res = await postRequest({ name: locationName, description: 'Test description' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: locationName,
      description: 'Test description',
    });
  });

  it('should return 409 if location name already exists', async () => {
    await prisma.resourceLocation.create({
      data: { name: locationName },
    });

    const res = await postRequest({ name: locationName });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Resource location with this name already exists.');
  });

  it('should return 500 on internal error', async () => {
    const spy = jest
      .spyOn(prisma.resourceLocation, 'findUnique')
      .mockRejectedValueOnce(new Error('Simulated crash'));

    const res = await postRequest({ name: locationName });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');

    spy.mockRestore();
  });
});
