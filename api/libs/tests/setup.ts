import { hashPassword } from '../helpers/bcrypt';
import type { PrismaClient } from '@prisma/client';
import type { Test } from 'supertest';

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

export const cleanupUsers = async (
  prisma: PrismaClient,
  emails: string[] = ['testuser@example.com'],
) => {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: emails,
      },
    },
  });
};

export const loginTestUser = async ({
  api,
  email,
  password,
}: {
  api: { post: (url: string) => Test };
  email: string;
  password?: string;
}): Promise<string> => {
  const res = await api.post('/api/user/auth/login').send({ email, password });
  return res.body.accessToken;
};
