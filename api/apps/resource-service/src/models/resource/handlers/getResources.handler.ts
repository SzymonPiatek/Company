import prisma from '../../../prismaClient';
import paginateData from '../../../utils/helpers/paginateData';
import parsePaginationQuery from '../../../utils/helpers/parsePaginationQuery';
import type { RequestHandler } from 'express';
import buildQueryConditions from '../../../utils/helpers/buildQueryConditions';

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
