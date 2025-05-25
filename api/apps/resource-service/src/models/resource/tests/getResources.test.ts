import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';
import parsePaginationQuery from '@libs/helpers/parsePaginationQuery';
import buildOrderBy from '@libs/helpers/buildOrderBy';
import buildQueryConditions from '@libs/helpers/buildQueryConditions';
import paginateData from '@libs/helpers/paginateData';

jest.mock('../../../prismaClient', () => ({
  resource: {},
}));

const baseUrl = '/api/resource/resources';

describe('GET /api/resource/resources (mocked)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated resources with type and status 200', async () => {
    const mockPagination = {
      page: 1,
      limit: 10,
      skip: 0,
      take: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };

    const mockOrderBy = [{ createdAt: 'desc' }];
    const mockWhere = { name: { contains: 'test', mode: 'insensitive' } };

    const mockResult = {
      data: [
        {
          id: 'res-1',
          name: 'Test Resource',
          code: 'RES-000001',
          description: 'Test',
          isActive: true,
          typeId: 'type-1',
          type: {
            id: 'type-1',
            name: 'Test Type',
            code: 'RES',
          },
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

    const res = await request(app).get(baseUrl).query({ search: 'test' });

    expect(parsePaginationQuery).toHaveBeenCalled();
    expect(buildOrderBy).toHaveBeenCalledWith({
      sortBy: 'createdAt',
      sortOrder: 'desc',
      allowedFields: [
        'id',
        'name',
        'code',
        'description',
        'isActive',
        'typeId',
        'createdAt',
        'updatedAt',
      ],
      allowedRelations: {
        type: {
          fields: ['id', 'name', 'code', 'createdAt', 'updatedAt'],
        },
      },
    });

    expect(buildQueryConditions).toHaveBeenCalledWith({
      fields: ['name', 'code', 'description'],
      filters: {
        name: undefined,
        code: undefined,
        description: undefined,
        isActive: undefined,
      },
      search: 'test',
    });

    expect(paginateData).toHaveBeenCalledWith(
      prisma.resource,
      { where: mockWhere, orderBy: mockOrderBy, include: { type: true } },
      mockPagination,
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockResult);
  });

  it('should return 500 on internal error', async () => {
    (parsePaginationQuery as jest.Mock).mockImplementation(() => {
      throw new Error('Mocked failure');
    });

    const res = await request(app).get(baseUrl);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
