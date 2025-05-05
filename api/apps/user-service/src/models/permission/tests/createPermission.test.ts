import request from 'supertest';
import app from '../../../app';
import prisma from '@apps/user-service/src/prismaClient';

jest.mock('@apps/user-service/src/prismaClient', () => ({
  permission: {
    create: jest.fn(),
  },
}));

const baseUrl = '/api/user/permissions';

describe('POST /api/user/permissions (mocked)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a permission and return 201', async () => {
    const input = {
      name: 'create_user',
      description: 'Allows user creation',
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
    });
  });

  it('should return 400 if name is missing', async () => {
    const res = await request(app).post(baseUrl).send({ description: 'Missing name' });

    expect(res.status).toBe(400);
    expect(res.body).toBe('Name is required');
  });

  it('should return 500 on internal error', async () => {
    (prisma.permission.create as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).post(baseUrl).send({ name: 'fail' });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
