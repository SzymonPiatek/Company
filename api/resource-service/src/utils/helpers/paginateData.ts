import type { PaginationParams, PaginationResult } from '../types/types';

async function paginateData<T>(
  model: any,
  args: object,
  { page = 1, limit = 10, sortBy, sortOrder }: PaginationParams = {},
): Promise<PaginationResult<T>> {
  const skip = (page - 1) * limit;

  const orderBy = sortBy && sortOrder ? { [sortBy]: sortOrder === 'desc' ? 'desc' : 'asc' } : undefined;

  const [total, data] = await Promise.all([
    model.count({ where: (args as any)?.where }),
    model.findMany({
      ...args,
      skip,
      take: limit,
      ...(orderBy ? { orderBy } : {}),
    }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export default paginateData;
