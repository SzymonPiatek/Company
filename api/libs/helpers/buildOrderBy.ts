import { SortOrder } from "../types/types";

type BuildOrderByOptions<T> = {
  sortBy?: string;
  sortOrder?: SortOrder;
  allowedFields?: (keyof T)[];
  allowedRelations?: Record<string, string[]>;
};

export function buildOrderBy<T>({
  sortBy,
  sortOrder = "asc",
  allowedFields = [] as (keyof T)[],
  allowedRelations = {},
}: BuildOrderByOptions<T>) {
  if (!sortBy) return {};

  const [relation, field] = sortBy.split(".");

  if (relation && field) {
    const allowedFieldsForRelation = allowedRelations[relation];

    if (
      !allowedFieldsForRelation ||
      !allowedFieldsForRelation.includes(field)
    ) {
      return {};
    }

    return { [relation]: { [field]: sortOrder } };
  }

  const isFieldAllowed =
    allowedFields.length === 0 || allowedFields.includes(sortBy as keyof T);

  if (isFieldAllowed) {
    return { [sortBy]: sortOrder };
  }

  return {};
}

export default buildOrderBy;
