import request from 'supertest';
import app from '../../../app';
import prisma from '../../../prismaClient';
import parsePaginationQuery from '@libs/helpers/parsePaginationQuery';
import buildOrderBy from '@libs/helpers/buildOrderBy';
import buildQueryConditions from '@libs/helpers/buildQueryConditions';
import paginateData from '@libs/helpers/paginateData';

jest.mock('../../../prismaClient', () => ({
  resourceLocationHistory: {},
}));

const baseUrl = '/api/warehouse/resourceLocationHistories';

describe('GET /api/warehouse/resourceLocationHistories (mocked)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated location histories with status 200', async () => {
    const mockPagination = {
      page: 1,
      limit: 10,
      skip: 0,
      take: 10,
      sortBy: 'movedAt',
      sortOrder: 'desc',
    };

    const mockOrderBy = [{ movedAt: 'desc' }];
    const mockWhere = { resourceId: 'res-1' };

    const mockResult = {
      data: [
        {
          id: 'hist-1',
          resourceId: 'res-1',
          fromLocation: { id: 'loc-a', name: 'A' },
          toLocation: { id: 'loc-b', name: 'B' },
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
      sortBy: 'movedAt',
      sortOrder: 'desc',
      allowedFields: ['id', 'resourceId', 'fromLocationId', 'toLocationId', 'movedAt'],
    });
    expect(buildQueryConditions).toHaveBeenCalledWith({
      fields: ['id', 'resourceId', 'fromLocationId', 'toLocationId'],
      filters: { resourceId: 'res-1', fromLocationId: undefined, toLocationId: undefined },
      search: undefined,
    });
    expect(paginateData).toHaveBeenCalledWith(
      prisma.resourceLocationHistory,
      {
        include: { fromLocation: true, toLocation: true },
        where: mockWhere,
        orderBy: mockOrderBy,
      },
      mockPagination,
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockResult);
  });

  it('should return 500 on internal error', async () => {
    (parsePaginationQuery as jest.Mock).mockImplementation(() => {
      throw new Error('Internal error');
    });

    const res = await request(app).get(baseUrl);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
