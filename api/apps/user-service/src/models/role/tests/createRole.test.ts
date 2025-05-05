import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';

jest.mock('../../../prismaClient', () => ({
  role: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock(
  '../../../../../../libs/helpers/middlewares/auth.middleware',
  () => (_req: any, _res: any, next: any) => next(),
);
jest.mock(
  '../../../../../../libs/helpers/middlewares/emptyBody.middleware',
  () => (_req: any, _res: any, next: any) => next(),
);

const baseUrl = '/api/user/roles';

describe('POST /api/user/roles (mocked)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a new role and return 201', async () => {
    const mockRole = {
      id: 'uuid-123',
      name: 'Test Role Mocked',
      description: 'Mock description',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.role.create as jest.Mock).mockResolvedValue(mockRole);

    const res = await request(app)
      .post(baseUrl)
      .send({ name: mockRole.name, description: mockRole.description });

    expect(prisma.role.findUnique).toHaveBeenCalledWith({ where: { name: mockRole.name } });
    expect(prisma.role.create).toHaveBeenCalledWith({
      data: { name: mockRole.name, description: mockRole.description },
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: mockRole.id,
      name: mockRole.name,
      description: mockRole.description,
    });
  });

  it('should return 400 if name is missing', async () => {
    const res = await request(app).post(baseUrl).send({});

    expect(res.status).toBe(400);
    expect(res.body).toBe('Name is required');
  });

  it('should return 400 if role already exists', async () => {
    (prisma.role.findUnique as jest.Mock).mockResolvedValue({ id: 'existing-id' });

    const res = await request(app).post(baseUrl).send({ name: 'Existing Role' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Role with this name already exists' });
  });

  it('should return 500 on internal error', async () => {
    (prisma.role.findUnique as jest.Mock).mockRejectedValue(new Error('Unexpected DB Error'));

    const res = await request(app).post(baseUrl).send({ name: 'Error Role' });

    expect(res.status).toBe(500);
    expect(res.body.error).toEqual('Internal Server Error');
  });
});
