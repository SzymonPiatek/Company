import request from 'supertest';
import prisma from '../../../prismaClient';
import app from '../../../app';
import { createTestUser, mockAccessToken } from '@libs/tests/setup';

const baseUrl = '/api/resource/resources';
const testEmail = 'getuser@example.com';
const testPassword = 'Test1234!';

describe('POST /api/resource', () => {
  const uniqueSuffix = Date.now();
  const typeId = `type-${uniqueSuffix}`;
  const typeName = `Test Type ${uniqueSuffix}`;
  let testUserId: string;
  let accessToken: string;

  const postRequest = async (body: object) => {
    return await request(app)
      .post(baseUrl)
      .set('Authorization', `Bearer ${accessToken}`)
      .send(body);
  };

  beforeAll(async () => {
    const user = await createTestUser(prisma, {
      email: testEmail,
      password: testPassword,
    });

    testUserId = user.id;
    accessToken = mockAccessToken(testUserId);

    await prisma.resourceType.create({
      data: {
        id: typeId,
        code: 'RES',
        name: typeName,
      },
    });
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: testUserId } });
    await prisma.resource.deleteMany({ where: { typeId } });

    try {
      await prisma.resourceType.delete({ where: { id: typeId } });
    } catch (err) {
      console.log(err);
    }
  });

  it('should create a new resource and return 201', async () => {
    const res = await postRequest({
      name: 'New Resource',
      description: 'Test description',
      isActive: true,
      typeId,
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      name: 'New Resource',
      description: 'Test description',
      isActive: true,
      typeId,
    });
    expect(res.body.code).toMatch(/^RES-\d{6}$/);
  });

  it('should return 404 when resourceType not found', async () => {
    const res = await postRequest({
      name: 'Invalid Resource',
      typeId: 'nonexistent-type-id',
    });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Resource type not found' });
  });

  it('should return 500 on internal error', async () => {
    const spy = jest
      .spyOn(prisma.resourceType, 'findUnique')
      .mockRejectedValueOnce(new Error('DB error'));

    const res = await postRequest({
      name: 'Should Fail',
      typeId,
    });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');

    spy.mockRestore();
  });
});
