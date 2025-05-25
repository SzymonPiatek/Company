import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';
import parsePaginationQuery from '@libs/helpers/parsePaginationQuery';
import buildOrderBy from '@libs/helpers/buildOrderBy';
import buildQueryConditions from '@libs/helpers/buildQueryConditions';
import paginateData from '@libs/helpers/paginateData';

jest.mock('../../../prismaClient', () => ({
  assignedResource: {},
}));

const baseUrl = '/api/warehouse/assignedResources';

describe('GET /api/warehouse/assignedResources (mocked)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated assigned resources with location and status 200', async () => {
    const mockPagination = {
      page: 1,
      limit: 10,
      skip: 0,
      take: 10,
      sortBy: 'assignedAt',
      sortOrder: 'asc',
    };

    const mockOrderBy = [{ assignedAt: 'asc' }];
    const mockWhere = { resourceId: 'res-1' };

    const mockResult = {
      data: [
        {
          id: 'assign-1',
          resourceId: 'res-1',
          locationId: 'loc-1',
          location: { name: 'Warehouse A' },
        },
      ],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };

    (parsePaginationQuery as jest.Mock).mockReturnValue(mockPagination);
    (buildOrderBy as jest.Mock).mockReturnValue(mockOrderBy);
    (buildQueryConditions as jest.Mock).mockReturnValue(mockWhere);
    (paginateData as jest.Mock).mockResolvedValue(mockResult);

    const res = await request(app).get(baseUrl).query({ resourceId: 'res-1' });

    expect(parsePaginationQuery).toHaveBeenCalled();
    expect(buildOrderBy).toHaveBeenCalledWith({
      sortBy: 'assignedAt',
      sortOrder: 'asc',
      allowedFields: ['id', 'resourceId', 'locationId', 'assignedAt'],
      allowedRelations: {
        location: {
          fields: ['id', 'name', 'description', 'createdAt', 'updatedAt'],
        },
      },
    });
    expect(buildQueryConditions).toHaveBeenCalledWith({
      fields: ['resourceId', 'locationId'],
      filters: { resourceId: 'res-1', locationId: undefined },
      search: undefined,
    });
    expect(paginateData).toHaveBeenCalledWith(
      prisma.assignedResource,
      {
        where: mockWhere,
        orderBy: mockOrderBy,
        include: { location: true },
      },
      mockPagination,
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockResult);
  });

  it('should return 500 on Prisma error', async () => {
    (parsePaginationQuery as jest.Mock).mockImplementation(() => {
      throw new Error('Unexpected error');
    });

    const res = await request(app).get(baseUrl);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
