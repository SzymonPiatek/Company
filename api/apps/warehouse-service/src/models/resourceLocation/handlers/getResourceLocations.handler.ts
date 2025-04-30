import prisma from '../../../prismaClient';
import parsePaginationQuery from '@libs/helpers/parsePaginationQuery';
import buildOrderBy from '@libs/helpers/buildOrderBy';
import buildQueryConditions from '@libs/helpers/buildQueryConditions';
import paginateData from '@libs/helpers/paginateData';
import type { RequestHandler } from 'express';
import type { ResourceLocation } from '@prisma/client';

type ResourceLocationQueryProps = {
  name?: string;
  description?: string;
  search?: string;
};

const getResourceLocationsHandler: RequestHandler = async (req, res) => {
  try {
    const pagination = parsePaginationQuery(req);

    const orderBy = buildOrderBy<ResourceLocation>({
      sortBy: pagination.sortBy,
      sortOrder: pagination.sortOrder,
      allowedFields: ['id', 'name', 'description', 'createdAt', 'updatedAt'],
    });

    const { name, description, search } = req.query as ResourceLocationQueryProps;

    const where = buildQueryConditions({
      fields: ['name', 'description'],
      filters: { name, description },
      search,
    });

    const result = await paginateData(prisma.resourceLocation, { where, orderBy }, pagination);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default getResourceLocationsHandler;
