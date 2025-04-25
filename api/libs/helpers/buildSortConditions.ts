import { SortOrder } from "../types/types";

type BuildOrderByOptions = {
  sortBy?: string;
  sortOrder?: SortOrder;
  allowedFields: string[];
  allowedRelations?: string[];
};

export function buildOrderBy({
  sortBy,
  sortOrder,
  allowedFields,
  allowedRelations = [],
}: BuildOrderByOptions) {
  if (!sortBy) return undefined;

  if (allowedFields.includes(sortBy)) {
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
