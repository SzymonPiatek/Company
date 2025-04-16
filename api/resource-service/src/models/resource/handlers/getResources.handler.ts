import type { Request, Response } from 'express';
import prisma from '../../../prismaClient';
import paginateData from '../../../utils/helpers/paginateData';

const getResourcesHandler = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = req.query.sortBy as string;
    const sortOrder = req.query.sortOrder as string;

    const result = await paginateData(
      prisma.resource,
      {
        include: { type: true },
      },
      { page, limit, sortBy, sortOrder },
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default getResourcesHandler;
