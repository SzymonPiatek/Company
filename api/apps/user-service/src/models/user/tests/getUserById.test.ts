import request from 'supertest';
import prisma from '../../../prismaClient';
import app from '../../../app';
import { createTestUser, mockAccessToken } from '@libs/tests/setup';

const baseUrl = (id: string) => `/api/user/users/${id}`;
const testEmail = 'getuser@example.com';
const testPassword = 'Test1234!';

describe('GET /users/:id', () => {
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

  it('should return user by id', async () => {
    const res = await getRequest(testUserId);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: testUserId,
      email: testEmail,
      firstName: 'Get',
      lastName: 'User',
    });

    expect(res.body.password).toBeUndefined();
  });

  it('should return 404 if user not found', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';

    const res = await getRequest(nonExistentId);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('User not found');
  });

  it('should return 500 on prisma error', async () => {
    const spy = jest.spyOn(prisma.user, 'findUnique').mockRejectedValueOnce(new Error('DB broke'));

    const res = await getRequest('fake-id');

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');

    spy.mockRestore();
  });
});
