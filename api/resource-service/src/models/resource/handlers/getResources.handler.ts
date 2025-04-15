import { Request, Response } from 'express';
import prisma from '../../../prismaClient';

const getResourcesHandler = async (req: Request, res: Response) => {
  try {
    const resources = await prisma.resource.findMany({
      include: { type: true },
    });

    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default getResourcesHandler;
