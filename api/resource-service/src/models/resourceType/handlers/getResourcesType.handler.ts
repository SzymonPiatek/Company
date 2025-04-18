import prisma from '../../../prismaClient';
import paginateData from '../../../utils/helpers/paginateData';
import parsePaginationQuery from '../../../utils/helpers/parsePaginationQuery';
import type { RequestHandler } from 'express';

const getResourceTypesHandler: RequestHandler = async (req, res) => {
  try {
    const pagination = parsePaginationQuery(req);

    const result = await paginateData(
      prisma.resourceType,
      {
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
