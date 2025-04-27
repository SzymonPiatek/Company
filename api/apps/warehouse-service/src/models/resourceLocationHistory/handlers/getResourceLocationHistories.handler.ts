import prisma from '../../../prismaClient';
import type { RequestHandler } from 'express';
import type { ResourceLocationHistory } from '@prisma/client';
import parsePaginationQuery from '@libs/helpers/parsePaginationQuery';
import buildOrderBy from '@libs/helpers/buildOrderBy';
import paginateData from '@libs/helpers/paginateData';
import buildQueryConditions from '@libs/helpers/buildQueryConditions';

type ResourceLocationHistoryQueryProps = {
  search?: string;
  resourceId?: string;
};

const getResourceLocationHistoriesHandler: RequestHandler = async (req, res) => {
  try {
    const pagination = parsePaginationQuery(req);

    const orderBy = buildOrderBy<ResourceLocationHistory>({
      sortBy: pagination.sortBy,
      sortOrder: pagination.sortOrder,
      allowedFields: ['id', 'resourceId', 'fromLocationId', 'toLocationId', 'movedAt', 'createdAt', 'updatedAt'],
      allowedRelations: {
        resource: ['id', 'name', 'code', 'description', 'isActive', 'typeId', 'createdAt', 'updatedAt'],
        fromLocation: ['id', 'name', 'description', 'createdAt', 'updatedAt'],
        toLocation: ['id', 'name', 'description', 'createdAt', 'updatedAt'],
      },
    });

    const { resourceId, search } = req.query as ResourceLocationHistoryQueryProps;

    const where = buildQueryConditions({
      fields: ['id'],
      filters: { resourceId },
      search,
    });

    const result = await paginateData(
      prisma.resourceLocationHistory,
      {
        where,
        orderBy,
        include: {
          resource: true,
          fromLocation: true,
          toLocation: true,
        },
      },
      pagination,
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default getResourceLocationHistoriesHandler;
