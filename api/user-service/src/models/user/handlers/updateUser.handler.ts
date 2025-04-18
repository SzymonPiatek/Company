import type { RequestHandler } from 'express';
import prisma from '../../../prismaClient';
import { hashPassword } from '../../../utils/helpers/bcrypt';

type UpdateUserProps = {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  isActive?: boolean;
};

const updateUserHandler: RequestHandler<{ id: string }, unknown, UpdateUserProps> = async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (data.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email, NOT: { id } },
      });

      if (existingUser && existingUser.id !== id) {
        res.status(409).json({ error: 'Email is already taken by another user' });
        return;
      }
    }

    const newHashedPassword = data.password ? await hashPassword(data.password) : undefined;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...data,
        ...(newHashedPassword && { password: newHashedPassword }),
      },
      omit: {
        password: true,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user', details: error });
  }
};

export default updateUserHandler;
