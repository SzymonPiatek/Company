import request from 'supertest';
import prisma from '../../../prismaClient';
import app from '../../../app';
import { comparePassword, hashPassword } from '@libs/helpers/bcrypt';
import { User } from '@prisma/client';

const baseUrl = (id: string) => `/api/user/users/${id}`;

describe('PATCH /users/:id', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });
  let testUser: User;

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: { in: ['update@example.com', 'existing@example.com'] },
      },
    });

    testUser = await prisma.user.create({
      data: {
        email: 'update@example.com',
        firstName: 'Update',
        lastName: 'User',
        password: await hashPassword('Initial123!'),
        isActive: true,
      },
    });

    await prisma.user.create({
      data: {
        email: 'existing@example.com',
        firstName: 'Existing',
        lastName: 'User',
        password: 'irrelevant',
        isActive: true,
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: { in: ['update@example.com', 'existing@example.com'] },
      },
    });
  });

  it('should update user info without changing password', async () => {
    const res = await request(app).patch(baseUrl(testUser.id)).send({
      firstName: 'Updated',
      lastName: 'User',
    });

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe('Updated');
    expect(res.body.password).toBeUndefined();
  });

  it('should update and hash new password', async () => {
    const res = await request(app).patch(baseUrl(testUser.id)).send({
      password: 'NewSecret123!',
    });

    expect(res.status).toBe(200);

    const updated = await prisma.user.findUnique({
      where: { id: testUser.id },
    });
    const passwordMatch = await comparePassword('NewSecret123!', updated!.password);
    expect(passwordMatch).toBe(true);
  });

  it('should return 409 if email already exists on another user', async () => {
    const res = await request(app).patch(baseUrl(testUser.id)).send({
      email: 'existing@example.com',
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Email is already taken by another user');
  });

  it('should return 500 if user does not exist', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const res = await request(app).patch(baseUrl(fakeId)).send({
      firstName: 'Ghost',
    });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to update user');
  });

  it('should return 500 on prisma failure', async () => {
    const spy = jest.spyOn(prisma.user, 'update').mockRejectedValueOnce(new Error('Mock DB fail'));

    const res = await request(app).patch(baseUrl(testUser.id)).send({
      firstName: 'Boom',
    });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Failed to update user');

    spy.mockRestore();
  });
});
