import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';
import { hashPassword } from '@libs/helpers/bcrypt';
import type { User } from '@prisma/client';

const baseUrl = '/api/user/users';
const loginUrl = '/api/user/auth/login';

describe('GET /users', () => {
  let accessToken: string;

  const testPassword = 'securePass123';
  const getUserEmail = 'getuser@example.com';

  const testUsers = [
    {
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      isActive: true,
    },
    {
      email: 'jane.smith@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      isActive: true,
    },
    {
      email: 'inactive.user@example.com',
      firstName: 'Inactive',
      lastName: 'User',
      isActive: false,
    },
  ];

  const allTestEmails = [...testUsers.map((u) => u.email), getUserEmail];

  beforeAll(async () => {
    const hashedPassword = await hashPassword(testPassword);

    await prisma.user.deleteMany({
      where: {
        email: { in: allTestEmails },
      },
    });

    const usersWithPasswords = testUsers.map((user) => ({
      ...user,
      password: hashedPassword,
    }));

    await prisma.user.createMany({
      data: usersWithPasswords,
      skipDuplicates: true,
    });

    await prisma.user.create({
      data: {
        email: getUserEmail,
        firstName: 'Get',
        lastName: 'User',
        password: hashedPassword,
        isActive: true,
      },
    });

    const loginRes = await request(app).post(loginUrl).send({
      email: getUserEmail,
      password: testPassword,
    });

    accessToken = loginRes.body.accessToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: { in: allTestEmails },
      },
    });
  });

  it('should return paginated list of users', async () => {
    const res = await request(app)
      .get(`${baseUrl}?page=1&limit=2`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(2);
    expect(res.body.meta).toMatchObject({
      page: 1,
      limit: 2,
    });

    res.body.data.forEach((user: User & { password?: string }) => {
      expect(user.password).toBeUndefined();
    });
  });

  it('should filter users by firstName', async () => {
    const res = await request(app)
      .get(`${baseUrl}?firstName=Jane`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].firstName).toBe('Jane');
  });

  it('should search users by query string', async () => {
    const res = await request(app)
      .get(`${baseUrl}?search=smith`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].lastName.toLowerCase()).toContain('smith');
  });

  it('should filter by isActive=false', async () => {
    const res = await request(app)
      .get(`${baseUrl}?isActive=false`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.every((user: User) => !user.isActive)).toBe(true);
  });

  it('should return 500 on server error', async () => {
    const spy = jest.spyOn(prisma.user, 'findMany').mockRejectedValueOnce(new Error('DB Error'));

    const res = await request(app)
      .get(`${baseUrl}?firstName=FailTest`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');

    spy.mockRestore();
  });
});
