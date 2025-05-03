import buildOrderBy from '../buildOrderBy';

describe('buildOrderBy', () => {
  type TestModel = {
    id: string;
    name: string;
    createdAt: Date;
  };

  it('returns empty object when sortBy is undefined', () => {
    const result = buildOrderBy<TestModel>({});
    expect(result).toEqual({});
  });

  it('builds orderBy for allowed direct field', () => {
    const result = buildOrderBy<TestModel>({
      sortBy: 'name',
      allowedFields: ['id', 'name', 'createdAt'],
    });
    expect(result).toEqual({ name: 'asc' });
  });

  it('builds orderBy for allowed relation field', () => {
    const result = buildOrderBy<TestModel>({
      sortBy: 'type.name',
      allowedRelations: {
        type: {
          fields: ['id', 'name'],
        },
      },
    });
    expect(result).toEqual({ type: { name: 'asc' } });
  });

  it('returns empty object for disallowed field', () => {
    const result = buildOrderBy<TestModel>({
      sortBy: 'invalidField',
      allowedFields: ['id', 'name'],
    });
    expect(result).toEqual({});
  });

  it('returns empty object for disallowed relation field', () => {
    const result = buildOrderBy<TestModel>({
      sortBy: 'type.invalidField',
      allowedRelations: {
        type: {
          fields: ['id', 'name'],
        },
      },
    });
    expect(result).toEqual({});
  });

  it('accepts any field when allowedFields is empty', () => {
    const result = buildOrderBy<TestModel>({
      sortBy: 'createdAt',
    });
    expect(result).toEqual({ createdAt: 'asc' });
  });

  it('respects provided sortOrder', () => {
    const result = buildOrderBy<TestModel>({
      sortBy: 'name',
      sortOrder: 'desc',
      allowedFields: ['id', 'name', 'createdAt'],
    });
    expect(result).toEqual({ name: 'desc' });
  });

  it('returns empty object for relation not listed in allowedRelations', () => {
    const result = buildOrderBy<TestModel>({
      sortBy: 'unknownRelation.name',
      allowedRelations: {
        knownRelation: {
          fields: ['id', 'name'],
        },
      },
    });
    expect(result).toEqual({});
  });
});
