import { hashPassword } from '../helpers/bcrypt';
import type { PrismaClient } from '@prisma/client';
import type { Test } from 'supertest';
import jwt from 'jsonwebtoken';

export const createTestUser = async (
  prisma: PrismaClient,
  overrides: Partial<{
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    isActive: boolean;
  }> = {},
) => {
  const plainPassword = overrides.password || 'securePass123!';
  const hashedPassword = await hashPassword(plainPassword);

  const defaultData = {
    email: 'testuser@example.com',
    firstName: 'Test',
    lastName: 'User',
    password: hashedPassword,
    isActive: true,
  };

  return prisma.user.create({
    data: {
      ...defaultData,
      ...overrides,
      password: hashedPassword,
    },
  });
};

export const cleanupUsers = async (prisma: PrismaClient, emails: string[]) => {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: emails,
      },
    },
  });
};

export const mockAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' });
};
