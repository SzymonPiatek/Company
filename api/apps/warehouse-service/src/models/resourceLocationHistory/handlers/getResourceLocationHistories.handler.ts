import type { RequestHandler } from 'express';
import prisma from '../../../prismaClient';
import parsePaginationQuery from '@libs/helpers/parsePaginationQuery';
import paginateData from '@libs/helpers/paginateData';
import buildOrderBy from '@libs/helpers/buildOrderBy';
import type { ResourceLocationHistory } from '@prisma/client';
import buildQueryConditions from '@libs/helpers/buildQueryConditions';

type ResourceLocationHistoryQueryProps = {
  resourceId?: string;
  fromLocationId?: string;
  toLocationId?: string;
  search?: string;
};

const getResourceLocationHistoriesHandler: RequestHandler = async (req, res) => {
  try {
    const pagination = parsePaginationQuery(req);

    const orderBy = buildOrderBy<ResourceLocationHistory>({
      sortBy: pagination.sortBy,
      sortOrder: pagination.sortOrder,
      allowedFields: ['id', 'resourceId', 'fromLocationId', 'toLocationId', 'movedAt'],
    });

    const { resourceId, fromLocationId, toLocationId, search } =
      req.query as ResourceLocationHistoryQueryProps;

    const where = buildQueryConditions({
      fields: ['id', 'resourceId', 'fromLocationId', 'toLocationId'],
      filters: { resourceId, fromLocationId, toLocationId },
      search,
    });

    const result = await paginateData(
      prisma.resourceLocationHistory,
      {
        include: {
          fromLocation: true,
          toLocation: true,
        },
        where,
        orderBy,
      },
      pagination,
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default getResourceLocationHistoriesHandler;
