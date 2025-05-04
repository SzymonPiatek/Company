import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';
import { createTestUser, mockAccessToken } from '@libs/tests/setup';

const baseUrl = '/api/resource/resourceTypes';
const testEmail = 'getuser@example.com';
const testPassword = 'Test1234!';

describe('POST /api/resource/resourceTypes', () => {
  const unique = Date.now();
  const name = `TypeName ${unique}`;
  const code = `CODE-${unique}`;
  let testUserId: string;
  let accessToken: string;

  const postRequest = async ({ body }: { body: object }) => {
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
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: testUserId } });
  });

  afterEach(async () => {
    await prisma.resourceType.deleteMany({
      where: {
        OR: [{ name }, { code }],
      },
    });
  });

  it('should create a new resource type and return 201', async () => {
    const res = await postRequest({ body: { name, code } });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name, code });
  });

  it('should return 404 if name already exists', async () => {
    await postRequest({ body: { name, code } });

    const res = await postRequest({ body: { name, code: `CODE-${Date.now()}` } });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Resource name already exists');
  });

  it('should return 404 if code already exists', async () => {
    await postRequest({ body: { name, code } });

    const res = await postRequest({ body: { name: `Another Name ${Date.now()}`, code } });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Resource code already exists');
  });

  it('should return 500 on internal error', async () => {
    const spy = jest
      .spyOn(prisma.resourceType, 'findUnique')
      .mockRejectedValueOnce(new Error('DB fail'));

    const res = await postRequest({ body: { name: 'Fail', code: 'FAIL-CODE' } });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');

    spy.mockRestore();
  });
});
