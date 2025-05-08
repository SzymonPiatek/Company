import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';
import parsePaginationQuery from '@libs/helpers/parsePaginationQuery';
import buildOrderBy from '@libs/helpers/buildOrderBy';
import buildQueryConditions from '@libs/helpers/buildQueryConditions';
import paginateData from '@libs/helpers/paginateData';

const baseUrl = '/api/user/users';

describe('GET /api/user/users (mocked)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated list of users with status 200', async () => {
    const mockPagination = {
      page: 1,
      limit: 10,
      skip: 0,
      take: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    const mockOrderBy = [{ createdAt: 'desc' }];
    const mockWhere = { isActive: true };
    const mockResult = {
      data: [
        {
          id: 'user-1',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          isActive: true,
        },
      ],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    };

    (parsePaginationQuery as jest.Mock).mockReturnValue(mockPagination);
    (buildOrderBy as jest.Mock).mockReturnValue(mockOrderBy);
    (buildQueryConditions as jest.Mock).mockReturnValue(mockWhere);
    (paginateData as jest.Mock).mockResolvedValue(mockResult);

    const res = await request(app).get(`${baseUrl}?isActive=true`);

    expect(parsePaginationQuery).toHaveBeenCalled();
    expect(buildOrderBy).toHaveBeenCalledWith({
      sortBy: 'createdAt',
      sortOrder: 'desc',
      allowedFields: ['id', 'email', 'firstName', 'lastName', 'isActive', 'createdAt', 'updatedAt'],
    });
    expect(buildQueryConditions).toHaveBeenCalledWith({
      fields: ['email', 'firstName', 'lastName'],
      filters: {
        email: undefined,
        firstName: undefined,
        lastName: undefined,
        isActive: 'true',
      },
      search: undefined,
    });
    expect(paginateData).toHaveBeenCalledWith(
      prisma.user,
      {
        where: mockWhere,
        orderBy: mockOrderBy,
        omit: { password: true },
      },
      mockPagination,
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockResult);
  });

  it('should return 500 if an error occurs', async () => {
    (parsePaginationQuery as jest.Mock).mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    const res = await request(app).get(baseUrl);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
