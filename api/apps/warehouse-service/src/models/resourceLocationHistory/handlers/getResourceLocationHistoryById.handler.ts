import type { RequestHandler } from 'express';
import prisma from '../../../prismaClient';

const getResourceLocationHistoryByIdHandler: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await prisma.resourceLocationHistory.findUnique({
      where: { id },
      include: {
        fromLocation: true,
        toLocation: true,
      },
    });

    if (!entry) {
      res.status(404).json({ error: 'History record not found' });
      return;
    }

    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default getResourceLocationHistoryByIdHandler;
