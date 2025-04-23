export type PaginationParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string | null | undefined | '';
};

export type PaginationResult<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};
