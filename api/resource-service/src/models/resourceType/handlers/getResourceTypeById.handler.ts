import type { RequestHandler } from 'express';
import prisma from '../../../prismaClient';

const getResourceTypeByIdHandler: RequestHandler = async (req, res): Promise<void> => {
  const { id } = req.params;

  try {
    const resource = await prisma.resourceType.findUnique({
      where: { id },
      include: {
        resources: true,
      },
    });

    if (!resource) {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }

    res.status(200).json(resource);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default getResourceTypeByIdHandler;
