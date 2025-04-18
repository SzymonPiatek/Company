import { RequestHandler } from 'express';
import prisma from '../../../prismaClient';

const getUserByIdHandler: RequestHandler = async (req, res): Promise<void> => {
  const { id } = req.params;

  try {
    const results = await prisma.user.findUnique({
      where: { id },
    });

    if (!results) {
      res.status(404).json({ error: 'Resource not found' });
      return;
    }

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default getUserByIdHandler;
