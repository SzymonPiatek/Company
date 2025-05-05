import request from 'supertest';
import prisma from '../../../prismaClient';
import app from '../../../app';
import { createTestUser, mockAccessToken } from '@libs/tests/setup';

const baseUrl = '/api/user/roles';
const testEmail = 'createrole@example.com';
const testPassword = 'Test1234!';

describe('POST /api/user/roles', () => {
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
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: testUserId } });
    await prisma.role.deleteMany({ where: { name: { contains: 'Test Role' } } });
  });

  it('should create a new role and return 201', async () => {
    const res = await postRequest({
      name: `Test Role ${Date.now()}`,
      description: 'Test description',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toMatchObject({
      name: expect.stringMatching(/^Test Role/),
      description: 'Test description',
    });
  });

  it('should return 400 if name is missing', async () => {
    const res = await postRequest({ description: 'Missing name' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual('Name is required');
  });

  it('should return 400 if role with same name exists', async () => {
    const roleName = `Test Role Duplicate ${Date.now()}`;

    await prisma.role.create({ data: { name: roleName } });

    const res = await postRequest({ name: roleName });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Role with this name already exists' });
  });

  it('should return 500 on internal error', async () => {
    const spy = jest.spyOn(prisma.role, 'findUnique').mockRejectedValueOnce(new Error('DB error'));

    const res = await postRequest({ name: `Test Role ${Date.now()}` });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');

    spy.mockRestore();
  });
});
