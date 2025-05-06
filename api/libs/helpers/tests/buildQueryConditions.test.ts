jest.unmock('../buildQueryConditions');

import buildQueryConditions from '../buildQueryConditions';

describe('buildQueryConditions', () => {
  it('should build conditions from filters only', () => {
    const result = buildQueryConditions({
      fields: ['name', 'description'],
      filters: { name: 'test', isActive: 'true' },
    });

    expect(result).toEqual({
      AND: [{ name: { contains: 'test', mode: 'insensitive' } }, { isActive: { equals: true } }],
    });
  });

  it('should build conditions from search only', () => {
    const result = buildQueryConditions({
      fields: ['name', 'description'],
      filters: {},
      search: 'warehouse test',
    });

    expect(result).toEqual({
      OR: [
        { name: { contains: 'warehouse', mode: 'insensitive' } },
        { description: { contains: 'warehouse', mode: 'insensitive' } },
        { name: { contains: 'test', mode: 'insensitive' } },
        { description: { contains: 'test', mode: 'insensitive' } },
      ],
    });
  });

  it('should build conditions from filters and search combined', () => {
    const result = buildQueryConditions({
      fields: ['name'],
      filters: { code: 'X1', isActive: 'false' },
      search: 'Main',
    });

    expect(result).toEqual({
      AND: [{ code: { contains: 'X1', mode: 'insensitive' } }, { isActive: { equals: false } }],
      OR: [{ name: { contains: 'Main', mode: 'insensitive' } }],
    });
  });

  it('should return empty object if no filters and no search', () => {
    const result = buildQueryConditions({
      fields: ['name'],
      filters: {},
    });

    expect(result).toEqual({});
  });

  it('should ignore undefined filter values', () => {
    const result = buildQueryConditions({
      fields: ['name'],
      filters: { name: undefined, code: '123' },
    });

    expect(result).toEqual({
      AND: [{ code: { contains: '123', mode: 'insensitive' } }],
    });
  });

  it('should handle numeric and boolean values correctly', () => {
    const result = buildQueryConditions({
      fields: ['name'],
      filters: { amount: 10, isActive: false },
    });

    expect(result).toEqual({
      AND: [
        { amount: { contains: '10', mode: 'insensitive' } },
        { isActive: { contains: 'false', mode: 'insensitive' } },
      ],
    });
  });
});
