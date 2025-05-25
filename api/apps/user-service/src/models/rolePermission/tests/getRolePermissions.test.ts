import request from 'supertest';
import app from '../../../app';
import prisma from '@apps/user-service/src/prismaClient';
import parsePaginationQuery from '@libs/helpers/parsePaginationQuery';
import buildOrderBy from '@libs/helpers/buildOrderBy';
import paginateData from '@libs/helpers/paginateData';

jest.mock('@apps/user-service/src/prismaClient', () => ({
  rolePermission: {},
}));

const baseUrl = '/api/user/rolePermissions';

describe('GET /api/user/rolePermissions/role/:roleId/permissions (mocked)', () => {
  const roleId = 'role-123';
  const endpoint = `${baseUrl}/role/${roleId}`;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated permissions for a role', async () => {
    const mockPagination = {
      page: 1,
      limit: 10,
      skip: 0,
      take: 10,
      sortBy: 'id',
      sortOrder: 'asc',
    };

    const mockOrderBy = [{ id: 'asc' }];
    const mockResult = {
      data: [
        {
          id: 'rp-1',
          roleId,
          permissionId: 'perm-1',
          permission: { id: 'perm-1', name: 'create_user' },
        },
      ],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };

    (parsePaginationQuery as jest.Mock).mockReturnValue(mockPagination);
    (buildOrderBy as jest.Mock).mockReturnValue(mockOrderBy);
    (paginateData as jest.Mock).mockResolvedValue(mockResult);

    const res = await request(app).get(endpoint);

    expect(parsePaginationQuery).toHaveBeenCalled();
    expect(buildOrderBy).toHaveBeenCalledWith({
      sortBy: 'id',
      sortOrder: 'asc',
      allowedFields: ['id', 'roleId', 'permissionId'],
    });

    expect(paginateData).toHaveBeenCalledWith(
      prisma.rolePermission,
      {
        where: { roleId },
        orderBy: mockOrderBy,
        include: { permission: true },
      },
      mockPagination,
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockResult);
  });

  it('should return 500 on internal error', async () => {
    (parsePaginationQuery as jest.Mock).mockImplementation(() => {
      throw new Error('Something went wrong');
    });

    const res = await request(app).get(endpoint);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
