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

    const existing = await prisma.resourceLocation.findUnique({
      where: { name: data.name, NOT: { id } },
    });

    if (existing) {
      res.status(409).json({ error: 'Resource location with this name already exists.' });
      return;
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
