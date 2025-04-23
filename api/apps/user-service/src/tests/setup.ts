import bcrypt from 'bcryptjs';
import prisma from '../prismaClient';

export const createTestUser = async () => {
  const password = await bcrypt.hash('Test1234!', 10);
  return prisma.user.create({
    data: {
      email: 'testuser@example.com',
      password,
      firstName: 'Test',
      lastName: 'User',
      isActive: true,
    },
  });
};

export const cleanupUsers = async () => {
  await prisma.user.deleteMany({ where: { email: 'testuser@example.com' } });
};
