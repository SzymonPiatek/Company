type FieldConditions = {
  [field: string]: string | number | boolean | undefined;
};

type SearchableWhereOptions = {
  fields: string[];
  filters: FieldConditions;
  search?: string;
};

const buildQueryConditions = ({ fields, filters, search }: SearchableWhereOptions): Record<string, any> => {
  const andConditions: Record<string, any>[] = [];

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined) {
      andConditions.push({
        [key]: {
          contains: String(value),
          mode: 'insensitive',
        },
      });
    }
  }

  const orConditions: Record<string, any>[] = [];

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

  const where: Record<string, any> = {};

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  if (orConditions.length > 0) {
    where.OR = orConditions;
  }

  return where;
};

export default buildQueryConditions;
