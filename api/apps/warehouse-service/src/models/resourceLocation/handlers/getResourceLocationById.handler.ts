import type { RequestHandler } from 'express';
import prisma from '../../../prismaClient';

type ResourceLocationParamsProps = {
  id: string;
};

const getResourceLocationByIdHandler: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params as ResourceLocationParamsProps;

    const location = await prisma.resourceLocation.findUnique({
      where: { id },
    });

    if (!location) {
      res.status(404).json({ error: 'Resource location not found' });
      return;
    }

    res.status(200).json(location);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default getResourceLocationByIdHandler;
