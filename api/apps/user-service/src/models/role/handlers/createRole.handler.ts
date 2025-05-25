import type { RequestHandler } from 'express';
import prisma from '../../../prismaClient';

type CreateRoleProps = {
  name: string;
  description?: string;
};

const createRoleHandler: RequestHandler = async (req, res) => {
  const data = req.body as CreateRoleProps;

  if (!data.name) {
    res.status(400).json('Name is required');
    return;
  }

  try {
    const isNameExists = await prisma.role.findUnique({ where: { name: data.name } });

    if (isNameExists) {
      res.status(400).json({ error: 'Role with this name already exists' });
      return;
    }

    const role = await prisma.role.create({ data });

    res.status(201).send(role);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default createRoleHandler;
