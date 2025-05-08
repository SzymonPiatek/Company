import { RequestHandler } from 'express';
import prisma from '@apps/user-service/src/prismaClient';

type PermissionParamsProps = {
  id: string;
};

const getPermissionByIdHandler: RequestHandler = async (req, res) => {
  const { id } = req.params as PermissionParamsProps;

  try {
    const result = await prisma.permission.findUnique({
      where: { id },
    });

    if (!result) {
      res.status(404).json({ error: 'Permission not found' });
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default getPermissionByIdHandler;
