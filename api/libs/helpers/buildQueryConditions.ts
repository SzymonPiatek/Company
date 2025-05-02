type FieldConditions = {
  [field: string]: string | number | boolean | undefined;
};

type QueryCondition = Record<string, string | number | boolean | object | undefined>;

type SearchableWhereOptions = {
  fields: string[];
  filters: FieldConditions;
  search?: string;
};

const buildQueryConditions = ({
  fields,
  filters,
  search,
}: SearchableWhereOptions): QueryCondition => {
  const andConditions: QueryCondition[] = [];

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined) continue;

    if (value === 'true' || value === 'false') {
      andConditions.push({
        [key]: {
          equals: value === 'true',
        },
      });
    } else {
      andConditions.push({
        [key]: {
          contains: String(value),
          mode: 'insensitive',
        },
      });
    }
  }

  const orConditions: QueryCondition[] = [];

  if (search) {
    const searchWords = search.trim().split(/\s+/);

    for (const word of searchWords) {
      for (const field of fields) {
        orConditions.push({
          [field]: {
            contains: word,
            mode: 'insensitive',
          },
        });
      }
    }
  }

  const where: QueryCondition = {};

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  if (orConditions.length > 0) {
    where.OR = orConditions;
  }

  return where;
};

export default buildQueryConditions;
