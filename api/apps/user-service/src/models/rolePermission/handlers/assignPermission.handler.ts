import type { RequestHandler } from 'express';
import prisma from '@apps/user-service/src/prismaClient';

type RolePermissionParamsProps = {
  roleId: string;
  permissionId: string;
};

const assignPermissionHandler: RequestHandler = async (req, res) => {
  const data = req.params as RolePermissionParamsProps;

  if (!data.permissionId || !data.roleId) {
    res.status(400).json({ error: 'PermissionId and roleId are required' });
    return;
  }

  try {
    const role = await prisma.role.findUnique({
      where: { id: data.roleId },
    });
    if (!role) {
      res.status(404).json({ error: 'Role not found' });
      return;
    }

    const permission = await prisma.permission.findUnique({
      where: { id: data.permissionId },
    });
    if (!permission) {
      res.status(404).json({ error: 'Permission not found' });
      return;
    }
    const exists = await prisma.rolePermission.findUnique({
      where: { roleId_permissionId: { roleId: data.roleId, permissionId: data.permissionId } },
    });

    if (exists) {
      res.status(400).json({ error: 'Permission already assigned to role' });
      return;
    }

    const assignment = await prisma.rolePermission.create({
      data,
    });

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default assignPermissionHandler;
