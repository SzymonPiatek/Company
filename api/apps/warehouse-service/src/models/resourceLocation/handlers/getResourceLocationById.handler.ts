import type { RequestHandler } from 'express';
import prisma from '../../../prismaClient';
import axios from 'axios';

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

    const assignedResources = await prisma.assignedResource.findMany({
      where: { locationId: id },
    });

    const enriched = await Promise.all(
      assignedResources.map(async (ar) => {
        try {
          const { data } = await axios.get(`${process.env.RESOURCE_SERVICE_URL}/resources/${ar.resourceId}`);
          return { ...ar, resource: data };
        } catch {
          return { ...ar, resource: null };
        }
      }),
    );

    res.status(200).json({ ...location, assignedResources: enriched });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default getResourceLocationByIdHandler;
