import type { RequestHandler } from 'express';
import prisma from '@apps/user-service/src/prismaClient';

type UserRoleParamsProps = {
  userId: string;
  roleId: string;
};

const removeRoleHandler: RequestHandler = async (req, res) => {
  const data = req.params as UserRoleParamsProps;

  try {
    const exists = await prisma.userRole.findUnique({
      where: { userId_roleId: { userId: data.userId, roleId: data.roleId } },
    });

    if (!exists) {
      res.status(400).json({ error: 'User have not this role' });
      return;
    }

    await prisma.userRole.delete({
      where: { userId_roleId: { userId: data.userId, roleId: data.roleId } },
    });

    res.status(204).send('User role');
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default removeRoleHandler;
