import request from 'supertest';
import prisma from '../../../prismaClient';
import app from '../../../app';
import { comparePassword } from '@libs/helpers/bcrypt';
import { cleanupUsers, createTestUser, loginTestUser } from '@libs/tests/setup';
import type { User } from '@prisma/client';

const baseUrl = (id: string) => `/api/user/users/${id}`;
const testEmail = 'getuser@example.com';
const testPassword = 'securePass123';
const updateUserEmail = 'update@example.com';
const existingUserEmail = 'existing@example.com';

describe('PATCH /users/:id', () => {
  let accessToken: string;
  let updateUser: User;

  const patchRequest = (id: string, body: object) =>
    request(app).patch(baseUrl(id)).set('Authorization', `Bearer ${accessToken}`).send(body);

  beforeAll(async () => {
    await createTestUser(prisma, {
      email: testEmail,
      password: testPassword,
      firstName: 'Get',
      lastName: 'User',
    });

    accessToken = await loginTestUser({
      api: request(app),
      email: testEmail,
      password: testPassword,
    });
  });

  beforeAll(async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await prisma.user.deleteMany({
      where: {
        email: { in: [updateUserEmail, existingUserEmail] },
      },
    });

    updateUser = await createTestUser(prisma, {
      email: updateUserEmail,
      password: 'Initial123!',
      firstName: 'Update',
    });

    await createTestUser(prisma, {
      email: existingUserEmail,
    });
  });

  afterAll(async () => {
    jest.restoreAllMocks();

    await cleanupUsers(prisma, [testEmail, updateUserEmail, existingUserEmail]);
  });

  it('should update user info without changing password', async () => {
    const res = await patchRequest(updateUser.id, { firstName: 'Updated', lastName: 'User' });

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe('Updated');
    expect(res.body.password).toBeUndefined();
  });

  it('should update and hash new password', async () => {
    const res = await patchRequest(updateUser.id, {
      password: 'NewSecret123!',
    });

    expect(res.status).toBe(200);

    const updated = await prisma.user.findUnique({ where: { id: updateUser.id } });
    const passwordMatch = await comparePassword('NewSecret123!', updated!.password);
    expect(passwordMatch).toBe(true);
  });

  it('should return 409 if email already exists on another user', async () => {
    const res = await patchRequest(updateUser.id, {
      email: existingUserEmail,
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Email is already taken by another user');
  });

  it('should return 500 if user does not exist', async () => {
    const res = await patchRequest('00000000-0000-0000-0000-000000000000', {
      firstName: 'Ghost',
    });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to update user');
  });

  it('should return 500 on prisma failure', async () => {
    const spy = jest.spyOn(prisma.user, 'update').mockRejectedValueOnce(new Error('Mock DB fail'));

    const res = await patchRequest(updateUser.id, { firstName: 'Boom' });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to update user');

    spy.mockRestore();
  });
});
