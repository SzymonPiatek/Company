import request from 'supertest';
import app from '../../../app';
import parsePaginationQuery from '@libs/helpers/parsePaginationQuery';
import buildOrderBy from '@libs/helpers/buildOrderBy';
import paginateData from '@libs/helpers/paginateData';

jest.mock('@apps/user-service/src/prismaClient', () => ({
  userRole: {},
}));

const userId = 'user-123';
const endpoint = `/api/user/userRoles/user/${userId}`;

describe('GET /api/user/userRoles/:userId (mocked)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated user roles', async () => {
    const mockPagination = {
      page: 1,
      limit: 10,
      skip: 0,
      take: 10,
      sortBy: 'userId',
      sortOrder: 'asc',
    };

    const mockOrderBy = [{ userId: 'asc' }];
    const mockResult = {
      data: [
        {
          userId,
          roleId: 'role-456',
          role: { id: 'role-456', name: 'Admin' },
        },
      ],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    };

    (parsePaginationQuery as jest.Mock).mockReturnValue(mockPagination);
    (buildOrderBy as jest.Mock).mockReturnValue(mockOrderBy);
    (paginateData as jest.Mock).mockResolvedValue(mockResult);

    const res = await request(app).get(endpoint);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockResult);
  });

  it('should return 500 if paginateData throws an error', async () => {
    (parsePaginationQuery as jest.Mock).mockReturnValue({
      page: 1,
      limit: 10,
      sortBy: 'userId',
      sortOrder: 'asc',
    });

    (buildOrderBy as jest.Mock).mockReturnValue([{ userId: 'asc' }]);
    (paginateData as jest.Mock).mockRejectedValue(new Error('Unexpected DB Error'));

    const res = await request(app).get(endpoint);

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'Internal Server Error');
    expect(res.body).toHaveProperty('details');
  });
});
