import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';
import { cleanupUsers, createTestUser } from '@libs/tests/setup';

const baseUrl = '/api/user/auth/login';
const testEmail = 'testuser@example.com';
const testPassword = 'Test1234!';

describe('POST /auth/login', () => {
  beforeEach(async () => {
    await cleanupUsers(prisma, [testEmail]);
    await createTestUser(prisma, { email: testEmail, password: testPassword });
  });

  afterAll(async () => {
    await cleanupUsers(prisma, [testEmail]);
  });

  it('should login with correct credentials', async () => {
    const res = await request(app).post(baseUrl).send({
      email: testEmail,
      password: testPassword,
    });

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.accessToken).toBeDefined();
  });

  it('should fail with wrong password', async () => {
    const res = await request(app).post(baseUrl).send({
      email: testEmail,
      password: 'WrongPass!',
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password');
  });

  it('should fail if user does not exist', async () => {
    const res = await request(app).post(baseUrl).send({
      email: 'nonexistent@example.com',
      password: 'DoesntMatter123',
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password');
  });

  it('should fail if email and password not provided', async () => {
    const res = await request(app).post(baseUrl).send({
      email: '',
      password: '',
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Email and password are required');
  });

  it('should return 500 if Prisma throws', async () => {
    const spy = jest.spyOn(prisma.user, 'findUnique').mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).post(baseUrl).send({
      email: testEmail,
      password: testPassword,
    });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');

    spy.mockRestore();
  });
});
