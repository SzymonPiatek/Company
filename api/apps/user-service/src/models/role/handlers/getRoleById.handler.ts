import type { RequestHandler } from 'express';
import prisma from '@apps/user-service/src/prismaClient';

type RoleParamsProps = {
  id: string;
};

const getRoleByIdHandler: RequestHandler = async (req, res) => {
  const { id } = req.params as RoleParamsProps;

  try {
    const result = await prisma.role.findUnique({
      where: {
        id,
      },
    });

    if (!result) {
      res.status(404).json({ error: 'Role not found' });
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default getRoleByIdHandler;
