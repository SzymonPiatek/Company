import prisma from '../../../prismaClient';
import request from 'supertest';
import app from '../../../app';
import { createTestUser, mockAccessToken } from '@libs/tests/setup';

const baseUrl = (id: string) => `/api/resource/resources/${id}`;
const testEmail = 'getuser@example.com';
const testPassword = 'Test1234!';

describe('GET /api/resource/resources/:id', () => {
  let testResourceId: string;
  const unique = Date.now();
  const typeId = `type-${unique}`;
  const typeName = `Test Type ${unique}`;
  const typeCode = `CODE-${unique}`;
  let testUserId: string;
  let accessToken: string;

  const getRequest = async ({ id }: { id: string }) => {
    return await request(app).get(baseUrl(id)).set('Authorization', `Bearer ${accessToken}`);
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
        code: typeCode,
        name: typeName,
      },
    });

    const resource = await prisma.resource.create({
      data: {
        name: 'Test Resource',
        code: `RES-${String(unique).slice(-6)}`,
        isActive: true,
        typeId,
      },
    });

    testResourceId = resource.id;
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

  it('should return 200 and the resource data if found', async () => {
    const res = await getRequest({ id: testResourceId });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: testResourceId,
      name: 'Test Resource',
      code: expect.stringMatching(/^RES-\d+$/),
      typeId,
    });
    expect(res.body.type).toBeDefined();
    expect(res.body.type.code).toBe(typeCode);
  });

  it('should return 404 if resource not found', async () => {
    const res = await getRequest({ id: 'non-existent-id' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Resource not found' });
  });

  it('should return 500 on internal server error', async () => {
    const spy = jest
      .spyOn(prisma.resource, 'findUnique')
      .mockRejectedValueOnce(new Error('DB fail'));

    const res = await getRequest({ id: 'something' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');

    spy.mockRestore();
  });
});
