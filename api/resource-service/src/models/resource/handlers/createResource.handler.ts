import type { RequestHandler } from 'express';
import prisma from '../../../prismaClient';

type CreateResourceProps = {
  name: string;
  description?: string;
  isActive?: boolean;
  typeId: string;
};

const createResourceTypeHandler: RequestHandler<unknown, unknown, CreateResourceProps> = async (req, res): Promise<void> => {
  try {
    const { name, description, isActive = false, typeId } = req.body;

    const resourceType = await prisma.resourceType.findUnique({
      where: { id: typeId },
    });

    if (!resourceType) {
      res.status(404).send({ error: 'Resource type not found' });
      return;
    }

    const count = await prisma.resource.count({
      where: { typeId },
    });
    const paddedCount = String(count + 1).padStart(6, '0');
    const code = `${resourceType.code}-${paddedCount}`;

    const type = await prisma.resource.create({
      data: { name, code, description, isActive, typeId },
    });

    res.status(201).json(type);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default createResourceTypeHandler;
