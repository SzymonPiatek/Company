import prisma from '../../../prismaClient';
import paginateData from '../../../utils/helpers/paginateData';
import parsePaginationQuery from '../../../utils/helpers/parsePaginationQuery';
import type { RequestHandler } from 'express';
import buildQueryConditions from '../../../utils/helpers/buildQueryConditions';

type UsersQueryProps = {
  email?: string;
  firstName?: string;
  lastName?: string;
  isActive?: string;
  search?: string;
};

const getUsersHandler: RequestHandler = async (req, res) => {
  try {
    const pagination = parsePaginationQuery(req);

    const { email, firstName, lastName, isActive, search } = req.query as UsersQueryProps;

    const where = buildQueryConditions({
      fields: ['email', 'firstName', 'lastName'],
      filters: { email, firstName, lastName },
      search,
    });

    if (isActive !== undefined) {
      const parsed = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
      if (parsed !== undefined) {
        where.isActive = parsed;
      }
    }

    const result = await paginateData(
      prisma.user,
      {
        where,
        omit: {
          password: true,
        },
      },
      pagination,
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default getUsersHandler;
