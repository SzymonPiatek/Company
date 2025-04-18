import type { RequestHandler } from 'express';
import prisma from '../../../prismaClient';

type UpdateResourceProps = {
  name?: string;
  description?: string;
  isActive?: boolean;
  typeId?: string;
};

const updateResourceHandler: RequestHandler<{ id: string }, unknown, UpdateResourceProps> = async (req, res): Promise<void> => {
  const { id } = req.params;
  const { name, description, isActive, typeId } = req.body;

  try {
    const existingResource = await prisma.resource.findUnique({ where: { id } });

    if (!existingResource) {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }

    const updated = await prisma.resource.update({
      where: { id },
      data: {
        name,
        description,
        isActive,
        typeId,
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default updateResourceHandler;
