import prisma from '../../../prismaClient';
import paginateData from '@libs/helpers/paginateData';
import parsePaginationQuery from '@libs//helpers/parsePaginationQuery';
import type { RequestHandler } from 'express';
import buildQueryConditions from '@libs/helpers/buildQueryConditions';

type ResourceTypeQueryProps = {
  name?: string;
  code?: string;
  search?: string;
};

const getResourceTypesHandler: RequestHandler = async (req, res) => {
  try {
    const pagination = parsePaginationQuery(req);

    const { name, code, search } = req.query as ResourceTypeQueryProps;

    const where = buildQueryConditions({
      fields: ['name', 'code'],
      filters: { name, code },
      search,
    });

    const result = await paginateData(
      prisma.resourceType,
      {
        where,
        include: {
          resources: true,
        },
      },
      pagination,
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default getResourceTypesHandler;
