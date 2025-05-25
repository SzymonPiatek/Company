import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';
import parsePaginationQuery from '@libs/helpers/parsePaginationQuery';
import buildOrderBy from '@libs/helpers/buildOrderBy';
import buildQueryConditions from '@libs/helpers/buildQueryConditions';
import paginateData from '@libs/helpers/paginateData';

jest.mock('../../../prismaClient', () => ({
  resourceLocation: {},
}));

const baseUrl = '/api/warehouse/resourceLocations';

describe('GET /api/warehouse/resourceLocations (mocked)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated list of resource locations', async () => {
    const mockPagination = {
      page: 1,
      limit: 10,
      skip: 0,
      take: 10,
      sortBy: 'name',
      sortOrder: 'asc',
    };

    const mockOrderBy = [{ name: 'asc' }];
    const mockWhere = { name: { contains: 'Warehouse' } };

    const now = new Date().toISOString();

    const mockResult = {
      data: [
        {
          id: 'loc-1',
          name: 'Warehouse A',
          description: 'First',
          createdAt: now,
          updatedAt: now,
        },
      ],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };

    (parsePaginationQuery as jest.Mock).mockReturnValue(mockPagination);
    (buildOrderBy as jest.Mock).mockReturnValue(mockOrderBy);
    (buildQueryConditions as jest.Mock).mockReturnValue(mockWhere);
    (paginateData as jest.Mock).mockResolvedValue(mockResult);

    const res = await request(app).get(baseUrl).query({ name: 'Warehouse' });

    expect(parsePaginationQuery).toHaveBeenCalled();
    expect(buildOrderBy).toHaveBeenCalledWith({
      sortBy: 'name',
      sortOrder: 'asc',
      allowedFields: ['id', 'name', 'description', 'createdAt', 'updatedAt'],
    });

    expect(buildQueryConditions).toHaveBeenCalledWith({
      fields: ['name', 'description'],
      filters: { name: 'Warehouse', description: undefined },
      search: undefined,
    });

    expect(paginateData).toHaveBeenCalledWith(
      prisma.resourceLocation,
      { where: mockWhere, orderBy: mockOrderBy },
      mockPagination,
    );

    expect(res.status).toBe(200);
    expect(res.body.data[0]).toMatchObject({
      id: 'loc-1',
      name: 'Warehouse A',
      description: 'First',
    });
    expect(typeof res.body.data[0].createdAt).toBe('string');
    expect(typeof res.body.data[0].updatedAt).toBe('string');
    expect(res.body.meta).toEqual(mockResult.meta);
  });

  it('should return 500 on internal error', async () => {
    (parsePaginationQuery as jest.Mock).mockImplementation(() => {
      throw new Error('Parsing failed');
    });

    const res = await request(app).get(baseUrl);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
