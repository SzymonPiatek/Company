import type { RequestHandler } from 'express';
import prisma from '@apps/user-service/src/prismaClient';

type RolePermissionParamsProps = {
  roleId: string;
  permissionId: string;
};

const removePermissionHandler: RequestHandler = async (req, res) => {
  const data = req.params as RolePermissionParamsProps;

  try {
    const exists = await prisma.rolePermission.findUnique({
      where: { roleId_permissionId: { roleId: data.roleId, permissionId: data.permissionId } },
    });

    if (!exists) {
      res.status(400).json({ error: 'Role permission not found' });
      return;
    }

    await prisma.rolePermission.delete({
      where: { roleId_permissionId: { roleId: data.roleId, permissionId: data.permissionId } },
    });

    res.status(204).json('Role permission deleted');
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default removePermissionHandler;
