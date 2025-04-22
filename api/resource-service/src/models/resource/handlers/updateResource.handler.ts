import type { RequestHandler } from 'express';
import prisma from '../../../prismaClient';

type ResourceParamsProps = {
  id: string;
};

type ResourceBodyProps = {
  name?: string;
  description?: string;
  isActive?: boolean;
  typeId?: string;
};

const updateResourceHandler: RequestHandler = async (req, res): Promise<void> => {
  const { id } = req.params as ResourceParamsProps;
  const data = req.body as ResourceBodyProps;

  try {
    const existingResource = await prisma.resource.findUnique({ where: { id } });

    if (!existingResource) {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }

    const updated = await prisma.resource.update({
      where: { id },
      data,
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default updateResourceHandler;
