import type { RequestHandler } from 'express';
import prisma from '@apps/user-service/src/prismaClient';
import parsePaginationQuery from '@libs/helpers/parsePaginationQuery';
import buildOrderBy from '@libs/helpers/buildOrderBy';
import type { Role } from '@prisma/client';
import buildQueryConditions from '@libs/helpers/buildQueryConditions';
import paginateData from '@libs/helpers/paginateData';

type RolesQueryProps = {
  name?: string;
  description?: string;
  search?: string;
};

const getRolesHandler: RequestHandler = async (req, res) => {
  try {
    const pagination = parsePaginationQuery(req);

    const orderBy = buildOrderBy<Role>({
      sortBy: pagination.sortBy,
      sortOrder: pagination.sortOrder,
      allowedFields: ['id', 'name', 'description'],
    });

    const { name, description, search } = req.query as RolesQueryProps;

    const where = buildQueryConditions({
      fields: ['name', 'description'],
      filters: { name, description },
      search,
    });

    const result = await paginateData(
      prisma.role,
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

export default getRolesHandler;
