import request from 'supertest';
import prisma from '../../../prismaClient';
import app from '../../../app';
import { hashPassword } from '@libs/helpers/bcrypt';

const baseUrl = (id: string) => `/api/user/users/${id}`;
const loginUrl = `/api/user/auth/login`;

describe('GET /users/:id', () => {
  let testUserId: string;
  let accessToken: string;

  beforeAll(async () => {
    const hashedPassword = await hashPassword('securePass123');

    const createdUser = await prisma.user.create({
      data: {
        email: 'getuser@example.com',
        firstName: 'Get',
        lastName: 'User',
        password: hashedPassword,
        isActive: true,
      },
    });

    testUserId = createdUser.id;

    const loginRes = await request(app).post(loginUrl).send({
      email: 'getuser@example.com',
      password: 'securePass123',
    });

    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: testUserId } });
  });

  it('should return user by id', async () => {
    const res = await request(app)
      .get(baseUrl(testUserId))
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: testUserId,
      email: 'getuser@example.com',
      firstName: 'Get',
      lastName: 'User',
    });

    expect(res.body.password).toBeUndefined();
  });

  it('should return 404 if user not found', async () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000';

    const res = await request(app)
      .get(baseUrl(nonExistentId))
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('User not found');
  });

  it('should return 500 on prisma error', async () => {
    const spy = jest.spyOn(prisma.user, 'findUnique').mockRejectedValueOnce(new Error('DB broke'));

    const res = await request(app)
      .get(baseUrl('fake-id'))
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');

    spy.mockRestore();
  });
});
