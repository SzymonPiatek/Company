import prisma from '../../../prismaClient';
import type { RequestHandler } from 'express';
import type { ResourceLocationHistory } from '@prisma/client';
import parsePaginationQuery from '@libs/helpers/parsePaginationQuery';
import paginateData from '@libs/helpers/paginateData';
import buildQueryConditions from '@libs/helpers/buildQueryConditions';
import buildOrderByAdvanced from '@libs/helpers/buildOrderByAdvanced';

type ResourceLocationHistoryQueryProps = {
  search?: string;
  resourceId?: string;
};

const getResourceLocationHistoriesHandler: RequestHandler = async (req, res) => {
  try {
    const pagination = parsePaginationQuery(req);

    const orderBy = buildOrderByAdvanced<ResourceLocationHistory>({
      sortBy: pagination.sortBy,
      sortOrder: pagination.sortOrder,
      allowedFields: ['id', 'resourceId', 'fromLocationId', 'toLocationId', 'movedAt', 'createdAt', 'updatedAt'],
      allowedRelations: {
        resources: {
          fields: ['id', 'name', 'code', 'createdAt', 'updatedAt'],
          relations: {
            type: {
              fields: ['id', 'name', 'code'],
              relations: {},
            },
          },
        },
        fromLocationHistory: {
          fields: ['id', 'movedAt', 'createdAt', 'updatedAt'],
          relations: {},
        },
        toLocationHistory: {
          fields: ['id', 'movedAt', 'createdAt', 'updatedAt'],
          relations: {},
        },
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
