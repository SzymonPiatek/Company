import prisma from '../../../prismaClient';
import paginateData from '../../../utils/helpers/paginateData';
import parsePaginationQuery from '../../../utils/helpers/parsePaginationQuery';
import type { RequestHandler } from 'express';

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

    const queryConditions: Record<string, any> = {
      AND: [
        email ? { email: { contains: String(email), mode: 'insensitive' } } : undefined,
        firstName ? { firstName: { contains: String(firstName), mode: 'insensitive' } } : undefined,
        lastName ? { lastName: { contains: String(lastName), mode: 'insensitive' } } : undefined,
      ].filter(Boolean),
    };

    if (isActive !== undefined) {
      queryConditions.isActive = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    }

    if (search) {
      const searchWords = search.toString().trim().split(/\s+/);
      queryConditions.OR = searchWords.flatMap((word: string) => [
        { email: { contains: word, mode: 'insensitive' } },
        { firstName: { contains: word, mode: 'insensitive' } },
        { lastName: { contains: word, mode: 'insensitive' } },
      ]);
    }

    const result = await paginateData(
      prisma.user,
      {
        where: queryConditions,
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
