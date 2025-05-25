import type { RequestHandler } from 'express';
import parsePaginationQuery from '@libs/helpers/parsePaginationQuery';
import buildOrderBy from '@libs/helpers/buildOrderBy';
import type { RolePermission } from '@prisma/client';
import paginateData from '@libs/helpers/paginateData';
import prisma from '@apps/user-service/src/prismaClient';

type RolePermissionParamsProps = {
  roleId: string;
};

const getRolePermissionsHandler: RequestHandler = async (req, res) => {
  const { roleId } = req.params as RolePermissionParamsProps;

  try {
    const pagination = parsePaginationQuery(req);

    const orderBy = buildOrderBy<RolePermission>({
      sortBy: pagination.sortBy,
      sortOrder: pagination.sortOrder,
      allowedFields: ['id', 'roleId', 'permissionId'],
    });

    const result = await paginateData(
      prisma.rolePermission,
      {
        where: { roleId },
        orderBy,
        include: { permission: true },
      },
      pagination,
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default getRolePermissionsHandler;
