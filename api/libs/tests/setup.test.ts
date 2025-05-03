import type { PrismaClient, User } from '@prisma/client';
import { cleanupUsers, createTestUser, loginTestUser } from './setup';
import { hashPassword } from '../helpers/bcrypt';

jest.mock('../helpers/bcrypt', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashedPass'),
}));

const mockPrisma = {
  user: {
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
} as unknown as PrismaClient;

describe('setup helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTestUser', () => {
    it('creates user with default values', async () => {
      const user = { id: '123', email: 'testuser@example.com' } as User;
      mockPrisma.user.create = jest.fn().mockResolvedValue(user);

      const result = await createTestUser(mockPrisma);

      expect(hashPassword).toHaveBeenCalledWith('securePass123!');
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'testuser@example.com',
          firstName: 'Test',
          lastName: 'User',
          password: 'hashedPass',
          isActive: true,
        },
      });
      expect(result).toBe(user);
    });

    it('creates user with overrides', async () => {
      const user = { id: '123', email: 'custom@example.com' } as User;
      mockPrisma.user.create = jest.fn().mockResolvedValue(user);

      const result = await createTestUser(mockPrisma, {
        email: 'custom@example.com',
        password: 'MyPass123!',
      });

      expect(hashPassword).toHaveBeenCalledWith('MyPass123!');
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: 'custom@example.com',
          password: 'hashedPass',
        }),
      });
      expect(result).toBe(user);
    });
  });

  describe('cleanupUsers', () => {
    it('deletes default test user', async () => {
      await cleanupUsers(mockPrisma);

      expect(mockPrisma.user.deleteMany).toHaveBeenCalledWith({
        where: {
          email: {
            in: ['testuser@example.com'],
          },
        },
      });
    });

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

  describe('loginTestUser', () => {
    it('logs in user and returns access token', async () => {
      const mockSend = jest.fn().mockResolvedValue({
        body: {
          accessToken: 'test-token',
        },
      });

      const mockApi = {
        post: jest.fn().mockReturnValue({
          send: mockSend,
        }),
      };

      const token = await loginTestUser({
        api: mockApi,
        email: 'user@example.com',
        password: 'securePass123',
      });

      expect(mockApi.post).toHaveBeenCalledWith('/api/user/auth/login');
      expect(mockSend).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'securePass123',
      });
      expect(token).toBe('test-token');
    });
  });
});
