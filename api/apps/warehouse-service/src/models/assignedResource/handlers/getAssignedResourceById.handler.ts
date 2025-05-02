import type { RequestHandler } from 'express';
import prisma from '../../../prismaClient';

type AssignerResourceParamsProps = {
  id: string;
};

const getAssignedResourceByIdHandler: RequestHandler = async (req, res) => {
  const { id } = req.params as AssignerResourceParamsProps;

  try {
    const assigned = await prisma.assignedResource.findUnique({
      where: { id },
      include: {
        location: true,
      },
    });

    if (!assigned) {
      res.status(404).json({ error: 'Assigned resource not found' });
      return;
    }

    res.status(200).json(assigned);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default getAssignedResourceByIdHandler;
