import { RequestHandler } from 'express';
import prisma from '@apps/user-service/src/prismaClient';

type RoleParamsProps = {
  id: string;
};

type RoleBodyProps = {
  name?: string;
  description?: string;
};

const updateRoleHandler: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params as RoleParamsProps;
    const data = req.body as RoleBodyProps;

    if (data.name) {
      const isNameExists = await prisma.role.findUnique({
        where: { name: data.name, NOT: { id } },
      });

      if (isNameExists) {
        res.status(409).json({ error: 'Role with this name already exists' });
        return;
      }
    }

    const role = await prisma.role.update({
      where: { id },
      data,
    });

    res.status(200).json(role);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default updateRoleHandler;
