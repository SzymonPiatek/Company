import type { RequestHandler } from 'express';
import prisma from '../../../prismaClient';

type UpdateResourceTypeProps = {
  name: string;
  code: string;
};

const updateResourceTypeHandler: RequestHandler<{ id: string }, unknown, UpdateResourceTypeProps> = async (req, res): Promise<void> => {
  const { id } = req.params;
  const { name, code } = req.body;

  try {
    const existingType = await prisma.resourceType.findUnique({ where: { id } });

    if (!existingType) {
      res.status(404).json({ error: 'ResourceType not found' });
      return;
    }

    const nameTaken = await prisma.resourceType.findFirst({
      where: {
        name,
        NOT: { id },
      },
    });

    if (nameTaken) {
      res.status(409).json({ error: 'Resource name already exists' });
      return;
    }

    const codeTaken = await prisma.resourceType.findFirst({
      where: {
        code,
        NOT: { id },
      },
    });

    if (codeTaken) {
      res.status(409).json({ error: 'Resource code already exists' });
      return;
    }

    const updated = await prisma.resourceType.update({
      where: { id },
      data: { name, code },
    });

    if (updated && existingType.code !== code) {
      const resources = await prisma.resource.findMany({
        where: { typeId: id },
      });

      await Promise.all(
        resources.map((resource) => {
          const parts = resource.code.split('-');
          const numeric = parts[1] || '000001';
          const newCode = `${code}-${numeric}`;
          return prisma.resource.update({
            where: { id: resource.id },
            data: { code: newCode },
          });
        }),
      );
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default updateResourceTypeHandler;
