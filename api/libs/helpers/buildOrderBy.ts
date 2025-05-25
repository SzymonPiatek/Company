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

function buildOrderBy<T>({
  sortBy,
  sortOrder = 'asc',
  allowedFields,
  allowedRelations = {},
}: BuildOrderByOptions<T>) {
  if (!sortBy) return {};

  const path = sortBy.split('.');
  let result: Record<string, unknown> = {};
  let pointer = result;

  let currentAllowed: AllowedRelation = {
    fields: allowedFields ? allowedFields.map(String) : [],
    relations: allowedRelations,
  };

  for (let i = 0; i < path.length; i++) {
    const key = path[i];
    const isRelation = currentAllowed.relations?.[key];
    const isField =
      currentAllowed.fields.length > 0 ? currentAllowed.fields.includes(key as string) : true;
    const isLast = i === path.length - 1;

    if (isLast) {
      if (!isField) {
        return {};
      }
      pointer[key] = sortOrder;
    } else {
      if (!isRelation) {
        return {};
      }
      pointer[key] = {};
      pointer = pointer[key] as Record<string, unknown>;
      currentAllowed = {
        fields: isRelation.fields,
        relations: isRelation.relations ?? {},
      };
    }
  }

  return result;
}

export default buildOrderBy;
