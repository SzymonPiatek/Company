import type { RequestHandler } from 'express';
import prisma from '../../../prismaClient';
import { comparePassword } from '@libs/helpers/bcrypt';
import { generateAccessToken, generateRefreshToken } from '@libs/helpers/jwt';

type LoginBodyProps = {
  email: string;
  password: string;
};

const loginHandler: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body as LoginBodyProps;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const accessToken = generateAccessToken({ userId: user.id });
    const refreshToken = generateRefreshToken({ userId: user.id });

    res.status(200).json({
      user: { ...user, password: undefined },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error });
  }
};

export default loginHandler;
