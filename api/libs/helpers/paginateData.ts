import type { PaginationParams, PaginationResult } from '../types/types';

interface PrismaModel<T, Where, Args extends { where?: Where }> {
  count: (args: { where?: Where }) => Promise<number>;
  findMany: (args: Args & { skip: number; take: number }) => Promise<T[]>;
}

async function paginateData<T, Where = unknown, Args extends { where?: Where } = { where?: Where }>(
  model: PrismaModel<T, Where, Args>,
  args: Args,
  { page = 1, limit = 10 }: PaginationParams,
): Promise<PaginationResult<T>> {
  const skip = (page - 1) * limit;

  const [total, data] = await Promise.all([model.count({ where: args.where }), model.findMany({ ...args, skip, take: limit })]);

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
