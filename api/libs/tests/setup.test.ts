import type { PrismaClient, User } from '@prisma/client';
import { cleanupUsers, createTestUser } from './setup';
import { hashPassword } from '../helpers/bcrypt';

jest.mock('../helpers/bcrypt', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashedPass'),
}));

const mockPrisma = {
  user: {
    upsert: jest.fn(),
    deleteMany: jest.fn(),
  },
} as unknown as PrismaClient;

describe('setup helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTestUser', () => {
    it('creates or updates user with default values', async () => {
      const user = { id: '123', email: 'testuser@example.com' } as User;
      mockPrisma.user.upsert = jest.fn().mockResolvedValue(user);

      const result = await createTestUser(mockPrisma);

      expect(hashPassword).toHaveBeenCalledWith('securePass123!');
      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: { email: 'testuser@example.com' },
        update: expect.objectContaining({
          firstName: 'Test',
          lastName: 'User',
          isActive: true,
          password: 'hashedPass',
        }),
        create: expect.objectContaining({
          email: 'testuser@example.com',
          firstName: 'Test',
          lastName: 'User',
          isActive: true,
          password: 'hashedPass',
        }),
      });
      expect(result).toBe(user);
    });

    it('creates or updates user with overrides', async () => {
      const user = { id: '456', email: 'custom@example.com' } as User;
      mockPrisma.user.upsert = jest.fn().mockResolvedValue(user);

      const result = await createTestUser(mockPrisma, {
        email: 'custom@example.com',
        password: 'MyPass123!',
        firstName: 'Jane',
        lastName: 'Doe',
        isActive: false,
      });

      expect(hashPassword).toHaveBeenCalledWith('MyPass123!');
      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: { email: 'custom@example.com' },
        update: expect.objectContaining({
          email: 'custom@example.com',
          firstName: 'Jane',
          lastName: 'Doe',
          isActive: false,
          password: 'hashedPass',
        }),
        create: expect.objectContaining({
          email: 'custom@example.com',
          firstName: 'Jane',
          lastName: 'Doe',
          isActive: false,
          password: 'hashedPass',
        }),
      });
      expect(result).toBe(user);
    });
  });

  describe('cleanupUsers', () => {
    it('deletes multiple users by email', async () => {
      await cleanupUsers(mockPrisma, ['a@example.com', 'b@example.com']);

      expect(mockPrisma.user.deleteMany).toHaveBeenCalledWith({
        where: {
          email: {
            in: ['a@example.com', 'b@example.com'],
          },
        },
      });
    });
  });
});
