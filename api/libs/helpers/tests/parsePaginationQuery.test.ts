jest.unmock('../parsePaginationQuery');

import parsePaginationQuery from '../parsePaginationQuery';
import type { Request } from 'express';

describe('parsePaginationQuery', () => {
  const mockRequest = (query: Record<string, any>) => ({ query }) as unknown as Request;

  it('should parse valid pagination and sorting parameters', () => {
    const req = mockRequest({
      page: '2',
      limit: '25',
      sortBy: 'name',
      sortOrder: 'desc',
    });

    const result = parsePaginationQuery(req);

    expect(result).toEqual({
      page: 2,
      limit: 25,
      sortBy: 'name',
      sortOrder: 'desc',
    });
  });

  it('should default to page=1 and limit=10 if invalid values are provided', () => {
    const req = mockRequest({
      page: '0',
      limit: '-5',
      sortBy: 'createdAt',
      sortOrder: 'invalid',
    });

    const result = parsePaginationQuery(req);

    expect(result).toEqual({
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: undefined,
    });
  });

  it('should handle missing parameters gracefully', () => {
    const req = mockRequest({});

    const result = parsePaginationQuery(req);

    expect(result).toEqual({
      page: 1,
      limit: 10,
      sortBy: undefined,
      sortOrder: undefined,
    });
  });

  it('should normalize sortOrder to lowercase and validate it', () => {
    const req = mockRequest({
      page: '3',
      limit: '5',
      sortBy: 'email',
      sortOrder: 'ASC',
    });

    const result = parsePaginationQuery(req);

    expect(result.sortOrder).toBe('asc');
  });
});
