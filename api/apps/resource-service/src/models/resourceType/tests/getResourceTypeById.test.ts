import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';
import { createTestUser, mockAccessToken } from '@libs/tests/setup';

const baseUrl = (id: string) => `/api/resource/resourceTypes/${id}`;
const testEmail = 'getuser@example.com';
const testPassword = 'Test1234!';

describe('GET /api/resource/resourceTypes/:id', () => {
  const unique = Date.now();
  const typeId = `type-${unique}`;
  const typeName = `Type Name ${unique}`;
  const typeCode = `TYPE-${unique}`;
  let createdTypeId: string;
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

    const createdType = await prisma.resourceType.create({
      data: {
        id: typeId,
        name: typeName,
        code: typeCode,
        resources: {
          create: [
            { name: 'Res A', code: `${typeCode}-001`, isActive: true },
            { name: 'Res B', code: `${typeCode}-002`, isActive: false },
          ],
        },
      },
    });

    createdTypeId = createdType.id;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: testUserId } });
    await prisma.resource.deleteMany({ where: { typeId } });
    await prisma.resourceType.delete({ where: { id: createdTypeId } });
  });

  it('should return 200 and resource type data if found', async () => {
    const res = await getRequest({ id: createdTypeId });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: createdTypeId,
      name: typeName,
      code: typeCode,
    });

    expect(Array.isArray(res.body.resources)).toBe(true);
    expect(res.body.resources).toHaveLength(2);
  });

  it('should return 404 if resource type not found', async () => {
    const res = await getRequest({ id: 'non-existent-id' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Resource not found' });
  });

  it('should return 500 on internal error', async () => {
    const spy = jest
      .spyOn(prisma.resourceType, 'findUnique')
      .mockRejectedValueOnce(new Error('DB FAIL'));

    const res = await getRequest({ id: createdTypeId });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');

    spy.mockRestore();
  });
});
