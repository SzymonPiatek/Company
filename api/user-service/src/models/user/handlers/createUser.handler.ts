import type { RequestHandler } from 'express';
import prisma from '../../../prismaClient';
import { hashPassword } from '../../../utils/helpers/bcrypt';

type CreateUserProps = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

const createUserHandler: RequestHandler<unknown, unknown, CreateUserProps> = async (req, res) => {
  try {
    const { email, firstName, lastName, password } = req.body;

    const isEmailExists = await prisma.user.findUnique({ where: { email } });

    if (isEmailExists) {
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: hashedPassword,
      },
      omit: {
        password: true,
      },
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user', details: error });
  }
};

export default createUserHandler;
