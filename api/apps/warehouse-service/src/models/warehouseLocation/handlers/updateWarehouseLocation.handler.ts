import type { RequestHandler } from 'express';
import prisma from '@apps/warehouse-service/src/prismaClient';

type WarehouseLocationParamsProps = {
  id: string;
};

type WarehouseLocationBodyProps = {
  name?: string;
  description?: string;
};

const updateWarehouseLocationHandler: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params as WarehouseLocationParamsProps;
    const { name, description } = req.body as WarehouseLocationBodyProps;

    if (!id) {
      res.status(400).send({ error: 'Missing location ID' });
      return;
    }

    const warehouseLocation = await prisma.warehouseLocation.findUnique({
      where: { id },
    });

    if (!warehouseLocation) {
      res.status(404).send({ error: 'Warehouse location not found' });
      return;
    }

    const updatedLocation = await prisma.warehouseLocation.update({
      where: { id },
      data: {
        name: name ?? undefined,
        description: description ?? undefined,
      },
    });

    res.status(200).json(updatedLocation);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default updateWarehouseLocationHandler;
