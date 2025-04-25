import prisma from '../../../prismaClient';
import type { RequestHandler } from 'express';
import type { Resource } from '@prisma/client';
import parsePaginationQuery from '@libs/helpers/parsePaginationQuery';
import buildQueryConditions from '@libs/helpers/buildQueryConditions';
import paginateData from '@libs/helpers/paginateData';
import buildOrderBy from '@libs/helpers/buildOrderBy';

type ResourcesQueryProps = {
  name?: string;
  code?: string;
  description?: string;
  isActive?: string;
  search?: string;
};

const getResourcesHandler: RequestHandler = async (req, res) => {
  try {
    const pagination = parsePaginationQuery(req);

    const orderBy = buildOrderBy<Resource>({
      sortBy: pagination.sortBy,
      sortOrder: pagination.sortOrder,
      allowedFields: ['id', 'name', 'code', 'description', 'isActive', 'typeId', 'createdAt', 'updatedAt'],
      allowedRelations: {
        type: ['id', 'name', 'code', 'createdAt', 'updatedAt'],
      },
    });

    const { name, code, description, isActive, search } = req.query as ResourcesQueryProps;

    const where = buildQueryConditions({
      fields: ['name', 'code', 'description'],
      filters: { name, code, description, isActive },
      search,
    });

    const result = await paginateData(
      prisma.resource,
      {
        where,
        orderBy,
        include: { type: true },
      },
      pagination,
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default getResourcesHandler;
