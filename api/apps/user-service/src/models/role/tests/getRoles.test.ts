import request from 'supertest';
import app from '../../../app';
import prisma from '@apps/user-service/src/prismaClient';
import parsePaginationQuery from '@libs/helpers/parsePaginationQuery';
import buildOrderBy from '@libs/helpers/buildOrderBy';
import buildQueryConditions from '@libs/helpers/buildQueryConditions';
import paginateData from '@libs/helpers/paginateData';

jest.mock('@apps/user-service/src/prismaClient', () => ({
  role: {},
}));

const baseUrl = '/api/user/roles';

describe('GET /api/user/roles (mocked)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated roles with status 200', async () => {
    const mockPagination = {
      page: 1,
      pageSize: 10,
      skip: 0,
      take: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    const mockOrderBy = [{ createdAt: 'desc' }];
    const mockWhere = { name: { contains: 'admin', mode: 'insensitive' } };
    const mockResult = {
      data: [
        {
          id: 'role-1',
          name: 'Admin',
          description: 'Administrator role',
        },
      ],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    };

    (parsePaginationQuery as jest.Mock).mockReturnValue(mockPagination);
    (buildOrderBy as jest.Mock).mockReturnValue(mockOrderBy);
    (buildQueryConditions as jest.Mock).mockReturnValue(mockWhere);
    (paginateData as jest.Mock).mockResolvedValue(mockResult);

    const res = await request(app).get(baseUrl).query({ name: 'admin' });

    expect(parsePaginationQuery).toHaveBeenCalled();
    expect(buildOrderBy).toHaveBeenCalledWith({
      sortBy: 'createdAt',
      sortOrder: 'desc',
      allowedFields: ['id', 'name', 'description', 'createdAt', 'updatedAt'],
    });
    expect(buildQueryConditions).toHaveBeenCalledWith({
      fields: ['name', 'description'],
      filters: { name: 'admin', description: undefined },
      search: undefined,
    });
    expect(paginateData).toHaveBeenCalledWith(
      prisma.role,
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
