jest.unmock('../buildOrderBy');

import buildOrderBy from '../buildOrderBy';

describe('buildOrderBy', () => {
  type Dummy = {
    id: string;
    name: string;
    createdAt: Date;
  };

  it('should return sort by allowed field', () => {
    const result = buildOrderBy<Dummy>({
      sortBy: 'name',
      sortOrder: 'desc',
      allowedFields: ['id', 'name', 'createdAt'],
    });

    expect(result).toEqual({ name: 'desc' });
  });

  it('should return empty object for disallowed field', () => {
    const result = buildOrderBy<Dummy>({
      sortBy: 'email',
      sortOrder: 'asc',
      allowedFields: ['id', 'name'],
    });

    expect(result).toEqual({});
  });

  it('should return nested sort for allowed relation', () => {
    const result = buildOrderBy<any>({
      sortBy: 'type.name',
      sortOrder: 'asc',
      allowedFields: ['id'],
      allowedRelations: {
        type: {
          fields: ['name', 'code'],
        },
      },
    });

    expect(result).toEqual({
      type: { name: 'asc' },
    });
  });

  it('should return empty object for disallowed relation field', () => {
    const result = buildOrderBy<any>({
      sortBy: 'type.secret',
      sortOrder: 'asc',
      allowedFields: ['id'],
      allowedRelations: {
        type: {
          fields: ['name', 'code'],
        },
      },
    });

    expect(result).toEqual({});
  });

  it('should return empty object for non-existent relation', () => {
    const result = buildOrderBy<any>({
      sortBy: 'author.name',
      sortOrder: 'asc',
      allowedFields: ['id'],
      allowedRelations: {},
    });

    expect(result).toEqual({});
  });

  it('should default to asc order if not provided', () => {
    const result = buildOrderBy<Dummy>({
      sortBy: 'id',
      allowedFields: ['id'],
    });

    expect(result).toEqual({ id: 'asc' });
  });

  it('should return empty object if sortBy is not provided', () => {
    const result = buildOrderBy<Dummy>({
      allowedFields: ['id'],
    });

    expect(result).toEqual({});
  });
});
