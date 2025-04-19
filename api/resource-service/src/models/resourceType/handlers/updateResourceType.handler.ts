import type { RequestHandler } from 'express';
import prisma from '../../../prismaClient';

type ResourceTypeParamsProps = {
  id: string;
};

type ResourceTypeBodyProps = {
  name: string;
  code: string;
};

const updateResourceTypeHandler: RequestHandler = async (req, res): Promise<void> => {
  const { id } = req.params as ResourceTypeParamsProps;
  const data = req.body as ResourceTypeBodyProps;

  try {
    const existingType = await prisma.resourceType.findUnique({ where: { id } });

    if (!existingType) {
      res.status(404).json({ error: 'ResourceType not found' });
      return;
    }

    const nameTaken = await prisma.resourceType.findFirst({
      where: {
        name: data.name,
        NOT: { id },
      },
    });

    if (nameTaken) {
      res.status(409).json({ error: 'Resource name already exists' });
      return;
    }

    const codeTaken = await prisma.resourceType.findFirst({
      where: {
        code: data.code,
        NOT: { id },
      },
    });

    if (codeTaken) {
      res.status(409).json({ error: 'Resource code already exists' });
      return;
    }

    const updatedType = await prisma.$transaction(async (tx) => {
      const updated = await tx.resourceType.update({
        where: { id },
        data,
      });

      if (existingType.code !== data.code) {
        const resources = await tx.resource.findMany({
          where: { typeId: id },
        });

        await Promise.all(
          resources.map((resource) => {
            const parts = resource.code.split('-');
            const numeric = parts[1] || '000001';
            const newCode = `${data.code}-${numeric}`;
            return tx.resource.update({
              where: { id: resource.id },
              data: { code: newCode },
            });
          }),
        );
      }

      return updated;
    });

    res.status(200).json(updatedType);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default updateResourceTypeHandler;
