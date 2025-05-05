import { hashPassword } from '../helpers/bcrypt';
import type { PrismaClient } from '@prisma/client';
import { sign } from 'jsonwebtoken';

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
  return sign({ userId }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '15m' });
};

jest.mock(
  '../helpers/middlewares/auth.middleware',
  () => (_req: any, _res: any, next: any) => next(),
);

jest.mock(
  '../helpers/middlewares/emptyBody.middleware',
  () => (_req: any, _res: any, next: any) => next(),
);

jest.mock('axios');
jest.mock('../helpers/parsePaginationQuery', () => jest.fn());
jest.mock('../helpers/buildOrderBy', () => jest.fn());
jest.mock('../helpers/buildQueryConditions', () => jest.fn());
jest.mock('../helpers/paginateData', () => jest.fn());
jest.mock('../helpers/bcrypt', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));
jest.mock('../helpers/jwt', () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
}));
