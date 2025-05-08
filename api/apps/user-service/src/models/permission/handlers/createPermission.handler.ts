import type { RequestHandler } from 'express';
import prisma from '@apps/user-service/src/prismaClient';

type PermissionBodyProps = {
  name: string;
  description?: string;
  action: string;
  subject: string;
};

const createPermissionHandler: RequestHandler = async (req, res) => {
  const data = req.body as PermissionBodyProps;

  if (!data.name || !data.action || !data.subject) {
    res.status(400).json('Name, action and subject are required');
    return;
  }

  const exists = await prisma.permission.findFirst({
    where: { action: data.action, subject: data.subject },
  });

  if (exists) {
    res.status(409).json('Permission for this action and subject already exists');
    return;
  }

  try {
    const permission = await prisma.permission.create({ data });

    res.status(201).json(permission);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default createPermissionHandler;
