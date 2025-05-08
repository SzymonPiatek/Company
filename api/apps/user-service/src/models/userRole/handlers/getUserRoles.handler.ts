import type { RequestHandler } from 'express';
import prisma from '@apps/user-service/src/prismaClient';
import parsePaginationQuery from '@libs/helpers/parsePaginationQuery';
import buildOrderBy from '@libs/helpers/buildOrderBy';
import type { UserRole } from '@prisma/client';
import paginateData from '@libs/helpers/paginateData';

type UserRoleParamsProps = {
  userId: string;
};

const getUserRolesHandler: RequestHandler = async (req, res) => {
  const { userId } = req.params as UserRoleParamsProps;

  try {
    const pagination = parsePaginationQuery(req);

    const orderBy = buildOrderBy<UserRole>({
      sortBy: pagination.sortBy,
      sortOrder: pagination.sortOrder,
      allowedFields: ['userId', 'roleId'],
    });

    const result = await paginateData(
      prisma.userRole,
      { where: { userId }, orderBy, include: { role: true } },
      pagination,
    );

    res.status(200).json(result);
    return;
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default getUserRolesHandler;
