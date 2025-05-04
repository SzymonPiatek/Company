import request from 'supertest';
import prisma from '../../../prismaClient';
import app from '../../../app';

const baseUrl = '/api/user/users/';

describe('POST /users', () => {
  const testEmail = `testuser+${Date.now()}@example.com`;

  beforeEach(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
  });

  it('should create user successfully', async () => {
    const res = await request(app).post(baseUrl).send({
      email: testEmail,
      firstName: 'Test',
      lastName: 'User',
      password: 'SuperSecret123!',
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      email: testEmail,
      firstName: 'Test',
      lastName: 'User',
    });

    expect(res.body.password).toBeUndefined();
  });

  it('should return 409 if email already exists', async () => {
    await prisma.user.create({
      data: {
        email: testEmail,
        firstName: 'Test',
        lastName: 'User',
        password: 'hashed',
      },
    });

    const res = await request(app).post(baseUrl).send({
      email: testEmail,
      firstName: 'Another',
      lastName: 'User',
      password: 'SuperSecret123!',
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('User with this email already exists');
  });

  it('should return 500 on server error', async () => {
    const spy = jest.spyOn(prisma.user, 'findUnique').mockRejectedValueOnce(new Error('DB FAIL'));

    const res = await request(app).post(baseUrl).send({
      email: 'fail@example.com',
      firstName: 'Boom',
      lastName: 'Error',
      password: 'SuperSecret123!',
    });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Internal Server Error');

    spy.mockRestore();
  });
});
