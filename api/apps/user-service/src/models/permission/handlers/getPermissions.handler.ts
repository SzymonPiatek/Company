import type { RequestHandler } from 'express';
import parsePaginationQuery from '@libs/helpers/parsePaginationQuery';
import buildOrderBy from '@libs/helpers/buildOrderBy';
import type { Permission } from '@prisma/client';
import buildQueryConditions from '@libs/helpers/buildQueryConditions';
import paginateData from '@libs/helpers/paginateData';
import prisma from '@apps/user-service/src/prismaClient';

type PermissionsQueryProps = {
  name?: string;
  description?: string;
  search?: string;
};

const getPermissionsHandler: RequestHandler = async (req, res) => {
  try {
    const pagination = parsePaginationQuery(req);

    const orderBy = buildOrderBy<Permission>({
      sortBy: pagination.sortBy,
      sortOrder: pagination.sortOrder,
      allowedFields: ['id', 'name', 'description', 'createdAt', 'updatedAt'],
    });

    const { name, description, search } = req.query as PermissionsQueryProps;

    const where = buildQueryConditions({
      fields: ['name', 'description'],
      filters: { name, description },
      search,
    });

    const result = await paginateData(
      prisma.permission,
      {
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

export default getPermissionsHandler;
