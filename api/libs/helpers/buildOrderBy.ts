import { SortOrder } from '../types/types';

type AllowedRelation = {
  fields: string[];
  relations?: Record<string, AllowedRelation>;
};

type BuildOrderByOptions<T> = {
  sortBy?: string;
  sortOrder?: SortOrder;
  allowedFields?: (keyof T)[];
  allowedRelations?: Record<string, AllowedRelation>;
};

function buildOrderBy<T>({ sortBy, sortOrder = 'asc', allowedFields = [], allowedRelations = {} }: BuildOrderByOptions<T>) {
  if (!sortBy) return {};

  const path = sortBy.split('.');
  let currentAllowed: AllowedRelation = { fields: allowedFields.map(String), relations: allowedRelations };
  let result: any = {};
  let pointer = result;

  for (let i = 0; i < path.length; i++) {
    const key = path[i];

    const isRelation = currentAllowed.relations && currentAllowed.relations[key];
    const isField = currentAllowed.fields.includes(key);

    if (i === path.length - 1) {
      if (!isField && !isRelation?.fields.includes(key)) {
        return {};
      }
      pointer[key] = sortOrder;
    } else {
      if (!isRelation) {
        return {};
      }
      pointer[key] = {};
      pointer = pointer[key];
      currentAllowed = {
        fields: isRelation.fields,
        relations: isRelation.relations ?? {},
      };
    }
  }

  return result;
}

export default buildOrderBy;
