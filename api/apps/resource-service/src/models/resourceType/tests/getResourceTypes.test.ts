import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';
import parsePaginationQuery from '@libs/helpers/parsePaginationQuery';
import buildOrderBy from '@libs/helpers/buildOrderBy';
import buildQueryConditions from '@libs/helpers/buildQueryConditions';
import paginateData from '@libs/helpers/paginateData';

jest.mock('../../../prismaClient', () => ({
  resourceType: {},
}));

const baseUrl = '/api/resource/resourceTypes';

describe('GET /api/resource/resourceTypes (mocked)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated resource types with resources and status 200', async () => {
    const mockPagination = {
      page: 1,
      limit: 10,
      skip: 0,
      take: 10,
      sortBy: 'createdAt',
      sortOrder: 'asc',
    };

    const mockOrderBy = [{ createdAt: 'asc' }];
    const mockWhere = { name: { contains: 'test', mode: 'insensitive' } };

    const mockResult = {
      data: [
        {
          id: 'type-1',
          name: 'Test Type',
          code: 'RES',
          resources: [
            {
              id: 'res-1',
              name: 'Test Resource',
              code: 'RES-000001',
            },
          ],
        },
      ],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };

    (parsePaginationQuery as jest.Mock).mockReturnValue(mockPagination);
    (buildOrderBy as jest.Mock).mockReturnValue(mockOrderBy);
    (buildQueryConditions as jest.Mock).mockReturnValue(mockWhere);
    (paginateData as jest.Mock).mockResolvedValue(mockResult);

    const res = await request(app).get(baseUrl).query({ search: 'test' });

    expect(parsePaginationQuery).toHaveBeenCalled();
    expect(buildOrderBy).toHaveBeenCalledWith({
      sortBy: 'createdAt',
      sortOrder: 'asc',
      allowedFields: ['id', 'name', 'code', 'createdAt', 'updatedAt'],
    });
    expect(buildQueryConditions).toHaveBeenCalledWith({
      fields: ['name', 'code'],
      filters: { name: undefined, code: undefined },
      search: 'test',
    });
    expect(paginateData).toHaveBeenCalledWith(
      prisma.resourceType,
      { where: mockWhere, orderBy: mockOrderBy, include: { resources: true } },
      mockPagination,
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockResult);
  });

  it('should return 500 on internal error', async () => {
    (parsePaginationQuery as jest.Mock).mockImplementation(() => {
      throw new Error('Unexpected Error');
    });

    const res = await request(app).get(baseUrl);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
