import type { Request } from "express";
import type { PaginationParams } from "../types/types";

const parsePaginationQuery = (req: Request): PaginationParams => {
  const page = parseInt(req.query.page as string, 10);
  const limit = parseInt(req.query.limit as string, 10);
  const sortBy = req.query.sortBy as string;
  const rawOrder = (req.query.sortOrder as string)?.toLowerCase();

  const sortOrder: "asc" | "desc" | undefined =
    rawOrder === "desc" ? "desc" : rawOrder === "asc" ? "asc" : undefined;

  return {
    page: !isNaN(page) && page > 0 ? page : 1,
    limit: !isNaN(limit) && limit > 0 ? limit : 10,
    sortBy,
    sortOrder,
  };
};

export default parsePaginationQuery;
