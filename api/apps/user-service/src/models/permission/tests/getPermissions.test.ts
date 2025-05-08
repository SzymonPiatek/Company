import request from 'supertest';
import app from '../../../app';
import prisma from '@apps/user-service/src/prismaClient';
import parsePaginationQuery from '@libs/helpers/parsePaginationQuery';
import buildOrderBy from '@libs/helpers/buildOrderBy';
import buildQueryConditions from '@libs/helpers/buildQueryConditions';
import paginateData from '@libs/helpers/paginateData';

jest.mock('@apps/user-service/src/prismaClient', () => ({
  permission: {},
}));

const baseUrl = '/api/user/permissions';

describe('GET /api/user/permissions (mocked)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated permissions with status 200', async () => {
    const mockPagination = {
      page: 1,
      limit: 10,
      skip: 0,
      take: 10,
      sortBy: 'createdAt',
      sortOrder: 'asc',
    };

    const mockOrderBy = [{ createdAt: 'asc' }];
    const mockWhere = { name: { contains: 'user', mode: 'insensitive' } };

    const mockResult = {
      data: [
        {
          id: 'perm-1',
          name: 'create_user',
          description: 'Can create users',
          action: 'CREATE',
          subject: 'USER',
        },
      ],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };

    (parsePaginationQuery as jest.Mock).mockReturnValue(mockPagination);
    (buildOrderBy as jest.Mock).mockReturnValue(mockOrderBy);
    (buildQueryConditions as jest.Mock).mockReturnValue(mockWhere);
    (paginateData as jest.Mock).mockResolvedValue(mockResult);

    const res = await request(app).get(baseUrl).query({ name: 'user' });

    expect(parsePaginationQuery).toHaveBeenCalled();
    expect(buildOrderBy).toHaveBeenCalledWith({
      sortBy: 'createdAt',
      sortOrder: 'asc',
      allowedFields: ['id', 'name', 'description', 'action', 'subject', 'createdAt', 'updatedAt'],
    });
    expect(buildQueryConditions).toHaveBeenCalledWith({
      fields: ['name', 'description', 'action', 'subject'],
      filters: { name: 'user', description: undefined, action: undefined, subject: undefined },
      search: undefined,
    });
    expect(paginateData).toHaveBeenCalledWith(
      prisma.permission,
      { where: mockWhere, orderBy: mockOrderBy },
      mockPagination,
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockResult);
  });

  it('should return 500 on internal error', async () => {
    (parsePaginationQuery as jest.Mock).mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    const res = await request(app).get(baseUrl);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
