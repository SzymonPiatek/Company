import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';
import { createTestUser, mockAccessToken } from '@libs/tests/setup';

const baseUrl = '/api/resource/resourceTypes';
const testEmail = 'getuser@example.com';
const testPassword = 'Test1234!';

describe('GET /api/resource/resourceTypes', () => {
  const unique = Date.now();
  const typeName = `Resource Type ${unique}`;
  const typeCode = `TYPE-${unique}`;
  let testUserId: string;
  let accessToken: string;

  const getRequest = async ({ query }: { query?: object }) => {
    return await request(app)
      .get(baseUrl)
      .set('Authorization', `Bearer ${accessToken}`)
      .query(query ?? {});
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
        name: typeName,
        code: typeCode,
        resources: {
          create: [
            { name: 'R1', code: `${typeCode}-001`, isActive: true },
            { name: 'R2', code: `${typeCode}-002`, isActive: false },
          ],
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: testUserId } });
    await prisma.resource.deleteMany({
      where: { code: { contains: typeCode } },
    });
    await prisma.resourceType.deleteMany({ where: { code: typeCode } });
  });

  it('should return resource types with pagination', async () => {
    const res = await getRequest({});

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('resources');
  });

  it('should filter resource types by name', async () => {
    const res = await getRequest({ query: { name: typeName } });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe(typeName);
  });

  it('should return 500 on internal server error', async () => {
    const spy = jest
      .spyOn(prisma.resourceType, 'findMany')
      .mockRejectedValueOnce(new Error('DB FAIL'));

    const res = await getRequest({});

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');

    spy.mockRestore();
  });
});
