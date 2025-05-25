import { RequestHandler } from 'express';
import prisma from '../../../prismaClient';

type UserParamsProps = {
  id: string;
};

const getUserByIdHandler: RequestHandler = async (req, res): Promise<void> => {
  const { id } = req.params as UserParamsProps;

  try {
    const result = await prisma.user.findUnique({
      where: { id },
      omit: {
        password: true,
      },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!result) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default getUserByIdHandler;
