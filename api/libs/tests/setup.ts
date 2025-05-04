import { hashPassword } from '../helpers/bcrypt';
import type { PrismaClient } from '@prisma/client';
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
  const email = overrides.email || 'testuser@example.com';
  const plainPassword = overrides.password || 'securePass123!';
  const hashedPassword = await hashPassword(plainPassword);

  const defaultData = {
    firstName: 'Test',
    lastName: 'User',
    isActive: true,
  };

  return prisma.user.upsert({
    where: { email },
    update: {
      ...defaultData,
      ...overrides,
      password: hashedPassword,
    },
    create: {
      ...defaultData,
      ...overrides,
      email,
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
