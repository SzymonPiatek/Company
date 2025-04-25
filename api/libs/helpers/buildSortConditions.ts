import { SortOrder } from "../types/types";

type BuildOrderByOptions<T> = {
  sortBy?: string;
  sortOrder?: SortOrder;
  allowedFields?: (keyof T)[];
  allowedRelations?: string[];
};

export function buildOrderBy<T>({
  sortBy,
  sortOrder = "asc",
  allowedFields = [] as (keyof T)[],
  allowedRelations = [],
}: BuildOrderByOptions<T>) {
  if (!sortBy) return undefined;

  if (allowedFields.includes(sortBy as keyof T)) {
    return { [sortBy]: sortOrder };
  }

  for (const relation of allowedRelations) {
    if (sortBy.startsWith(`${relation}.`)) {
      const field = sortBy.split(".")[1];
      return { [relation]: { [field]: sortOrder } };
    }
  }

  return undefined;
}

export default buildOrderBy;
