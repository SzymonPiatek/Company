import type { RequestHandler } from 'express';
import prisma from '../../../prismaClient';

type ResourceLocationParamsProps = {
  id: string;
};

type ResourceLocationBodyProps = {
  name?: string;
  description?: string;
};

const updateResourceLocationHandler: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params as ResourceLocationParamsProps;
    const data = req.body as ResourceLocationBodyProps;

    const existingLocation = await prisma.resourceLocation.findUnique({ where: { id } });
    if (!existingLocation) {
      res.status(404).json({ error: 'Resource location not found' });
      return;
    }

    if (data.name) {
      const nameTaken = await prisma.resourceLocation.findFirst({
        where: { name: data.name, NOT: { id } },
      });

      if (nameTaken) {
        res.status(409).json({ error: 'Resource location with this name already exists.' });
        return;
      }
    }
    const updated = await prisma.resourceLocation.update({
      where: { id },
      data,
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default updateResourceLocationHandler;
