import type { RequestHandler } from 'express';
import prisma from '../../../prismaClient';

type ResourceBodyProps = {
  name: string;
  description?: string;
  isActive?: boolean;
  typeId: string;
};

const createResourceHandler: RequestHandler = async (req, res): Promise<void> => {
  try {
    const data = req.body as ResourceBodyProps;

    const resourceType = await prisma.resourceType.findUnique({
      where: { id: data.typeId },
    });

    if (!resourceType) {
      res.status(404).send({ error: 'Resource type not found' });
      return;
    }

    const count = await prisma.resource.count({
      where: { typeId: data.typeId },
    });
    const paddedCount = String(count + 1).padStart(6, '0');
    const code = `${resourceType.code}-${paddedCount}`;

    const type = await prisma.resource.create({
      data: {
        ...data,
        code,
      },
    });

    res.status(201).json(type);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default createResourceHandler;
