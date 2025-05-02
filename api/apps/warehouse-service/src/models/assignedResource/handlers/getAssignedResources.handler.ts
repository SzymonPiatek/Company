import type { RequestHandler } from 'express';
import prisma from '../../../prismaClient';
import parsePaginationQuery from '@libs/helpers/parsePaginationQuery';
import buildOrderBy from '@libs/helpers/buildOrderBy';
import buildQueryConditions from '@libs/helpers/buildQueryConditions';
import paginateData from '@libs/helpers/paginateData';
import type { AssignedResource } from '@prisma/client';

type AssignedResourceQueryProps = {
  resourceId?: string;
  locationId?: string;
  search?: string;
};

const getAssignedResourcesHandler: RequestHandler = async (req, res) => {
  try {
    const pagination = parsePaginationQuery(req);

    const orderBy = buildOrderBy<AssignedResource>({
      sortBy: pagination.sortBy,
      sortOrder: pagination.sortOrder,
      allowedFields: ['id', 'resourceId', 'locationId', 'assignedAt'],
      allowedRelations: {
        location: {
          fields: ['id', 'name', 'description', 'createdAt', 'updatedAt'],
        },
      },
    });

    const { resourceId, locationId, search } = req.query as AssignedResourceQueryProps;

    const where = buildQueryConditions({
      fields: ['resourceId', 'locationId'],
      filters: { resourceId, locationId },
      search,
    });

    const result = await paginateData(
      prisma.assignedResource,
      {
        where,
        orderBy,
        include: {
          location: true,
        },
      },
      pagination,
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      details: error,
    });
  }
};

export default getAssignedResourcesHandler;
