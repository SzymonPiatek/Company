import { RequestHandler } from 'express';
import paginateData from '../../../utils/helpers/paginateData';
import parsePaginationQuery from '../../../utils/helpers/parsePaginationQuery';
import prisma from '../../../prismaClient';

const getUsersHandler: RequestHandler = async (req, res): Promise<void> => {
  try {
    const pagination = parsePaginationQuery(req);

    const result = await paginateData(prisma.user, pagination);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default getUsersHandler;
