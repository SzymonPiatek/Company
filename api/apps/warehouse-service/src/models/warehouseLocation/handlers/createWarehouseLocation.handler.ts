import type { RequestHandler } from 'express';
import prisma from '@apps/warehouse-service/src/prismaClient';

type WarehouseLocationBodyProps = {
  name: string;
  description?: string;
};

const createWarehouseLocationHandler: RequestHandler = async (req, res) => {
  try {
    const { name, description } = req.body as WarehouseLocationBodyProps;

    const exists = await prisma.warehouseLocation.findFirst({
      where: { name },
    });

    if (exists) {
      res.status(400).send({ error: 'Warehouse location with this name already exists' });
      return;
    }

    const location = await prisma.warehouseLocation.create({
      data: { name, description },
    });

    res.status(201).json(location);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default createWarehouseLocationHandler;
