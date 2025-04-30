import type { RequestHandler } from 'express';
import prisma from '../../../prismaClient';

type AssignedResourceParamsProps = {
  id: string;
};

type AssignedResourceBodyProps = {
  locationId: string;
};

const updateAssignedResourceHandler: RequestHandler = async (req, res) => {
  const { id } = req.params as AssignedResourceParamsProps;
  const { locationId } = req.body as AssignedResourceBodyProps;

  if (!locationId) {
    res.status(400).json({ error: 'Missing locationId in request body' });
    return;
  }

  try {
    const existing = await prisma.assignedResource.findUnique({ where: { id } });

    if (!existing) {
      res.status(404).json({ error: 'Assigned resource not found' });
      return;
    }

    const updated = await prisma.assignedResource.update({
      where: { id },
      data: { locationId },
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default updateAssignedResourceHandler;
