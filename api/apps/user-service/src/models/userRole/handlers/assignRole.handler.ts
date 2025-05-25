import type { RequestHandler } from 'express';
import prisma from '@apps/user-service/src/prismaClient';

type UserRoleParamsProps = {
  userId: string;
  roleId: string;
};

const assignRoleHandler: RequestHandler = async (req, res) => {
  const data = req.params as UserRoleParamsProps;

  try {
    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const role = await prisma.role.findUnique({ where: { id: data.roleId } });
    if (!role) {
      res.status(404).json({ error: 'Role not found' });
      return;
    }

    const exists = await prisma.userRole.findUnique({
      where: {
        userId_roleId: { userId: data.userId, roleId: data.roleId },
      },
    });

    if (exists) {
      res.status(400).json({ error: 'User already has this role' });
      return;
    }

    const assignment = await prisma.userRole.create({
      data,
    });

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default assignRoleHandler;
