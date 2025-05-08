import request from 'supertest';
import app from '../../../app';
import prisma from '@apps/user-service/src/prismaClient';

jest.mock('@apps/user-service/src/prismaClient', () => ({
  permission: {
    create: jest.fn(),
    findFirst: jest.fn(),
  },
}));

const baseUrl = '/api/user/permissions';

describe('POST /api/user/permissions', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a permission and return 201', async () => {
    const input = {
      name: 'create_user',
      description: 'Allows user creation',
      action: 'create',
      subject: 'user',
    };

    const mockPermission = {
      id: 'perm-123',
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.permission.create as jest.Mock).mockResolvedValue(mockPermission);

    const res = await request(app).post(baseUrl).send(input);

    expect(prisma.permission.create).toHaveBeenCalledWith({ data: input });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: mockPermission.id,
      name: input.name,
      description: input.description,
      action: input.action,
      subject: input.subject,
    });
  });

  it('should return 400 if required fields are missing', async () => {
    const res = await request(app).post(baseUrl).send({ description: 'Missing fields' });

    expect(res.status).toBe(400);
    expect(res.body).toBe('Name, action and subject are required');
  });

  it('should return 409 if permission already exists', async () => {
    const input = {
      name: 'create_user',
      action: 'create',
      subject: 'user',
      description: 'Already exists',
    };

    (prisma.permission.findFirst as jest.Mock).mockResolvedValue(input);

    const res = await request(app).post(baseUrl).send(input);

    expect(res.status).toBe(409);
    expect(res.body).toBe('Permission for this action and subject already exists');
  });

  it('should return 400 if name is missing', async () => {
    const res = await request(app).post(baseUrl).send({ description: 'Missing name' });

    expect(res.status).toBe(400);
    expect(res.body).toBe('Name, action and subject are required');
  });

  it('should return 500 on internal error', async () => {
    (prisma.permission.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.permission.create as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app)
      .post(baseUrl)
      .send({ name: 'fail', action: 'create', subject: 'user' });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
