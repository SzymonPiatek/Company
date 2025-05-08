import request from 'supertest';
import app from '../../../app';
import prisma from '@apps/user-service/src/prismaClient';

jest.mock('@apps/user-service/src/prismaClient', () => ({
  role: {
    findUnique: jest.fn(),
  },
}));

const baseUrl = '/api/user/roles';

describe('GET /api/user/roles/:id (mocked)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a role by ID with status 200', async () => {
    const mockRole = {
      id: 'role-id-123',
      name: 'Admin',
      description: 'Admin role',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    (prisma.role.findUnique as jest.Mock).mockResolvedValue(mockRole);

    const res = await request(app).get(`${baseUrl}/${mockRole.id}`);

    expect(prisma.role.findUnique).toHaveBeenCalledWith({
      where: { id: mockRole.id },
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: mockRole.id,
      name: mockRole.name,
      description: mockRole.description,
    });
  });

  it('should return 404 if role not found', async () => {
    (prisma.role.findUnique as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get(`${baseUrl}/nonexistent-id`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Role not found' });
  });

  it('should return 500 on internal error', async () => {
    (prisma.role.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).get(`${baseUrl}/some-id`);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
