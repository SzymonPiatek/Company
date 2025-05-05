import { RequestHandler } from 'express';
import prisma from '@apps/user-service/src/prismaClient';

type PermissionParamsProps = {
  id: string;
};

type PermissionBodyProps = {
  name?: string;
  description?: string;
};

const updatePermissionHandler: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params as PermissionParamsProps;
    const data = req.body as PermissionBodyProps;

    if (data.name) {
      const isNameExists = await prisma.permission.findUnique({
        where: { name: data.name, NOT: { id } },
      });

      if (isNameExists) {
        res.status(409).json({ error: 'Role with this name already exists' });
        return;
      }
    }

    const permission = await prisma.permission.update({
      where: { id },
      data,
    });

    res.status(200).json(permission);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default updatePermissionHandler;
