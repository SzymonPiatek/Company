import type { RequestHandler } from 'express';
import prisma from '@apps/user-service/src/prismaClient';

type PermissionBodyProps = {
  name: string;
  description?: string;
};

const createPermissionHandler: RequestHandler = async (req, res) => {
  const data = req.body as PermissionBodyProps;

  if (!data.name) {
    res.status(400).json('Name is required');
    return;
  }

  try {
    if (!data.name) {
      res.status(400).json('Name is required');
      return;
    }

    const permission = await prisma.permission.create({ data });

    res.status(201).json(permission);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default createPermissionHandler;
